"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ShopCard } from "./data";

// Fewer than this and the strip is not shown (a "featured" row of one or
// two businesses looks empty).
export const STRIP_MIN_BUSINESSES = 3;

function TierPill({ tier }: { tier: ShopCard["tier"] }) {
  const t = useTranslations("listings");
  if (tier === "premium") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-market-gold-soft)] px-2.5 py-1 text-xs font-bold text-[color:var(--color-market-gold-text)] shadow-sm ring-1 ring-[color:var(--color-market-gold-line)]">
        <Crown aria-hidden className="h-3.5 w-3.5" />
        {t("shops.tier.premium")}
      </span>
    );
  }
  if (tier === "toprated") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
        <Award
          aria-hidden
          className="h-3.5 w-3.5 text-[color:var(--color-market-gold-text)]"
        />
        {t("shops.tier.toprated")}
      </span>
    );
  }
  return null;
}

function BusinessCard({ shop }: { shop: ShopCard }) {
  const t = useTranslations("listings");

  return (
    <Link
      href={`/business/${shop.slug}`}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,33,63,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <div className="relative h-28 shrink-0 bg-slate-100 dark:bg-slate-800">
        {shop.cover ? (
          <Image
            src={shop.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 85vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
          />
        )}
        <div className="absolute right-2 top-2">
          <TierPill tier={shop.tier} />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-4 pb-4">
        {/* Real logo in a neutral ring; grey initials only as a fallback. */}
        <span className="absolute -top-7 left-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-[var(--color-market-surface)] bg-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
          {shop.logo ? (
            <Image
              src={shop.logo}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {shop.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>

        <div className="pt-9">
          <p className="flex items-center gap-1.5 text-[15px] font-bold text-[var(--color-market-text)]">
            <span className="truncate">{shop.name}</span>
            {shop.verified && (
              <BadgeCheck
                aria-label={t("card.verifiedTip")}
                className="h-4 w-4 shrink-0 fill-blue-600 text-white"
              >
                <title>{t("card.verifiedTip")}</title>
              </BadgeCheck>
            )}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-[var(--color-market-text-secondary)]">
            {shop.category}
            {shop.location ? ` · ${shop.location}` : ""}
          </p>
          {shop.tagline && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-[var(--color-market-text-secondary)]">
              {shop.tagline}
            </p>
          )}
        </div>

        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-blue-700 group-hover:text-blue-800 dark:text-blue-300">
          {t("shops.viewAds", { count: shop.listings })}
          <ChevronRight
            aria-hidden
            className="h-4 w-4 transition group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

/*
 * Featured businesses: paid tiers, in tier order then the daily rotation
 * (lib/listings/feed.ts featuredStripShops + rankShops). Whole cards per
 * breakpoint (4 desktop, 3 tablet, one and a bit on phones), snapping,
 * with 40px arrows only when there is something to scroll to. Businesses
 * already shown in a spotlight slot on the page are left out, and with
 * fewer than 3 left the strip is not shown at all.
 */
export function FeaturedBusinessesStrip({
  shops,
  hideIds = [],
}: {
  shops: ShopCard[];
  hideIds?: string[];
}) {
  const t = useTranslations("listings");
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const shown = shops.filter((s) => !hideIds.includes(s.id));

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(overflow > 4 && el.scrollLeft < overflow - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, [update, shown.length]);

  if (shown.length < STRIP_MIN_BUSINESSES) return null;

  const scrollBy = (dir: 1 | -1) =>
    ref.current?.scrollBy({
      left: dir * ref.current.clientWidth,
      behavior: "smooth",
    });

  const scrollable = canLeft || canRight;
  const arrowCls =
    "hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 sm:flex";
  const fade = `linear-gradient(to right, ${canLeft ? "transparent, black 24px" : "black"}, ${
    canRight ? "black calc(100% - 24px), transparent" : "black"
  })`;

  return (
    <section aria-labelledby="featured-businesses">
      <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2
            id="featured-businesses"
            className="font-heading text-xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-2xl"
          >
            {t("shops.heading")}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-market-text-secondary)]">
            {t("shops.subheading")}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300"
          >
            {t("shops.exploreAll")}
            <ChevronRight aria-hidden className="h-4 w-4" />
          </Link>
          {scrollable && (
            <>
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={!canLeft}
                aria-label={t("shops.scrollLeft")}
                className={arrowCls}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={!canRight}
                aria-label={t("shops.scrollRight")}
                className={arrowCls}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={ref}
        className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 pt-1 sm:gap-4"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        {shown.map((shop) => (
          <div
            key={shop.id}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
          >
            <BusinessCard shop={shop} />
          </div>
        ))}
      </div>
    </section>
  );
}
