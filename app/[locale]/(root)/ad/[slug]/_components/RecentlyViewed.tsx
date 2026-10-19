"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { trackAd } from "@/lib/listings/track";

export type RecentAd = {
  slug: string;
  title: string;
  priceText: string;
  photo: string | null;
  place: string;
};

const KEY = "slm:recent-ads";
const KEEP = 12;

function read(): RecentAd[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as RecentAd[];
  } catch {
    return [];
  }
}

// Counts the view (once per visitor per day, server side) and remembers
// the ad for "Recently viewed": on this device, and in the account when
// signed in (the API ignores guests).
export function AdViewTracker({
  ad,
  listingId,
}: {
  ad: RecentAd;
  listingId: string | null;
}) {
  useEffect(() => {
    trackAd("ad_view", { slug: ad.slug, listingId });
    try {
      const list = [ad, ...read().filter((r) => r.slug !== ad.slug)].slice(
        0,
        KEEP,
      );
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable */
    }
    void fetch("/api/ads/recent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ad),
      keepalive: true,
    }).catch(() => {});
  }, [ad, listingId]);
  return null;
}

// Returning visitors only: hidden until there is something to show. The
// account's list (every device) comes first, then this device's.
export function RecentlyViewed({
  currentSlug,
  heading,
  clearLabel,
}: {
  currentSlug: string;
  heading: string;
  // When given, a "Clear" link empties the list (here and in the account).
  clearLabel?: string;
}) {
  const [items, setItems] = useState<RecentAd[]>([]);
  useEffect(() => {
    const local = read();
    const show = (list: RecentAd[]) => {
      const seen = new Set<string>([currentSlug]);
      setItems(
        list
          .filter((r) => r.slug && !seen.has(r.slug) && seen.add(r.slug))
          .slice(0, 8),
      );
    };
    show(local);
    let cancelled = false;
    fetch("/api/ads/recent")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: RecentAd[] }) => {
        if (!cancelled && data.items?.length) show([...data.items, ...local]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentSlug]);
  if (items.length === 0) return null;

  const clear = () => {
    setItems([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
    void fetch("/api/ads/recent", { method: "DELETE" }).catch(() => {});
  };

  return (
    <section aria-labelledby="recent-heading" className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="recent-heading"
          className="font-heading text-lg font-extrabold tracking-tight text-[color:var(--color-market-text)] sm:text-xl"
        >
          {heading}
        </h2>
        {clearLabel && (
          <button
            type="button"
            onClick={clear}
            className="h-10 rounded-lg px-2 text-sm font-semibold text-[color:var(--color-market-text-secondary)] hover:text-blue-700"
          >
            {clearLabel}
          </button>
        )}
      </div>
      <ul className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {items.map((r) => (
          <li key={r.slug} className="w-[42%] shrink-0 snap-start sm:w-48">
            <Link
              href={`/ad/${r.slug}`}
              className="group block overflow-hidden rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)]"
            >
              <span className="relative block aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                {r.photo && (
                  <Image
                    src={r.photo}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="block p-2.5">
                <span className="block truncate text-sm font-semibold text-[color:var(--color-market-text)]">
                  {r.title}
                </span>
                <span className="block text-sm font-bold text-[color:var(--color-market-price)]">
                  {r.priceText}
                </span>
                <span className="block truncate text-xs text-[color:var(--color-market-text-secondary)]">
                  {r.place}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
