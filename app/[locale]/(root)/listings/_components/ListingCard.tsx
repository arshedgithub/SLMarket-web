"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, MapPin, Clock, Store as StoreIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SampleListing } from "./data";

const BADGE_CLS: Record<
  "featured" | "coupon" | "price-drop" | "negotiable",
  string
> = {
  featured: "bg-amber-500 text-white",
  coupon: "bg-blue-600 text-white",
  "price-drop": "bg-rose-600 text-white",
  negotiable: "bg-emerald-600 text-white",
};

function badgeKeyFor(listing: SampleListing) {
  if (listing.featured) return "featured" as const;
  if (listing.deal) return listing.deal;
  return null;
}

export function ListingCard({
  listing,
  view = "grid",
}: {
  listing: SampleListing;
  view?: "grid" | "list";
}) {
  const t = useTranslations("listings");
  const badgeKey = badgeKeyFor(listing);
  const badge = badgeKey
    ? { label: t(`card.${badgeKey}`), cls: BADGE_CLS[badgeKey] }
    : null;
  const detailHref = `/listings/${listing.categoryId}?q=${encodeURIComponent(listing.title)}`;

  if (view === "list") {
    return (
      <Link
        href={detailHref}
        className="market-listing-card group flex gap-3 p-2.5 sm:gap-4 sm:p-3"
      >
        <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40 dark:bg-slate-800">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="160px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {badge && (
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm ${badge.cls}`}
            >
              {badge.label}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-[var(--color-market-text)] sm:text-base">
              {listing.title}
            </h3>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              aria-label={t("card.saveListing")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-market-text-muted)]">
            <MapPin className="h-3 w-3" />
            {listing.location}
            {listing.sellerType === "shop" && (
              <span className="ml-1 flex items-center gap-0.5 text-blue-600">
                <StoreIcon className="h-3 w-3" /> {t("card.shop")}
              </span>
            )}
          </p>

          <p className="mt-1.5 flex items-baseline gap-2 text-lg font-bold text-[#1557d6]">
            {listing.priceLabel}
            {listing.originalPriceLabel && (
              <span className="text-xs font-medium text-[var(--color-market-text-muted)] line-through">
                {listing.originalPriceLabel}
              </span>
            )}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            {listing.attrs.slice(0, 3).map((attr) => (
              <span
                key={attr}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                {attr}
              </span>
            ))}
            <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--color-market-text-muted)]">
              <Clock className="h-3 w-3" />
              {listing.postedAgo}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={detailHref} className="market-listing-card group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {badge && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          aria-label={t("card.saveListing")}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:text-rose-500 dark:bg-slate-900/90"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold text-[var(--color-market-text)]">
          {listing.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-market-text-muted)]">
          <MapPin className="h-3 w-3" />
          {listing.location}
        </p>

        <p className="mt-2 flex items-baseline gap-2 text-base font-bold text-[#1557d6]">
          {listing.priceLabel}
          {listing.originalPriceLabel && (
            <span className="text-[11px] font-medium text-[var(--color-market-text-muted)] line-through">
              {listing.originalPriceLabel}
            </span>
          )}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {listing.attrs.slice(0, 3).map((attr) => (
            <span
              key={attr}
              className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {attr}
            </span>
          ))}
        </div>

        <p className="mt-2.5 flex items-center gap-1 text-[11px] text-[var(--color-market-text-muted)]">
          <Clock className="h-3 w-3" />
          {listing.postedAgo}
        </p>
      </div>
    </Link>
  );
}
