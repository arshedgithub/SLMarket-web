"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LocateFixed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  GPS_COOKIE,
  PLACE_COOKIE,
  isDistrict,
  nearestDistrict,
  rememberGpsDistrict,
} from "@/lib/listings/nearYou";
import { ListingCard } from "../ads/_components/ListingCard";
import type { AdCard } from "../ads/_components/data";
import {
  homeBadges,
  latestAds,
  type LatestTab,
} from "../ads/_components/adQuery";

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
 * Real ads on the first screen: the newest, the featured ones, deals, or
 * ads in the visitor's district. Same cards and grid as /ads, in full rows
 * on every screen (6 on phones and tablets, 8 on laptops, 10 on desktops).
 * `listings` arrives newest first.
 */
export function LatestAds({
  heading,
  listings,
  labels,
}: {
  heading: string;
  listings: AdCard[];
  labels: {
    tabs: string;
    latest: string;
    featured: string;
    deals: string;
    near: string;
    nearIn: string; // "{district}" is filled in
    nearEmpty: string;
    nearAsk: string;
    useMyLocation: string;
    chooseDistrict: string;
    viewAll: string;
  };
}) {
  const [active, setActive] = useState<LatestTab>("latest");
  const [origin, setOrigin] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => setOrigin(readDistrictCookie()), []);

  const tabs = useMemo(() => {
    const all: { id: LatestTab; label: string }[] = [
      { id: "latest", label: labels.latest },
      { id: "featured", label: labels.featured },
      { id: "deals", label: labels.deals },
      {
        id: "near",
        label: origin
          ? labels.nearIn.replace("{district}", origin)
          : labels.near,
      },
    ];
    // A tab with nothing in it is a dead end.
    return all.filter(
      (t) =>
        (t.id !== "featured" || listings.some((l) => l.featured)) &&
        (t.id !== "deals" || listings.some((l) => l.deal)),
    );
  }, [labels, listings, origin]);

  const shown = useMemo(() => {
    const list = latestAds(listings, active, origin);
    return active === "latest" ? homeBadges(list, listings) : list;
  }, [listings, active, origin]);

  const viewAllHref =
    active === "deals"
      ? "/ads/deals"
      : active === "near" && origin
        ? `/ads?location=${encodeURIComponent(origin)}`
        : "/ads";

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
        rememberGpsDistrict(d);
        setOrigin(d);
        setLocating(false);
      },
      () => setLocating(false),
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }

  return (
    <div>
      <h2 className="font-heading mb-4 text-xl font-extrabold leading-tight tracking-tight text-[color:var(--color-market-text)] sm:text-3xl">
        {heading}
      </h2>

      <div
        role="tablist"
        aria-label={labels.tabs}
        className="scrollbar-hide -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
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

      <div
        id="latest-ads-panel"
        role="tabpanel"
        aria-labelledby={`latest-tab-${active}`}
      >
        {active === "near" && shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] px-6 py-12 text-center">
            <p className="max-w-md text-[15px] text-[color:var(--color-market-text-secondary)]">
              {origin
                ? labels.nearEmpty.replace("{district}", origin)
                : labels.nearAsk}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {!origin && (
                <button
                  type="button"
                  onClick={locate}
                  disabled={locating}
                  className="btn-solid inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
                >
                  <LocateFixed
                    aria-hidden
                    className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`}
                  />
                  {labels.useMyLocation}
                </button>
              )}
              <Link
                href="/ads"
                className="btn-outline inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold"
              >
                {labels.chooseDistrict}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
        )}
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
    </div>
  );
}
