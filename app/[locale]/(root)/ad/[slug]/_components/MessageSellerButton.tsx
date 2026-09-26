"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  X,
  MessageCircle,
  MessageSquare,
  Phone,
  LogIn,
  Loader2,
} from "lucide-react";
import ChatThread from "@/components/messaging/ChatThread";
import type { MessageListingContext } from "@/lib/messaging/types";

interface Props {
  listingId: string;
  listingTitle: string;
  contactPhone: string | null;
  whatsappNumber: string | null;
}

export default function MessageSellerButton({
  listingId,
  listingTitle,
  contactPhone,
  whatsappNumber,
}: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [listingContext, setListingContext] =
    useState<MessageListingContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openChat = async () => {
    setLoading(true);
    setError("");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open chat");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setConversationId(null);
    setListingContext(null);
  };

  const contactButtons = (
    <div
      className={`grid gap-2 ${contactPhone && whatsappNumber ? "grid-cols-2" : "grid-cols-1"}`}
    >
      {contactPhone && (
        <a
          href={`tel:${contactPhone}`}
          className="flex items-center justify-center gap-2 py-2.5 border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-semibold rounded-lg transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Seller
        </a>
      )}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I saw your listing "${listingTitle}" on SLMarket.lk.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-semibold rounded-lg transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp
        </a>
      )}
    </div>
  );

  if (!session?.user) {
    return (
      <div className="space-y-2">
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Login to Message Seller
        </Link>
        {contactButtons}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={openChat}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
        Message Seller
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {contactButtons}

      {conversationId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="font-semibold text-text text-sm">
                Re: {listingTitle}
              </span>
              <button
                onClick={close}
                className="text-light-text hover:text-text"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatThread
                conversationId={conversationId}
                pendingListingContext={listingContext ?? undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
