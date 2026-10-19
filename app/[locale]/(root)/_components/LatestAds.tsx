"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GPS_COOKIE, PLACE_COOKIE, isDistrict } from "@/lib/listings/nearYou";
import { ListingCard } from "../ads/_components/ListingCard";
import type { AdCard } from "../ads/_components/data";
import {
  homeBadges,
  latestAds,
  LATEST_SHOWN,
  type LatestTab,
} from "../ads/_components/adQuery";

// A tab needs about two rows of ads to be worth showing.
export const LATEST_TAB_MIN = 8;

function readDistrictCookie(): string | null {
  for (const name of [GPS_COOKIE, PLACE_COOKIE]) {
    const hit = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`));
    const value = hit ? decodeURIComponent(hit.split("=")[1]) : null;
    if (isDistrict(value)) return value;
  }
  return null;
}

/*
 * Real ads on the first screen: the newest, featured ones, deals, or ads in
 * the visitor's district. A tab shows only with at least 8 ads; with just
 * one tab there is no tab row. Same cards and grid as /ads, in full rows on
 * every screen. `listings` arrives newest first.
 */
export function LatestAds({
  heading,
  newToday,
  listings,
  labels,
}: {
  heading: string;
  // "9 new today", or empty when the number is too small to show.
  newToday: string;
  listings: AdCard[];
  labels: {
    tabs: string;
    latest: string;
    featured: string;
    deals: string;
    nearIn: string; // "{district}" is filled in
    viewAll: string;
  };
}) {
  const [active, setActive] = useState<LatestTab>("latest");
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(readDistrictCookie()), []);

  const tabs = useMemo(() => {
    const all: { id: LatestTab; label: string }[] = [
      { id: "latest", label: labels.latest },
      { id: "featured", label: labels.featured },
      { id: "deals", label: labels.deals },
      ...(origin
        ? [
            {
              id: "near" as const,
              label: labels.nearIn.replace("{district}", origin),
            },
          ]
        : []),
    ];
    return all.filter(
      (t) =>
        t.id === "latest" ||
        latestAds(listings, t.id, origin, LATEST_SHOWN).length >=
          LATEST_TAB_MIN,
    );
  }, [labels, listings, origin]);

  const current = tabs.some((t) => t.id === active) ? active : "latest";
  const shown = useMemo(() => {
    const list = latestAds(listings, current, origin);
    return current === "latest" ? homeBadges(list, listings) : list;
  }, [listings, current, origin]);

  const viewAllHref =
    current === "deals"
      ? "/ads/deals"
      : current === "near" && origin
        ? `/ads?location=${encodeURIComponent(origin)}`
        : "/ads";

  if (listings.length === 0) return null;

  return (
    <section aria-labelledby="latest-heading">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="latest-heading"
          className="font-heading text-xl font-extrabold leading-tight tracking-tight text-[color:var(--color-market-text)] sm:text-3xl"
        >
          {heading}
        </h2>
        {newToday && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
            {newToday}
          </span>
        )}
      </div>

      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label={labels.tabs}
          className="scrollbar-hide -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          style={{
            maskImage:
              "linear-gradient(to right, black calc(100% - 24px), transparent)",
          }}
        >
          {tabs.map((t) => {
            const selected = t.id === current;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`latest-tab-${t.id}`}
                aria-selected={selected}
                aria-controls="latest-ads-panel"
                onClick={() => setActive(t.id)}
                className={`h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  selected
                    ? "border-[var(--color-market-blue)] bg-[var(--color-market-blue)] text-white"
                    : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[color:var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        id="latest-ads-panel"
        role={tabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={tabs.length > 1 ? `latest-tab-${current}` : undefined}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
      >
        {shown.map((listing, i) => (
          <div
            key={listing.id}
            className={
              i >= 8
                ? "hidden xl:block"
                : i >= 6
                  ? "hidden lg:block"
                  : undefined
            }
          >
            <ListingCard listing={listing} priority={i < 4} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href={viewAllHref}
          className="btn-outline inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-[15px] font-semibold sm:w-auto"
        >
          {labels.viewAll}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
