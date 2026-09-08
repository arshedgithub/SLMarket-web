"use client";

/*
 * "Follow on WhatsApp" button + a premium modal.
 *
 * ─── SETUP ────────────────────────────────────────────────────────────
 * 1. In WhatsApp: Updates tab → "+" → "New channel" (or open your
 *    existing channel → tap its name → "Channel info").
 * 2. Tap "Copy link". You get a URL like:
 *      https://whatsapp.com/channel/0029VaXXXXXXXXXXXXXXXXXX
 * 3. Put it in the environment (both local and production):
 *      NEXT_PUBLIC_WHATSAPP_CHANNEL_URL="https://whatsapp.com/channel/…"
 *    Until then the button falls back to WHATSAPP_CHANNEL_URL below.
 *
 * Behaviour:
 *  • Small screens / touch  → the button opens the channel link directly
 *    (WhatsApp handles it).
 *  • Desktop                → a modal with a scannable QR code, an
 *    "Open in WhatsApp" button and "Copy link".
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";
import { X, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";

export const WHATSAPP_CHANNEL_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ||
  "https://whatsapp.com/channel/0029VaSLMarketLKplaceholder";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.36c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.23.85 5.77 2.4a8.1 8.1 0 0 1 2.39 5.77c0 4.5-3.66 8.17-8.16 8.17Zm4.48-6.12c-.25-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.13-.16.25-.63.8-.77.96-.14.16-.28.18-.53.06-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.28.37-.42.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.44-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42l-.47-.01c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2.01 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.45-.59 1.66-1.16.2-.57.2-1.06.14-1.16-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

export function WhatsAppFollow({
  label = "Follow on WhatsApp",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none), (max-width: 767px)").matches;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleClick = () => {
    if (isTouch) {
      window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer");
    } else {
      setOpen(true);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(WHATSAPP_CHANNEL_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the Open button still works */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#1CA850] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(28,168,80,0.55)] transition hover:-translate-y-0.5 hover:bg-[#158A40] ${className}`}
      >
        <WhatsAppGlyph className="h-4 w-4" />
        {label}
        <ArrowRight className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Follow SLMarket.lk on WhatsApp"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[var(--color-market-surface)] shadow-2xl outline-none"
            >
              <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] px-6 pb-8 pt-6 text-center text-white">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <WhatsAppGlyph className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-lg font-bold">
                  Follow us on WhatsApp
                </h3>
                <p className="mt-1 text-sm text-white/85">
                  Scan with your phone&apos;s camera to open our channel, or use
                  the button below.
                </p>
              </div>

              <div className="px-6 pb-6">
                <div className="-mt-6 rounded-2xl border border-border bg-white p-4 shadow-lg">
                  <div className="mx-auto h-44 w-44">
                    <QRCode
                      value={WHATSAPP_CHANNEL_URL}
                      size={176}
                      style={{ height: "100%", width: "100%" }}
                      bgColor="#ffffff"
                      fgColor="#0b141a"
                    />
                  </div>
                </div>

                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:bg-[#1fbd5a]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in WhatsApp
                </a>

                <button
                  type="button"
                  onClick={copyLink}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:bg-background"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      Link copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy channel link
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-[var(--color-market-text-muted)]">
                  No spam. Only important updates.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
