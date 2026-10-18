"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, Star, Store } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { labelForSurface, responseLabelFor } from "@/lib/business/responseTime";
import { sampleListings, type SampleListing, type SampleShop } from "./data";
import { businessHref } from "@/lib/business/slug";
import { AVATAR_TONE } from "./avatarTone";
import {
  PremiumBusinessCard,
  PremiumBusinessCardSkeleton,
} from "./PremiumBusinessCard";

/*
 * TWO sponsored units per page of 28 ads, always after the 8th and the 20th
 * ad, in every view and on every device. Only the container adapts:
 *   premium  grid, every width: one business on the premium card, spanning
 *            2 cells (the whole row on the 2 column phone grid). The grid
 *            uses dense flow, so a span that would start in the last column
 *            moves to the next row and the following ad fills the gap.
 *   row3     desktop list: a row of up to 3 businesses
 *   scroll   mobile list: a snap-scrolling row
 * A page view never changes its sponsored businesses. New businesses come
 * with a new page, a refresh or a new visit (see useSponsoredOrder).
 */

export type SponsoredLayout = "premium" | "row3" | "scroll";

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export const useIsMdUp = () => useMedia("(min-width: 768px)");

export function sponsoredLayoutFor(
  view: "grid" | "list",
  mdUp: boolean,
): SponsoredLayout {
  if (view === "grid") return "premium";
  return mdUp ? "row3" : "scroll";
}

export function sponsoredContainerClass(
  view: "grid" | "list",
): string | undefined {
  return view === "grid" ? "col-span-2" : undefined;
}

export const isSingleBusinessLayout = (layout: SponsoredLayout) =>
  layout === "premium";

// The businesses a unit shows: one for the premium card, up to three for
// the row layouts.
export function sponsoredUnitShops(
  slotShops: SampleShop[],
  layout: SponsoredLayout,
): SampleShop[] {
  return slotShops.slice(0, isSingleBusinessLayout(layout) ? 1 : 3);
}

/* ------------------------------------------------------------------
 * Which businesses, and keeping them stable
 * ------------------------------------------------------------------ */

// Choices for this document load. It survives client-side navigation, so
// coming back from an ad shows the same businesses in the same places, and
// it starts empty on a refresh or a new visit, which is when new businesses
// are wanted.
const documentPicks = new Map<string, string[]>();
const SEEN_KEY = "slm:sponsored:seen";

/*
 * pools[slot] is the relevant pool for one slot of one page (matching the
 * neighbouring ads, minus sellers already visible next to it). Per slot:
 *   fair order  the pool arrives sorted best-first; each page starts one
 *               place further along so businesses take turns
 *   session     businesses already shown this session go to the back until
 *               the pool runs out
 *   dedupe      the two slots on a page never share a business
 * Returns null until mounted (sessionStorage is client only).
 */
export function useSponsoredOrder(
  chunks: { page: number; pools: SampleShop[][] }[],
  signature: string,
): Map<number, SampleShop[][]> | null {
  const [orders, setOrders] = useState<Map<number, SampleShop[][]> | null>(
    null,
  );

  const depKey = `${signature}|${chunks
    .map(
      (c) =>
        `${c.page}:${c.pools.map((p) => p.map((s) => s.name).join(",")).join("/")}`,
    )
    .join(";")}`;

  useEffect(() => {
    let seen: string[] = [];
    try {
      seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]");
    } catch {
      /* sessionStorage unavailable: plain rotation */
    }

    const result = new Map<number, SampleShop[][]>();
    for (const { page, pools } of chunks) {
      const taken = new Set<string>();
      const perSlot: SampleShop[][] = [];

      pools.forEach((pool, slot) => {
        const key = `${signature}|${page}|${slot}`;
        const byName = new Map(pool.map((s) => [s.name, s]));
        let names = documentPicks
          .get(key)
          ?.filter((n) => byName.has(n) && !taken.has(n));

        if (!names || names.length === 0) {
          let candidates = pool.filter(
            (s) => !seen.includes(s.name) && !taken.has(s.name),
          );
          if (candidates.length === 0) {
            candidates = pool.filter((s) => !taken.has(s.name));
          }
          const shift = candidates.length ? (page - 1) % candidates.length : 0;
          names = [...candidates.slice(shift), ...candidates.slice(0, shift)]
            .slice(0, 3)
            .map((s) => s.name);
          documentPicks.set(key, names);
          const first = names[0];
          if (first) {
            seen = [first, ...seen.filter((n) => n !== first)].slice(0, 12);
          }
        }

        names.forEach((n) => taken.add(n));
        perSlot.push(names.map((n) => byName.get(n)!));
      });

      result.set(page, perSlot);
    }

    try {
      sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {
      /* ignore */
    }
    setOrders(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return orders;
}

/* ------------------------------------------------------------------
 * Cards
 * ------------------------------------------------------------------ */

// A business's latest DIFFERENT ads (fewer if it has fewer, never repeated,
// never the same photo twice).
function latestAds(shop: SampleShop): SampleListing[] {
  const seen = new Set<string>();
  const ads: SampleListing[] = [];
  for (const l of sampleListings) {
    if (l.sellerName !== shop.name || seen.has(l.title) || seen.has(l.image))
      continue;
    seen.add(l.title);
    seen.add(l.image);
    ads.push(l);
    if (ads.length === 3) break;
  }
  return ads;
}

function Thumbs({
  shop,
  ads,
  heightClass,
}: {
  shop: SampleShop;
  ads: SampleListing[];
  heightClass: string;
}) {
  const images = ads.length > 0 ? ads.map((a) => a.image) : [shop.cover];
  return (
    <div className={`flex gap-1.5 ${heightClass}`}>
      {images.map((src, i) => (
        <span
          key={`${src}-${i}`}
          className="relative h-full flex-1 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <Image src={src} alt="" fill sizes="90px" className="object-cover" />
        </span>
      ))}
    </div>
  );
}

// Sample data has no logo or banner of its own (`cover` is a category
// photo), so the card falls back to initials and the branded navy cover.
// Every sponsored slot is a paid placement.
function PremiumSponsored({ shop }: { shop: SampleShop }) {
  const t = useTranslations("listings");
  const label = labelForSurface(responseLabelFor(shop.response), "sponsored");
  return (
    <PremiumBusinessCard
      shop={{
        name: shop.name,
        verified: true,
        rating: shop.rating,
        reviewCount: shop.reviews,
        category: shop.category,
        city: shop.location,
        replyTime: label ? t(`business.responseShort.${label}`) : undefined,
        delivery: shop.highlights.includes("delivery")
          ? t("business.highlights.delivery")
          : undefined,
        adsCount: Number.parseInt(shop.listings, 10) || 0,
        href: businessHref(shop.name),
        isPaidPlacement: true,
      }}
      products={latestAds(shop).map((ad) => ({
        imageUrl: ad.image,
        price: ad.price,
        alt: ad.title,
      }))}
    />
  );
}

function SponsoredBusinessCard({
  shop,
  scroll,
}: {
  shop: SampleShop;
  scroll: boolean;
}) {
  const t = useTranslations("listings");
  return (
    <Link
      href={businessHref(shop.name)}
      className={`flex min-w-0 flex-col gap-2 rounded-xl border border-blue-100 bg-white p-3 transition hover:border-blue-300 dark:border-blue-900 dark:bg-[#132038] ${
        scroll ? "w-[280px] shrink-0 snap-start" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold ${AVATAR_TONE}`}
        >
          {shop.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-bold text-[var(--color-market-text)]">
            <span className="truncate">{shop.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
          </p>
          <p className="flex items-center gap-1 text-xs text-[var(--color-market-text-secondary)]">
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            <span className="truncate">
              {shop.rating.toFixed(1)} (
              {t("card.reviews", { count: shop.reviews })})
            </span>
          </p>
          <p className="truncate text-xs text-[var(--color-market-text-muted)]">
            {shop.category} &middot; {shop.location}
          </p>
        </div>
      </div>

      <Thumbs shop={shop} ads={latestAds(shop)} heightClass="h-[76px]" />

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-[var(--color-market-text-secondary)]">
          {t("card.adsCount", { count: shop.listings.replace("+", "") })}
        </span>
        <span className="flex items-center gap-1 font-semibold text-blue-600">
          {t("card.viewBusiness")}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

// Solid (never dashed or empty-looking) fallback that keeps the cell filled.
function ExploreCard({ category, fill }: { category: string; fill?: boolean }) {
  const t = useTranslations("listings");
  return (
    <Link
      href="/businesses"
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 text-center transition hover:border-blue-300 dark:border-blue-900 dark:bg-[#0f1b2e] ${
        fill ? "h-full" : "min-h-[120px]"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900">
        <Store className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-[var(--color-market-text)]">
        {t("card.nearYou", { category })}
      </p>
      <span className="flex items-center gap-1 text-sm font-semibold text-blue-600">
        {t("card.exploreBusinesses")}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

// Reserves the slot's space until the picks are ready, so nothing jumps.
export const SponsoredPlaceholder = PremiumBusinessCardSkeleton;

export function SponsoredUnit({
  shops,
  layout,
  contextCategory,
}: {
  shops: SampleShop[];
  layout: SponsoredLayout;
  contextCategory: string;
}) {
  const t = useTranslations("listings");

  if (layout === "premium") {
    return shops[0] ? (
      <PremiumSponsored shop={shops[0]} />
    ) : (
      <ExploreCard category={contextCategory} fill />
    );
  }
  if (shops.length === 0) return null;

  const label =
    layout === "scroll"
      ? t("card.nearYouShort", { category: contextCategory })
      : t("card.nearYou", { category: contextCategory });

  const header = (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="flex min-w-0 items-center gap-2 text-xs text-[var(--color-market-text-secondary)]">
        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          {t("card.sponsoredIn")}
        </span>
        <span className="truncate">{label}</span>
      </p>
      <Link
        href="/businesses"
        className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600"
      >
        {t("card.viewAll")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );

  const shell =
    "rounded-2xl border border-blue-100 bg-[#f4f8ff] p-3 dark:border-blue-900 dark:bg-[#0f1b2e]";

  if (layout === "scroll") {
    return (
      <div className={shell}>
        {header}
        <div
          className={`scrollbar-hide flex gap-3 ${
            shops.length > 1 ? "snap-x snap-mandatory overflow-x-auto" : ""
          }`}
        >
          {shops.map((s) => (
            <SponsoredBusinessCard key={s.name} shop={s} scroll />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      {header}
      <div className="grid grid-cols-3 gap-3">
        {shops.map((s) => (
          <SponsoredBusinessCard key={s.name} shop={s} scroll={false} />
        ))}
        {shops.length < 3 && (
          <div style={{ gridColumn: `span ${3 - shops.length}` }}>
            <ExploreCard category={contextCategory} fill />
          </div>
        )}
      </div>
    </div>
  );
}
