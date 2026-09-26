"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, Gem, Loader2, Reply, X, ExternalLink, User } from "lucide-react";
import {
  ensureFirebaseAuth,
  subscribeToConversation,
  subscribeToMessages,
} from "@/lib/messaging/client";
import { useMessagingStore } from "@/store/messagingStore";
import { formatDistanceToNow } from "@/lib/utils/date";
import type {
  Conversation,
  Message,
  MessageListingContext,
  MessageReplyTo,
} from "@/lib/messaging/types";

interface Props {
  conversationId: string;
  // Set only when this ChatThread was opened via a specific listing's
  // "Message Seller" button — attached to the first message sent so that
  // message reads as "regarding this ad", the same way a reply reads as
  // "regarding that message".
  pendingListingContext?: MessageListingContext;
  // Pre-fills the composer (e.g. a ready-made "let's negotiate" message) —
  // the buyer can still edit or clear it before sending, never auto-sent.
  initialText?: string;
}

export default function ChatThread({
  conversationId,
  pendingListingContext,
  initialText,
}: Props) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const sendMessage = useMessagingStore((s) => s.sendMessage);
  const markConversationRead = useMessagingStore((s) => s.markConversationRead);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(initialText ?? "");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageReplyTo | null>(null);
  const [contextAttached, setContextAttached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubConversation: (() => void) | undefined;
    let unsubMessages: (() => void) | undefined;
    setLoading(true);

    ensureFirebaseAuth()
      .then(() => {
        unsubConversation = subscribeToConversation(
          conversationId,
          setConversation,
        );
        unsubMessages = subscribeToMessages(conversationId, (msgs) => {
          setMessages(msgs);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));

    return () => {
      unsubConversation?.();
      unsubMessages?.();
    };
  }, [conversationId]);

  useEffect(() => {
    setReplyingTo(null);
    setContextAttached(false);
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId, markConversationRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Every distinct listing referenced anywhere in this thread, in the order
  // it was first brought up — shown as a thin strip so both sides can see
  // every ad this conversation has touched, not just the latest one.
  const enquiredListings = useMemo(() => {
    const seen = new Map<string, MessageListingContext>();
    for (const message of messages) {
      if (message.listingContext && !seen.has(message.listingContext.id)) {
        seen.set(message.listingContext.id, message.listingContext);
      }
    }
    if (pendingListingContext && !seen.has(pendingListingContext.id)) {
      seen.set(pendingListingContext.id, pendingListingContext);
    }
    return [...seen.values()];
  }, [messages, pendingListingContext]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    const reply = replyingTo ?? undefined;
    const listingContext =
      pendingListingContext && !contextAttached
        ? pendingListingContext
        : undefined;
    setReplyingTo(null);
    setContextAttached(true);
    try {
      await sendMessage(conversationId, trimmed, reply, listingContext);
    } finally {
      setSending(false);
    }
  };

  if (!currentUserId) return null;

  const counterpartName = conversation
    ? conversation.buyerId === currentUserId
      ? conversation.sellerName
      : conversation.buyerName
    : "";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <p className="min-w-0 truncate text-sm font-semibold text-text">
          {counterpartName || "…"}
        </p>
      </div>

      {/* Thin strip of every listing this thread has touched — low-opacity
          context, not the main focus, like WhatsApp's quoted catalog item. */}
      {enquiredListings.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-b border-border bg-background/60 px-3 py-2 shrink-0">
          {enquiredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/ad/${listing.slug}`}
              target="_blank"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1 opacity-80 hover:opacity-100 transition-opacity"
            >
              <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-primary/10">
                {listing.image ? (
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Gem className="h-2.5 w-2.5 text-primary" />
                  </div>
                )}
              </div>
              <span className="max-w-[140px] truncate text-xs text-light-text">
                {listing.title}
              </span>
              <ExternalLink className="h-2.5 w-2.5 text-light-text shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-light-text" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-light-text py-8">
            No messages yet
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const replySenderLabel = message.replyTo
              ? message.replyTo.senderId === currentUserId
                ? "You"
                : counterpartName
              : "";

            return (
              <div
                key={message.id}
                className={`group flex items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {isOwn && (
                  <button
                    onClick={() =>
                      setReplyingTo({
                        messageId: message.id,
                        senderId: message.senderId,
                        text: message.text,
                      })
                    }
                    className="mb-1 opacity-0 group-hover:opacity-100 text-light-text hover:text-text transition-opacity"
                    aria-label="Reply"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </button>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isOwn ? "bg-primary text-white" : "bg-background text-text"
                  }`}
                >
                  {/* "Regarding this ad" — rendered exactly like a reply quote,
                      just pointing at a listing instead of an earlier message. */}
                  {message.listingContext && (
                    <Link
                      href={`/ad/${message.listingContext.slug}`}
                      target="_blank"
                      className={`mb-1.5 flex items-center gap-1.5 border-l-2 pl-2 text-xs hover:underline ${
                        isOwn
                          ? "border-white/50 text-white/80"
                          : "border-primary/50 text-light-text"
                      }`}
                    >
                      <span className="font-medium shrink-0">Re:</span>
                      <span className="truncate">
                        {message.listingContext.title}
                      </span>
                    </Link>
                  )}
                  {message.replyTo && (
                    <div
                      className={`mb-1.5 border-l-2 pl-2 text-xs ${
                        isOwn
                          ? "border-white/50 text-white/80"
                          : "border-primary/50 text-light-text"
                      }`}
                    >
                      <p className="font-medium">{replySenderLabel}</p>
                      <p className="truncate">{message.replyTo.text}</p>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  <p
                    className={`mt-1 text-[11px] ${isOwn ? "text-white/70" : "text-light-text"}`}
                  >
                    {message.createdAt
                      ? `${formatDistanceToNow(new Date(message.createdAt))} ago`
                      : "Sending…"}
                  </p>
                </div>
                {!isOwn && (
                  <button
                    onClick={() =>
                      setReplyingTo({
                        messageId: message.id,
                        senderId: message.senderId,
                        text: message.text,
                      })
                    }
                    className="mb-1 opacity-0 group-hover:opacity-100 text-light-text hover:text-text transition-opacity"
                    aria-label="Reply"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {replyingTo && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-2 bg-background/60 shrink-0">
          <Reply className="h-3.5 w-3.5 text-light-text shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text">
              Replying to{" "}
              {replyingTo.senderId === currentUserId
                ? "yourself"
                : counterpartName}
            </p>
            <p className="truncate text-xs text-light-text">
              {replyingTo.text}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-light-text hover:text-text shrink-0"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {pendingListingContext && !contextAttached && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-2 bg-background/60 shrink-0">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-primary/10">
            {pendingListingContext.image ? (
              <Image
                src={pendingListingContext.image}
                alt={pendingListingContext.title}
                fill
                sizes="24px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Gem className="h-3 w-3 text-primary" />
              </div>
            )}
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-light-text">
            Asking about{" "}
            <span className="font-medium text-text">
              {pendingListingContext.title}
            </span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border px-4 py-3 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50 hover:bg-primary-dark transition-colors"
          aria-label="Send"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
