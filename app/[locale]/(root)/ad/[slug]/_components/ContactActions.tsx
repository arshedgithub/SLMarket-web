"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Loader2, MessageCircle, Phone, Share2, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import ChatThread from "@/components/messaging/ChatThread";
import type { MessageListingContext } from "@/lib/messaging/types";
import { trackAd } from "@/lib/listings/track";
import { useSavedAd } from "@/lib/listings/savedAds";
import { EmailCheckDialog, type EmailCheckLabels } from "./EmailCheckDialog";

export type ContactLabels = {
  whatsapp: string;
  askNext: string;
  showNumber: string;
  call: string;
  chat: string;
  save: string;
  saved: string;
  share: string;
  copied: string;
  tooMany: string;
  failed: string;
  close: string;
  emailCheck: EmailCheckLabels;
};

export type ContactProps = {
  listingId: string;
  slug: string;
  title: string;
  priceText: string;
  url: string;
  // Business ads carry their number in the page; a private seller's number
  // only ever comes from /api/ads/reveal (signed in, or email checked).
  publicPhone: string | null;
  publicWhatsapp: string | null;
  privateNumber: boolean;
  canChat: boolean;
  // Reserved: contact stays open, framed as asking to be next.
  reserved: boolean;
  labels: ContactLabels;
};

function waLink(
  number: string,
  p: Pick<ContactProps, "title" | "priceText" | "url" | "reserved">,
) {
  const text = p.reserved
    ? `Hi, I see your ad "${p.title}" on SLMarket.lk is reserved. If the sale falls through, I would like to be next: ${p.url}`
    : `Hi, I'm interested in your ad "${p.title}" (${p.priceText}) on SLMarket.lk: ${p.url}`;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

type Action = "whatsapp" | "number" | "call";

function useContact(p: ContactProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [number, setNumber] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | Action | "chat">(null);
  const [error, setError] = useState("");
  const [chat, setChat] = useState<{
    id: string;
    context: MessageListingContext | null;
  } | null>(null);
  // The action waiting for the guest's email check.
  const [pending, setPending] = useState<Action | null>(null);

  const toSignIn = () =>
    router.push(`/login?next=${encodeURIComponent(pathname)}`);

  // Every reveal goes through the API so it is counted as a lead.
  async function reveal(action: Action): Promise<string | null> {
    if (number) return number;
    const res = await fetch("/api/ads/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: p.slug }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && data.phone) {
      setNumber(data.phone);
      return data.phone as string;
    }
    if (data.requiresVerification) setPending(action);
    else if (data.requiresSignIn) toSignIn();
    else setError(res?.status === 429 ? p.labels.tooMany : p.labels.failed);
    return null;
  }

  async function run(action: Action) {
    setError("");
    setBusy(action);
    const n = await reveal(action);
    setBusy(null);
    if (!n) return;
    if (action === "whatsapp") window.location.href = waLink(n, p);
    if (action === "call")
      window.location.href = `tel:+${n.replace(/\D/g, "")}`;
  }

  function onWhatsapp(e: React.MouseEvent) {
    trackAd("whatsapp_click", { slug: p.slug, reserved: p.reserved });
    if (p.publicWhatsapp) return; // a plain link
    e.preventDefault();
    void run("whatsapp");
  }

  function onShowNumber(call: boolean) {
    trackAd(call ? "call_click" : "contact_reveal", { slug: p.slug });
    void run(call ? "call" : "number");
  }

  async function onChat() {
    trackAd("chat_open", { slug: p.slug, signedIn: !!session?.user });
    if (!session?.user) return toSignIn();
    setBusy("chat");
    setError("");
    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: p.listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setChat({
        id: data.conversationId,
        context: data.listingContext ?? null,
      });
    } catch {
      setError(p.labels.failed);
    } finally {
      setBusy(null);
    }
  }

  const emailDialog = pending && (
    <EmailCheckDialog
      labels={p.labels.emailCheck}
      onClose={() => setPending(null)}
      onVerified={() => {
        const action = pending;
        setPending(null);
        void run(action);
      }}
    />
  );

  return {
    number,
    busy,
    error,
    chat,
    setChat,
    onWhatsapp,
    onShowNumber,
    onChat,
    emailDialog,
  };
}

function WhatsappIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 6 6 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c1.9.8 2.6.9 3.6.7a3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c0-.2-.3-.3-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.9 18l-1.7 6 6.2-1.6A11.8 11.8 0 1 0 12 .2z" />
    </svg>
  );
}

function ChatModal({
  chat,
  onClose,
  closeLabel,
  title,
}: {
  chat: { id: string; context: MessageListingContext | null };
  onClose: () => void;
  closeLabel: string;
  title: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-[var(--color-market-surface)] shadow-2xl sm:h-[600px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-market-border)] px-4 py-3">
          <p className="truncate text-sm font-semibold text-[color:var(--color-market-text)]">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <ChatThread
            conversationId={chat.id}
            pendingListingContext={chat.context ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}

const PRIMARY =
  "flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1fa855] px-4 text-white shadow-[0_8px_20px_rgba(31,168,85,0.25)] transition hover:bg-[#178f47]";
const SECONDARY =
  "flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] px-3 text-[color:var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-60";

function WhatsappButton({
  p,
  c,
  className,
}: {
  p: ContactProps;
  c: ReturnType<typeof useContact>;
  className: string;
}) {
  return (
    <a
      href={p.publicWhatsapp ? waLink(p.publicWhatsapp, p) : "#"}
      target={p.publicWhatsapp ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={c.onWhatsapp}
      className={`${PRIMARY} ${className}`}
    >
      {c.busy === "whatsapp" ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <WhatsappIcon className="h-5 w-5" />
      )}
      <span className="text-[15px] font-semibold">
        {p.reserved ? p.labels.askNext : p.labels.whatsapp}
      </span>
    </a>
  );
}

export function ContactPanel(p: ContactProps) {
  const c = useContact(p);
  const L = p.labels;
  const showWhatsapp = !!p.publicWhatsapp || p.privateNumber;
  const showNumber = !!p.publicPhone || p.privateNumber;

  return (
    <div className="space-y-2.5">
      {showWhatsapp && <WhatsappButton p={p} c={c} className="w-full" />}
      <div
        className={`grid gap-2.5 ${showNumber && p.canChat ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {showNumber &&
          (c.number ? (
            <a
              href={`tel:+${c.number.replace(/\D/g, "")}`}
              onClick={() => trackAd("call_click", { slug: p.slug })}
              className={`${SECONDARY} tabular-nums text-blue-700`}
            >
              <Phone aria-hidden className="h-4 w-4" />
              <span className="text-sm font-semibold">+{c.number}</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => c.onShowNumber(false)}
              disabled={c.busy === "number"}
              className={SECONDARY}
            >
              {c.busy === "number" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone aria-hidden className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">{L.showNumber}</span>
            </button>
          ))}
        {p.canChat && (
          <button
            type="button"
            onClick={c.onChat}
            disabled={c.busy === "chat"}
            className={SECONDARY}
          >
            {c.busy === "chat" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle aria-hidden className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">{L.chat}</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <SaveShare
          slug={p.slug}
          title={p.title}
          url={p.url}
          labels={p.labels}
        />
      </div>
      {c.error && (
        <p role="status" className="text-xs text-red-600">
          {c.error}
        </p>
      )}
      {c.chat && (
        <ChatModal
          chat={c.chat}
          onClose={() => c.setChat(null)}
          closeLabel={L.close}
          title={p.title}
        />
      )}
      {c.emailDialog}
    </div>
  );
}

// Phones: a sticky bar in place of the bottom navigation.
export function ContactBar(p: ContactProps) {
  const c = useContact(p);
  const L = p.labels;
  const showWhatsapp = !!p.publicWhatsapp || p.privateNumber;
  const showNumber = !!p.publicPhone || p.privateNumber;
  if (!showWhatsapp && !showNumber && !p.canChat) return null;
  const icon =
    "flex h-12 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-[var(--color-market-border-strong)] text-[color:var(--color-market-text)] disabled:opacity-60";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className="flex items-center gap-2">
        {showWhatsapp && <WhatsappButton p={p} c={c} className="flex-1" />}
        {showNumber && (
          <button
            type="button"
            onClick={() => c.onShowNumber(true)}
            disabled={c.busy === "call"}
            className={icon}
          >
            {c.busy === "call" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Phone aria-hidden className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold leading-none">{L.call}</span>
          </button>
        )}
        {p.canChat && (
          <button
            type="button"
            onClick={c.onChat}
            disabled={c.busy === "chat"}
            className={icon}
          >
            {c.busy === "chat" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle aria-hidden className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold leading-none">{L.chat}</span>
          </button>
        )}
      </div>
      {c.error && (
        <p role="status" className="mt-1 text-center text-xs text-red-600">
          {c.error}
        </p>
      )}
      {c.chat && (
        <ChatModal
          chat={c.chat}
          onClose={() => c.setChat(null)}
          closeLabel={L.close}
          title={p.title}
        />
      )}
      {c.emailDialog}
    </div>
  );
}

/*
 * Save and Share. Saves go through the shared store (lib/listings/savedAds:
 * the account when signed in, the device for guests). Share uses the
 * native sheet, else copies.
 */
export function SaveShare({
  slug,
  title,
  url,
  labels,
  compact = false,
}: Pick<ContactProps, "slug" | "title" | "url" | "labels"> & {
  compact?: boolean;
}) {
  const { saved, toggle: toggleSave } = useSavedAd(slug);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    trackAd("share", { slug });
    try {
      if (navigator.share) return await navigator.share({ title, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed */
    }
  };

  const base = compact
    ? "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md"
    : SECONDARY;

  return (
    <>
      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={compact ? (saved ? labels.saved : labels.save) : undefined}
        className={base}
      >
        <Heart
          aria-hidden
          className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
        />
        {!compact && (
          <span className="text-sm font-semibold">
            {saved ? labels.saved : labels.save}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={share}
        aria-label={compact ? labels.share : undefined}
        className={base}
      >
        <Share2 aria-hidden className="h-4 w-4" />
        {!compact && (
          <span className="text-sm font-semibold">
            {copied ? labels.copied : labels.share}
          </span>
        )}
      </button>
    </>
  );
}
