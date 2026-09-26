"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Banknote,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  Home,
  Leaf,
  RotateCcw,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  DEFAULT_HOURS,
  isOpenAt,
  labelForSurface,
  responseLabelFor,
} from "@/lib/business/responseTime";
import {
  sampleListings,
  type BusinessHighlight,
  type SampleListing,
  type SampleShop,
} from "./data";
import { dropPercent, logoColorFor } from "./ListingCard";

/*
 * TWO sponsored units per page of 28 ads, always after the 8th and the 20th
 * ad, in every view and on every device. Only the container adapts:
 *   cell    5 columns (1280+) and 3 columns (768-1023): one business, one
 *           cell, built like an ad card
 *   wide    4 columns (1024-1279): one business spanning 2 cells
 *   row3    desktop list: a row of up to 3 businesses
 *   scroll  mobile (grid and list): a snap-scrolling row
 * A page view never changes its sponsored businesses. New businesses come
 * with a new page, a refresh or a new visit (see useSponsoredOrder).
 */

export type SponsoredLayout = "cell" | "wide" | "row3" | "scroll";

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
export const useIsLgUp = () => useMedia("(min-width: 1024px)");
export const useIsXlUp = () => useMedia("(min-width: 1280px)");

export function sponsoredLayoutFor(
  view: "grid" | "list",
  mdUp: boolean,
  lgUp: boolean,
  xlUp: boolean,
): SponsoredLayout {
  if (!mdUp) return "scroll";
  if (view === "list") return "row3";
  if (xlUp || !lgUp) return "cell";
  return "wide";
}

export function sponsoredContainerClass(
  view: "grid" | "list",
  layout: SponsoredLayout,
): string | undefined {
  if (view !== "grid") return undefined;
  if (layout === "scroll") return "col-span-full";
  if (layout === "wide") return "col-span-2";
  return undefined;
}

export const isSingleBusinessLayout = (layout: SponsoredLayout) =>
  layout === "cell" || layout === "wide";

// The businesses a unit shows: one for the cell layouts, up to three for
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

// A business's latest DIFFERENT ads (fewer if it has fewer, never repeated).
function latestAds(shop: SampleShop): SampleListing[] {
  const seen = new Set<string>();
  const ads: SampleListing[] = [];
  for (const l of sampleListings) {
    if (l.sellerName !== shop.name || seen.has(l.title)) continue;
    seen.add(l.title);
    ads.push(l);
    if (ads.length === 3) break;
  }
  return ads;
}

function detailHref(l: SampleListing) {
  return `/ads/${l.categoryId}?q=${encodeURIComponent(l.title)}`;
}

function rupees(l: SampleListing) {
  return `Rs. ${l.price.toLocaleString("en-US")}`;
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

const HIGHLIGHT_ICONS: Record<BusinessHighlight, LucideIcon> = {
  delivery: Truck,
  warranty: ShieldCheck,
  easyPayments: CreditCard,
  cod: Banknote,
  returns: RotateCcw,
  inspection: ClipboardCheck,
  leasing: FileText,
  consultation: Home,
  siteVisits: CalendarCheck,
  assembly: Wrench,
  freshness: Leaf,
};

type Fact = { key: string; Icon: LucideIcon; label: string; title?: string };

// Trust lines under the tiles: the business's own highlights plus the
// measured response label. Sponsored placements only ever show the two
// fast labels. `max` is what the card has room for; the response label
// keeps its place when earned, highlights fill the rest.
function useFacts(shop: SampleShop, max: number): Fact[] {
  const t = useTranslations("listings");
  const label = labelForSurface(responseLabelFor(shop.response), "sponsored");
  const highlights: Fact[] = shop.highlights.map((h) => ({
    key: h,
    Icon: HIGHLIGHT_ICONS[h],
    label: t(`business.highlights.${h}`),
  }));
  if (!label) return highlights.slice(0, max);
  return [
    ...highlights.slice(0, max - 1),
    {
      key: "response",
      Icon: Zap,
      label: t(`business.response.${label}`),
      title: t("business.responseTooltip"),
    },
  ];
}

function SponsoredPill() {
  const t = useTranslations("listings");
  return (
    <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-900/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
      {t("shops.sponsored")}
    </span>
  );
}

function OpenPill({ shop }: { shop: SampleShop }) {
  const t = useTranslations("listings");
  const open = isOpenAt(new Date(), shop.hours ?? DEFAULT_HOURS);
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        open
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${open ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {open ? t("business.openNow") : t("business.closed")}
    </span>
  );
}

function FooterRow({ shop }: { shop: SampleShop }) {
  const t = useTranslations("listings");
  return (
    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
      <span className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 text-[13px] font-semibold text-blue-600 dark:border-blue-800 dark:bg-transparent">
        <span className="truncate">{t("card.viewBusiness")}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </span>
      <span className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[13px] font-semibold text-blue-600">
        {t("card.adsCount", { count: shop.listings.replace("+", "") })}
        <ChevronRight className="h-4 w-4" />
      </span>
    </div>
  );
}

function FactsRow({ facts, className }: { facts: Fact[]; className: string }) {
  if (facts.length === 0) return null;
  return (
    <ul className={className}>
      {facts.map(({ key, Icon, label, title }) => (
        <li
          key={key}
          title={title}
          className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-market-text-secondary)]"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span className="truncate">{label}</span>
        </li>
      ))}
    </ul>
  );
}

function OldPrice({ ad }: { ad: SampleListing }) {
  const pct = dropPercent(ad);
  if (!pct) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-1">
      <span className="whitespace-nowrap text-[10px] text-[var(--color-market-text-muted)] line-through">
        {ad.originalPriceLabel}
      </span>
      <span className="rounded bg-emerald-50 px-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950">
        &minus;{pct}%
      </span>
    </span>
  );
}

// Catalogue tile. Small card: photo on top. Large card: photo left.
function Tile({ ad, horizontal }: { ad: SampleListing; horizontal: boolean }) {
  return (
    <Link
      href={detailHref(ad)}
      className={`relative z-10 flex min-w-0 overflow-hidden rounded-lg border border-blue-100 bg-white transition hover:border-blue-300 dark:border-blue-900 dark:bg-[#132038] ${
        horizontal ? "items-center gap-2 p-1.5" : "flex-col gap-1 p-1"
      }`}
    >
      <span
        className={`relative shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 ${
          horizontal ? "h-14 w-14" : "aspect-[4/3] w-full"
        }`}
      >
        <Image
          src={ad.image}
          alt=""
          fill
          sizes="90px"
          className="object-cover"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={`text-[11px] font-semibold leading-tight text-[var(--color-market-text)] ${
            horizontal ? "truncate" : "line-clamp-2"
          }`}
        >
          {ad.title}
        </span>
        {horizontal && (
          <span className="truncate text-[11px] text-[var(--color-market-text-muted)]">
            {ad.attrs.slice(0, 2).join(" \u00b7 ")}
          </span>
        )}
        {horizontal ? (
          <span className="text-xs font-bold text-[#1557d6]">{rupees(ad)}</span>
        ) : (
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] text-[var(--color-market-text-muted)]">
              Rs.
            </span>
            <span className="whitespace-nowrap text-[10.5px] font-bold tracking-tight text-[#1557d6]">
              {ad.price.toLocaleString("en-US")}
            </span>
          </span>
        )}
        {horizontal && <OldPrice ad={ad} />}
      </span>
    </Link>
  );
}

const CARD_SHELL =
  "relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white transition hover:border-blue-300 dark:border-blue-900 dark:bg-[#0f1b2e]";

function Cover({ shop, height }: { shop: SampleShop; height: string }) {
  return (
    <div
      className={`relative shrink-0 bg-slate-100 dark:bg-slate-800 ${height}`}
    >
      <Image
        src={shop.cover}
        alt=""
        fill
        sizes="(min-width: 1024px) 480px, 240px"
        className="object-cover"
      />
      <SponsoredPill />
    </div>
  );
}

function Logo({ shop, className }: { shop: SampleShop; className: string }) {
  return (
    <span
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-4 ring-white dark:ring-[#0f1b2e] ${logoColorFor(shop.name)} ${className}`}
    >
      {shop.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function NameLink({
  shop,
  className,
}: {
  shop: SampleShop;
  className: string;
}) {
  return (
    <p
      className={`flex items-center gap-1 font-bold text-[var(--color-market-text)] ${className}`}
    >
      <Link
        href="/businesses"
        className="truncate after:absolute after:inset-0 after:content-['']"
      >
        {shop.name}
      </Link>
      <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
    </p>
  );
}

// Small template: one cell (5 and 3 column grids).
function SponsoredCell({ shop }: { shop: SampleShop }) {
  const ads = latestAds(shop);
  const facts = useFacts(shop, 2);
  return (
    <article className={CARD_SHELL}>
      <Cover shop={shop} height="h-[84px]" />
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        <div className="flex items-start gap-2.5">
          <Logo shop={shop} className="-mt-7 h-14 w-14 text-lg" />
          <div className="min-w-0 flex-1 pt-1">
            <NameLink shop={shop} className="text-[15px]" />
            <p className="flex items-center gap-1 text-[11px] text-[var(--color-market-text-secondary)]">
              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
              <span className="truncate">
                {shop.rating.toFixed(1)} ({shop.reviews}) &middot;{" "}
                {shop.location} &middot; {shop.category}
              </span>
            </p>
          </div>
        </div>
        {ads.length > 0 && (
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${ads.length}, minmax(0, 1fr))`,
            }}
          >
            {ads.map((ad) => (
              <Tile key={ad.id} ad={ad} horizontal={false} />
            ))}
          </div>
        )}
        <FactsRow facts={facts} className="flex flex-col gap-1" />
        <FooterRow shop={shop} />
      </div>
    </article>
  );
}

// Large template: two cells wide (4 column grid).
function SponsoredWide({ shop }: { shop: SampleShop }) {
  const t = useTranslations("listings");
  const ads = latestAds(shop);
  const facts = useFacts(shop, 3);
  return (
    <article className={CARD_SHELL}>
      <Cover shop={shop} height="h-[104px]" />
      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-3">
        <div className="flex items-start gap-3">
          <Logo shop={shop} className="-mt-9 h-[72px] w-[72px] text-2xl" />
          <div className="min-w-0 flex-1 pt-1">
            <NameLink shop={shop} className="text-lg" />
            <p className="flex items-center gap-1 text-xs text-[var(--color-market-text-secondary)]">
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
              <span className="truncate">
                {shop.rating.toFixed(1)} (
                {t("card.reviews", { count: shop.reviews })}) &middot;{" "}
                {shop.category} &middot; {shop.location}
              </span>
            </p>
          </div>
          <OpenPill shop={shop} />
        </div>
        {ads.length > 0 && (
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${ads.length}, minmax(0, 1fr))`,
            }}
          >
            {ads.map((ad) => (
              <Tile key={ad.id} ad={ad} horizontal />
            ))}
          </div>
        )}
        <FactsRow facts={facts} className="flex flex-wrap gap-x-4 gap-y-1" />
        <FooterRow shop={shop} />
      </div>
    </article>
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
      href="/businesses"
      className={`flex min-w-0 flex-col gap-2 rounded-xl border border-blue-100 bg-white p-3 transition hover:border-blue-300 dark:border-blue-900 dark:bg-[#132038] ${
        scroll ? "w-[280px] shrink-0 snap-start" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${logoColorFor(shop.name)}`}
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
export function SponsoredPlaceholder() {
  return (
    <div className="h-full min-h-[240px] rounded-2xl bg-blue-50/70 dark:bg-blue-950/40" />
  );
}

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

  if (layout === "cell") {
    return shops[0] ? (
      <SponsoredCell shop={shops[0]} />
    ) : (
      <ExploreCard category={contextCategory} fill />
    );
  }
  if (layout === "wide") {
    return shops[0] ? (
      <SponsoredWide shop={shops[0]} />
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
