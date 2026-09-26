"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Handshake, MessageCircle, X, Loader2 } from "lucide-react";
import ChatThread from "@/components/messaging/ChatThread";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { MessageListingContext } from "@/lib/messaging/types";

interface NegotiateButtonProps {
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  whatsappNumber?: string | null;
  className?: string;
}

export function NegotiateButton({
  listingId,
  listingSlug,
  listingTitle,
  whatsappNumber,
  className = "",
}: NegotiateButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showChooser, setShowChooser] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [listingContext, setListingContext] =
    useState<MessageListingContext | null>(null);
  const [loading, setLoading] = useState(false);

  const negotiateMessage = `Hi, I'm interested in "${listingTitle}".\nWould you be open to negotiating on the price?`;

  const startChat = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setConversationId(data.conversationId);
      setListingContext(data.listingContext);
      setShowChooser(false);
    } catch {
      // Swallowed — chat just won't open; the button stays clickable to retry.
    } finally {
      setLoading(false);
    }
  };

  const openWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!whatsappNumber) return;
    window.open(
      `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(negotiateMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setShowChooser(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Cards wrap their whole body in a <Link> to the listing — this button
    // sits inside that link, so it must stop the click from also navigating.
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(`/ad/${listingSlug}`)}`);
      return;
    }

    if (whatsappNumber) {
      setShowChooser(true);
    } else {
      startChat();
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        <Handshake className="h-3.5 w-3.5" />
        Negotiate Price
      </button>

      {showChooser && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowChooser(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-text">
              Negotiate the price
            </p>
            <p className="mt-1 text-xs text-light-text">
              Choose how you&apos;d like to reach the seller.
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={startChat}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                Message Seller
              </button>
              <button
                type="button"
                onClick={openWhatsapp}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500 py-2.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChooser(false);
                }}
                className="w-full rounded-lg py-2.5 text-sm font-medium text-light-text transition-colors hover:bg-background"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {conversationId && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setConversationId(null);
          }}
        >
          <div
            className="flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-text">
                Re: {listingTitle}
              </span>
              <button
                onClick={() => setConversationId(null)}
                className="text-light-text hover:text-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ChatThread
                conversationId={conversationId}
                pendingListingContext={listingContext ?? undefined}
                initialText={negotiateMessage}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
