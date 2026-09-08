"use client";

/*
 * TEMPORARY pre-launch modal.
 *
 * Shows the "coming soon" social post over the site with no way to close it
 * (no X, no click-outside, no Escape) because the site is not live yet. The
 * page stays visible and scrollable behind it on desktop as a teaser, but
 * every link/button behind is disabled (see components/layout/layout.tsx).
 *
 * Gated by NEXT_PUBLIC_COMING_SOON in the environment. On launch day set it
 * to "false" (or delete the var); nothing else needs to change. This whole
 * file can then be deleted along with the one render site in layout.tsx.
 */

import { useEffect, useState } from "react";
import Image from "next/image";

const WHATSAPP_CHANNEL_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ||
  "https://whatsapp.com/channel/0029VaSLMarketLKplaceholder";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100084445023354";

const SOCIALS: {
  label: string;
  src: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}[] = [
  {
    label: "Facebook",
    src: "/images/social/facebook.webp",
    href: FACEBOOK_URL,
    onClick: (e) => {
      // On a phone, hand off to the native app; fall back to the web page.
      if (typeof navigator === "undefined") return;
      if (!/android|iphone|ipad|ipod/i.test(navigator.userAgent)) return;
      e.preventDefault();
      const start = Date.now();
      setTimeout(() => {
        if (Date.now() - start < 1600) window.location.href = FACEBOOK_URL;
      }, 900);
      window.location.href = `fb://facewebmodal/f?href=${encodeURIComponent(
        FACEBOOK_URL,
      )}`;
      window.location.href = "fb://profile/100084445023354";
    },
  },
  {
    label: "Instagram",
    src: "/images/social/instagram.webp",
    href: "https://www.instagram.com/slmarketlk/",
  },
  {
    label: "TikTok",
    src: "/images/social/tiktok.webp",
    href: "https://www.tiktok.com/@slmarketlk",
  },
  {
    label: "WhatsApp",
    src: "/images/social/whatsapp.webp",
    href: WHATSAPP_CHANNEL_URL,
  },
];

export function ComingSoonModal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock the page entirely on small screens (no teaser scroll there).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SLMarket.lk is launching soon"
      className="pointer-events-none fixed inset-0 z-[9998] bg-slate-950/55 backdrop-blur-[2px]"
    >
      <div className="pointer-events-auto absolute inset-0 flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:items-center sm:p-6 md:pointer-events-none">
        <div className="pointer-events-auto my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-[#101c30]">
          <div className="relative aspect-[4/5] w-full bg-slate-100 dark:bg-slate-800">
            <Image
              src="/images/opening.webp"
              alt="SLMarket.lk is coming soon"
              fill
              priority
              sizes="(max-width: 480px) 92vw, 440px"
              className="object-cover"
            />
          </div>

          <div className="px-6 py-6 text-center sm:px-8">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              We are not live just yet. Follow us and be the first to know the
              moment we open, plus early deals and updates.
            </p>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Follow us
            </p>

            <div className="mt-3 flex items-center justify-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  onClick={s.onClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow SLMarket.lk on ${s.label}`}
                  className="transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  <Image
                    src={s.src}
                    alt={s.label}
                    width={48}
                    height={48}
                    className="h-11 w-11 drop-shadow-sm"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
