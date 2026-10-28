import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin, sendFcmToMultiple } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import type {
  MessageListingContext,
  MessageReplyTo,
  NotificationType,
} from "@/lib/messaging/types";

interface GetOrCreateConversationInput {
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
}

// One conversation per (buyer, seller) pair — a thread with a person, not a
// listing. Enquiring again (same listing or a different one) continues the
// same thread; which listings were discussed lives on the messages themselves
// (see appendMessage's listingContext), not on the conversation doc.
export async function getOrCreateConversation(
  input: GetOrCreateConversationInput,
): Promise<string> {
  const firestore = getFirestoreAdmin();
  const conversations = firestore.collection("conversations");

  const existing = await conversations
    .where("buyerId", "==", input.buyerId)
    .where("sellerId", "==", input.sellerId)
    .limit(1)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const doc = await conversations.add({
    participants: [input.buyerId, input.sellerId],
    buyerId: input.buyerId,
    buyerName: input.buyerName,
    sellerId: input.sellerId,
    sellerName: input.sellerName,
    lastMessage: "",
    lastMessageAt: FieldValue.serverTimestamp(),
    lastSenderId: "",
    unread: { [input.buyerId]: 0, [input.sellerId]: 0 },
    createdAt: FieldValue.serverTimestamp(),
  });

  return doc.id;
}

interface ConversationData {
  participants: [string, string];
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
}

export async function getConversation(
  conversationId: string,
): Promise<ConversationData> {
  const firestore = getFirestoreAdmin();
  const snap = await firestore
    .collection("conversations")
    .doc(conversationId)
    .get();
  if (!snap.exists) throw new Error("Conversation not found");
  const data = snap.data()!;
  return {
    participants: data.participants,
    buyerId: data.buyerId,
    buyerName: data.buyerName,
    sellerId: data.sellerId,
    sellerName: data.sellerName,
    lastMessage: data.lastMessage ?? "",
  };
}

// Appends a message and updates conversation metadata + the recipient's unread count.
// `listingContext`, when provided, marks this message as "regarding this ad" —
// it's attached by the caller whenever the sender opened the chat from a
// specific listing's "Message Seller" button, regardless of whether the
// thread is brand new or continuing. Returns enough context for callers to
// fan out notifications / backfill the per-listing Enquiry record.
export async function appendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  replyTo?: MessageReplyTo,
  listingContext?: MessageListingContext,
): Promise<{ recipientId: string; conversation: ConversationData }> {
  const firestore = getFirestoreAdmin();
  const conversationRef = firestore
    .collection("conversations")
    .doc(conversationId);

  return firestore.runTransaction(async (tx) => {
    const snap = await tx.get(conversationRef);
    if (!snap.exists) throw new Error("Conversation not found");
    const data = snap.data()!;
    const participants = data.participants as [string, string];

    if (!participants.includes(senderId)) {
      throw new Error("Sender is not a participant in this conversation");
    }
    const recipientId = participants.find((id) => id !== senderId)!;

    tx.create(conversationRef.collection("messages").doc(), {
      senderId,
      text,
      createdAt: FieldValue.serverTimestamp(),
      ...(replyTo ? { replyTo } : {}),
      ...(listingContext ? { listingContext } : {}),
    });

    tx.update(conversationRef, {
      lastMessage: text,
      lastMessageAt: FieldValue.serverTimestamp(),
      lastSenderId: senderId,
      [`unread.${recipientId}`]: FieldValue.increment(1),
    });

    return {
      recipientId,
      conversation: {
        participants,
        buyerId: data.buyerId,
        buyerName: data.buyerName,
        sellerId: data.sellerId,
        sellerName: data.sellerName,
        lastMessage: data.lastMessage ?? "",
      },
    };
  });
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const firestore = getFirestoreAdmin();
  await firestore
    .collection("conversations")
    .doc(conversationId)
    .update({ [`unread.${userId}`]: 0 });
}

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  // For type "message" — lets repeated messages in the same conversation
  // merge into one notification ("3 new messages") instead of piling up.
  conversationId?: string;
}

// Writes the in-app notification doc and, best-effort, fans out an FCM push for
// when the recipient's tab is closed/backgrounded. Stale device tokens are pruned.
//
// Message notifications from the same still-unread conversation are merged
// into a single doc (count incremented, body/timestamp bumped) instead of
// piling up one notification per message — matches how WhatsApp/Messenger
// group rapid messages from the same person.
export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  const firestore = getFirestoreAdmin();
  const itemsRef = firestore
    .collection("notifications")
    .doc(input.userId)
    .collection("items");

  let count = 1;

  if (input.type === "message" && input.conversationId) {
    const existing = await itemsRef
      .where("conversationId", "==", input.conversationId)
      .where("read", "==", false)
      .limit(1)
      .get();

    if (!existing.empty) {
      count = (existing.docs[0].data().count ?? 1) + 1;
      await existing.docs[0].ref.update({
        title: input.title,
        body: input.body,
        link: input.link,
        count,
        createdAt: FieldValue.serverTimestamp(),
      });
      await fanOutPush(input, count);
      return;
    }
  }

  await itemsRef.add({
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
    read: false,
    count,
    ...(input.conversationId ? { conversationId: input.conversationId } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });

  await fanOutPush(input, count);
}

async function fanOutPush(
  input: CreateNotificationInput,
  count: number,
): Promise<void> {
  const tokens = await db.fcmToken.findMany({
    where: { userId: input.userId },
    select: { token: true },
  });
  if (tokens.length === 0) return;

  const title = count > 1 ? `${input.title} (${count})` : input.title;

  try {
    const { invalidTokens } = await sendFcmToMultiple(
      tokens.map((t) => t.token),
      title,
      input.body,
      { link: input.link },
    );
    if (invalidTokens.length > 0) {
      await db.fcmToken.deleteMany({ where: { token: { in: invalidTokens } } });
    }
  } catch {
    // Push delivery is best-effort; the in-app notification above already succeeded.
  }
}
