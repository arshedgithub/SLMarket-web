"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ListingCard } from "../../../ads/_components/ListingCard";
import type { AdCard } from "../../../ads/_components/data";
import { trackAd } from "@/lib/listings/track";

/*
 * A row of ad cards under the ad. Phones: a sideways scroll with part of
 * the next card showing. Clicks are counted per row (and per fallback
 * level for "Similar ads", to see whether levels 3 and 4 earn their place).
 */
export function RecoRow({
  id,
  heading,
  ads,
  event,
  data,
  viewAll,
  headingAside,
}: {
  id: string;
  heading: string;
  ads: AdCard[];
  event: string;
  data: Record<string, string | number>;
  viewAll?: { href: string; label: string };
  // Next to the heading, e.g. "Use my location".
  headingAside?: ReactNode;
}) {
  if (ads.length === 0) return null;
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2
          id={`${id}-heading`}
          className="font-heading text-lg font-extrabold tracking-tight text-[color:var(--color-market-text)] sm:text-xl"
        >
          {heading}
        </h2>
        <div className="flex shrink-0 items-center gap-4">
          {headingAside}
          {viewAll && (
            <Link
              href={viewAll.href}
              className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span className="text-sm font-semibold">{viewAll.label}</span>
            </Link>
          )}
        </div>
      </div>
      <ul className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {ads.map((ad) => (
          <li
            key={ad.id}
            className="w-[46%] shrink-0 snap-start sm:w-auto"
            onClickCapture={() => trackAd(event, { ...data, to: ad.slug })}
          >
            <ListingCard listing={ad} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// A link that reports a click (view business, report, safety tips).
export function TrackLink({
  href,
  event,
  data,
  className,
  children,
}: {
  href: string;
  event: string;
  data: Record<string, string>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackAd(event, data)}
    >
      {children}
    </Link>
  );
}
