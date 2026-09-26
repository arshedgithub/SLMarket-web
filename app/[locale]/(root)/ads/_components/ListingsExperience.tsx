"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import {
  ALL_DISTRICTS,
  CATEGORY_FILTER_FIELDS,
  DEAL_VALUES,
  locationDistrict,
  POPULAR_SEARCHES,
  PRICE_PRESETS,
  sampleListings,
  sampleShops,
  SORT_VALUES,
  type Condition,
  type DealTag,
  type SampleListing,
  type SellerType,
  type SortValue,
} from "./data";
import { dealsHref } from "./dealRoutes";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  FilterBar,
  type FiltersState,
} from "./FilterBar";
import { ListingCard } from "./ListingCard";
import { FeaturedBusinessesStrip } from "./BusinessCards";
import { CategoryRow } from "./CategoryRow";
import {
  SponsoredPlaceholder,
  SponsoredUnit,
  isSingleBusinessLayout,
  sponsoredContainerClass,
  sponsoredLayoutFor,
  sponsoredUnitShops,
  useIsLgUp,
  useIsMdUp,
  useIsXlUp,
  useSponsoredOrder,
} from "./SponsoredUnit";

export type CategoryOption = {
  id: string;
  name: string;
  iconName: string;
  subcategories: { id: string; name: string }[];
};

function sameDeals(a: DealTag[], b: DealTag[]) {
  return a.length === b.length && a.every((d) => b.includes(d));
}

const PAGE_SIZE = 28;
const MAX_PAGES = 50;
const BASE_TOTAL_LISTINGS = 25876;
const POSTED_TODAY = 1240;
const DISTRICT_COUNT = 25;

// The 4 busiest districts, each with a 24h and a 7-day count. A district
// row prefers its 24h figure, but falls back to the 7-day one (tagged
// "7d") once activity is too low for a same-day number to mean anything —
// the busiest 4 rarely need it, but the rule has to hold for any district.
const MIN_24H_FOR_DAILY_COUNT = 5;
type DistrictToday = { name: string; count24h: number; count7d: number };
const DISTRICT_TODAY: DistrictToday[] = [
  { name: "Colombo", count24h: 386, count7d: 2410 },
  { name: "Gampaha", count24h: 192, count7d: 1260 },
  { name: "Kandy", count24h: 118, count7d: 780 },
  { name: "Galle", count24h: 96, count7d: 640 },
];
// The remaining 21 districts combined, today — not a single district, so
// it clears the location filter instead of matching one.
const OTHER_DISTRICTS_TODAY = 448;

function matchesExtra(
  query: string,
  listing: { title: string; attrs: string[] },
) {
  const haystack = `${listing.title} ${listing.attrs.join(" ")}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function categoryHref(id: string | null) {
  return id ? `/ads/${id}` : "/ads";
}

// Reconstructs filter state from the URL so a shared/bookmarked link (e.g.
// /ads/vehicles?location=Colombo&brand=Toyota&deal=price-drop) opens
// with the same refinements applied.
function filtersFromParams(
  sp: URLSearchParams,
  categoryId: string | null,
  dealScope: DealTag[] | null,
): FiltersState {
  const priceMin = sp.get("priceMin") ? Number(sp.get("priceMin")) : null;
  const priceMax = sp.get("priceMax") ? Number(sp.get("priceMax")) : null;
  const matchedPreset = PRICE_PRESETS.find(
    (p) => p.min === priceMin && (p.max ?? null) === priceMax,
  );

  const extra: Record<string, string> = {};
  const fields = categoryId ? CATEGORY_FILTER_FIELDS[categoryId] : undefined;
  fields?.forEach((field) => {
    const v = sp.get(field.key);
    if (v) extra[field.key] = v;
  });

  return {
    location: sp.get("location"),
    priceMin,
    priceMax,
    pricePresetKey: matchedPreset?.key ?? null,
    condition: (sp.get("condition") as Condition | null) ?? "na",
    seller: (sp.get("seller") as SellerType | "all" | null) ?? "all",
    deals: dealsFromParams(sp, dealScope),
    extra,
  };
}

// `deal=all` is the compact form of "every deal type" so the URL doesn't
// carry three repeated deal params. On a deals route the route itself is the
// scope, so an absent param means "the whole scope", not "no deal filter".
function dealsFromParams(
  sp: URLSearchParams,
  dealScope: DealTag[] | null,
): DealTag[] {
  const values = sp.getAll("deal");
  if (values.includes("all")) return DEAL_VALUES;
  const valid = values.filter((v): v is DealTag =>
    DEAL_VALUES.includes(v as DealTag),
  );
  if (valid.length > 0) return valid;
  return dealScope ?? [];
}

function paramsFromFilters(
  search: string,
  filters: FiltersState,
  dealScope: DealTag[] | null,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (filters.location) params.set("location", filters.location);
  if (filters.priceMin !== null)
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== null)
    params.set("priceMax", String(filters.priceMax));
  if (filters.condition !== "na") params.set("condition", filters.condition);
  if (filters.seller !== "all") params.set("seller", filters.seller);
  const impliedByRoute = dealScope && sameDeals(filters.deals, dealScope);
  if (!impliedByRoute) {
    if (sameDeals(filters.deals, DEAL_VALUES)) params.set("deal", "all");
    else
      DEAL_VALUES.filter((d) => filters.deals.includes(d)).forEach((d) =>
        params.append("deal", d),
      );
  }
  Object.entries(filters.extra).forEach(([k, v]) => params.set(k, v));
  if (page > 1) params.set("page", String(page));
  return params;
}

/* ============================================================
 * Small inline selects for the top search bar
 * ============================================================ */

function QuickSelect({
  icon: Icon,
  label,
  standalone = false,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  // A free-standing pill (toolbar) instead of a segment of the search bar.
  standalone?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));

  return (
    <div ref={ref} className="relative w-auto shrink-0 sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-sm font-medium text-[var(--color-market-text-secondary)] outline-none transition hover:border-blue-200 ${
          standalone
            ? "px-3 py-2"
            : "px-3 py-2 sm:w-44 sm:rounded-none sm:border-y-0 sm:border-l sm:border-r-0 sm:px-3.5 sm:py-3"
        }`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-blue-500" />}
        <span className="max-w-20 truncate sm:max-w-none sm:flex-1 sm:text-left">
          {label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`scrollbar-hide absolute top-[calc(100%+8px)] right-0 z-30 max-h-72 w-56 min-w-[200px] overflow-y-auto rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-2xl ${
            standalone ? "" : "sm:left-auto"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function SelectRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-[var(--color-market-text)] hover:bg-[var(--color-market-background)]"
    >
      <span className="flex-1 truncate">{children}</span>
      {active && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
    </button>
  );
}

// Desktop-only (xl+, so it never fights the search bar for width) — the
// base /ads page only, since a per-district "today" count doesn't mean
// anything once a category, search or deal has already narrowed things.
function MarketplaceTodayPanel({
  t,
  onSelectDistrict,
}: {
  t: ReturnType<typeof useTranslations>;
  onSelectDistrict: (district: string | null) => void;
}) {
  const rowClass =
    "flex w-full items-center gap-1.5 rounded px-1 py-[1px] text-[11px] leading-4 text-[var(--color-market-text-secondary)] transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950";
  return (
    <div className="relative isolate hidden h-[150px] w-full items-center justify-between gap-3 overflow-hidden rounded-2xl sm:flex xl:w-[460px]">
      {/* The map is the background: it fades in behind the numbers and
          sits between the headline stat and the district card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
        style={{ left: 70, top: 0, width: 228, height: 152 }}
      >
        <Image
          src="/images/marketplace/listings/ad-hero.webp"
          alt=""
          width={228}
          height={152}
          priority
          className="max-w-none opacity-95 [mask-image:linear-gradient(to_right,transparent,black_30%,black_85%,transparent)] dark:opacity-30"
        />
      </div>

      <div className="shrink-0 pl-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {t("marketplaceToday.label")}
        </div>
        <p className="mt-0.5 whitespace-nowrap text-3xl font-extrabold leading-tight text-[#1557d6]">
          {POSTED_TODAY.toLocaleString()}
        </p>
        <p className="whitespace-nowrap text-xs font-semibold text-[var(--color-market-text-secondary)]">
          {t("marketplaceToday.newAds")}
        </p>
        <p className="whitespace-nowrap text-[11px] text-[var(--color-market-text-muted)]">
          {t("marketplaceToday.acrossDistricts", { count: DISTRICT_COUNT })}
        </p>
      </div>

      <div className="w-[142px] shrink-0 rounded-lg border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1 shadow-sm">
        {DISTRICT_TODAY.map((d) => {
          const useWeekly = d.count24h < MIN_24H_FOR_DAILY_COUNT;
          const shown = useWeekly ? d.count7d : d.count24h;
          return (
            <button
              key={d.name}
              type="button"
              onClick={() => onSelectDistrict(d.name)}
              className={rowClass}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span className="min-w-0 flex-1 truncate text-left">
                {d.name}
              </span>
              <span className="shrink-0 whitespace-nowrap font-semibold">
                {shown.toLocaleString()}
                {useWeekly && (
                  <span className="ml-0.5 text-[9px] font-medium opacity-60">
                    /{t("marketplaceToday.weekAbbr")}
                  </span>
                )}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelectDistrict(null)}
          className={rowClass}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
          <span className="min-w-0 flex-1 truncate text-left">
            {t("marketplaceToday.otherDistricts")}
          </span>
          <span className="shrink-0 whitespace-nowrap font-semibold">
            {OTHER_DISTRICTS_TODAY.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * Page rules: 28 ads per page, in every view and on every device.
 *  - Two sponsored units per page, after the 8th and the 20th ad. Desktop
 *    grid: cells 9 and 22. Only the unit's width adapts (see SponsoredUnit).
 *  - Featured ads: positions 1 and 2, then at most one per 8 ads.
 *  - A slot needs its ads: the first unit shows only when 8 ads come
 *    before it, the second only when 20 do.
 * ============================================================ */

const SPONSORED_AFTER = [8, 20];
const FEATURED_POSITIONS = new Set([0, 1, 9, 17, 25]);

// Featured ads take the featured positions; any beyond that (or when there
// are more than the positions allow) show as regular ads.
function arrangeFeatured(list: SampleListing[]): SampleListing[] {
  const total = list.length;
  const slots: number[] = [];
  for (let i = 0; i < total; i++) {
    if (FEATURED_POSITIONS.has(i % PAGE_SIZE)) slots.push(i);
  }
  const featured = list.filter((l) => l.featured).slice(0, slots.length);
  const placed = new Set(featured.map((l) => l.id));
  const regular = list
    .filter((l) => !placed.has(l.id))
    .map((l) => (l.featured ? { ...l, featured: false } : l));

  const out: SampleListing[] = [];
  let f = 0;
  let r = 0;
  for (let i = 0; i < total; i++) {
    if (FEATURED_POSITIONS.has(i % PAGE_SIZE) && f < featured.length) {
      out.push(featured[f++]);
    } else {
      out.push(regular[r++]);
    }
  }
  return out;
}

type GridEntry =
  | { kind: "listing"; listing: SampleListing }
  | { kind: "sponsored"; key: string; slot: number };

function buildPageEntries(
  page: number,
  listings: SampleListing[],
): GridEntry[] {
  const entries: GridEntry[] = [];
  listings.forEach((listing, i) => {
    entries.push({ kind: "listing", listing });
    const slot = SPONSORED_AFTER.indexOf(i + 1);
    if (slot !== -1) {
      entries.push({
        kind: "sponsored",
        key: `sponsored-${page}-${slot}`,
        slot,
      });
    }
  });
  return entries;
}

// At most 7 numbers: first, last, current with neighbours, gaps as "...".
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "gap", total];
  if (current >= total - 3)
    return [1, "gap", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "gap", current - 1, current, current + 1, "gap", total];
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const t = useTranslations("listings");
  const base =
    "flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-semibold transition";
  return (
    <nav
      aria-label={t("pagination.label")}
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${base} gap-1 px-3 text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-surface)] disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" />
        {t("pagination.previous")}
      </button>
      {pageNumbers(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="flex h-10 w-6 items-center justify-center text-[var(--color-market-text-muted)]"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-label={t("pagination.page", { page: n })}
            aria-current={n === page ? "page" : undefined}
            onClick={() => n !== page && onChange(n)}
            className={`${base} ${
              n === page
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${base} gap-1 px-3 text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-surface)] disabled:pointer-events-none disabled:opacity-40`}
      >
        {t("pagination.next")}
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ============================================================
 * Main experience
 * ============================================================ */

export function ListingsExperience({
  categories,
  initialCategoryId,
  initialSubcategoryId,
  dealScope,
}: {
  categories: CategoryOption[];
  initialCategoryId: string | null;
  initialSubcategoryId: string | null;
  // Set on /ads/deals[/<type>]: the deal types the route itself covers.
  dealScope: DealTag[] | null;
}) {
  const t = useTranslations("listings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openCategoryModal = useCategoryModalStore((s) => s.open);

  const categoryId = initialCategoryId;
  const activeCategory = categories.find((c) => c.id === categoryId) ?? null;
  const subcategoryId = initialSubcategoryId;
  const activeSubcategory =
    activeCategory?.subcategories.find((s) => s.id === subcategoryId) ?? null;

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [inputValue, setInputValue] = useState(search);
  const [filters, setFiltersState] = useState<FiltersState>(() =>
    filtersFromParams(searchParams, categoryId, dealScope),
  );
  const [sort, setSort] = useState<SortValue>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(() => {
    const n = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(n) && n > 1 ? Math.min(n, MAX_PAGES) : 1;
  });
  // Mobile appends pages ("Show more ads") from the page it opened on.
  const [firstPage, setFirstPage] = useState(page);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Without a category, the deal chips pick the route: none is /ads,
  // one type is its own deals route, all types is /ads/deals. That keeps
  // one URL per result set instead of ?deal= variants of the same page.
  const setFilters = (next: FiltersState) => {
    if (!categoryId) {
      const target = dealsHref(next.deals);
      const current = dealScope ? dealsHref(dealScope) : "/ads";
      if (target !== current) {
        const routeImplies =
          next.deals.length === 1 || sameDeals(next.deals, DEAL_VALUES)
            ? next.deals
            : null;
        const qs = paramsFromFilters(search, next, routeImplies).toString();
        router.push(qs ? `${target}?${qs}` : target);
        return;
      }
    }
    setFiltersState(next);
  };

  // Keep the URL shareable/bookmarkable for the search text + every filter.
  // A page change is a real history entry (?page=N) so the back button and
  // shared links work; other refinements replace the entry.
  const listKey = JSON.stringify([categoryId, search, filters, sort]);
  const lastBaseQs = useRef<string | null>(null);
  const lastListKey = useRef(listKey);
  useEffect(() => {
    // A changed result set starts at page 1 (state catches up below).
    const listChanged = lastListKey.current !== listKey;
    lastListKey.current = listKey;
    const effectivePage = listChanged ? 1 : page;
    const baseQs = paramsFromFilters(search, filters, dealScope).toString();
    const qs = paramsFromFilters(
      search,
      filters,
      dealScope,
      effectivePage,
    ).toString();
    const pageOnly = lastBaseQs.current === baseQs;
    lastBaseQs.current = baseQs;
    if (qs === searchParams.toString()) return;
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (pageOnly) router.push(target, { scroll: false });
    else router.replace(target, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters, sort, pathname, page]);

  // Back/forward changes ?page=; follow it.
  const urlPage = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  useEffect(() => {
    const next = Math.min(Math.max(urlPage, 1), MAX_PAGES);
    setPage((p) => (p === next ? p : next));
    setFirstPage((p) => Math.min(p, next));
  }, [urlPage]);

  // Any change to what is being listed starts again from page 1.
  const prevListKey = useRef<string | null>(null);
  useEffect(() => {
    if (prevListKey.current !== null && prevListKey.current !== listKey) {
      setPage(1);
      setFirstPage(1);
    }
    prevListKey.current = listKey;
  }, [listKey]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    const extraEntries = Object.entries(filters.extra);

    const list = sampleListings.filter((listing) => {
      if (categoryId && listing.categoryId !== categoryId) return false;
      if (subcategoryId && listing.subcategoryId !== subcategoryId)
        return false;
      if (q && !listing.title.toLowerCase().includes(q)) return false;
      if (
        filters.location &&
        locationDistrict(listing.location) !== filters.location
      )
        return false;
      if (filters.priceMin !== null && listing.price < filters.priceMin)
        return false;
      if (filters.priceMax !== null && listing.price > filters.priceMax)
        return false;
      if (filters.condition !== "na" && listing.condition !== filters.condition)
        return false;
      if (filters.seller !== "all" && listing.sellerType !== filters.seller)
        return false;
      if (
        filters.deals.length > 0 &&
        (!listing.deal || !filters.deals.includes(listing.deal))
      )
        return false;
      if (extraEntries.some(([, value]) => !matchesExtra(value, listing)))
        return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);

    return sorted;
  }, [categoryId, subcategoryId, search, filters, sort]);

  const arranged = useMemo(
    () =>
      sort === "newest" ? arrangeFeatured(filteredListings) : filteredListings,
    [filteredListings, sort],
  );
  const cappedTotal = Math.min(arranged.length, MAX_PAGES * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(cappedTotal / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const isMdUp = useIsMdUp();
  const isLgUp = useIsLgUp();
  const isXlUp = useIsXlUp();
  // Desktop and tablet show one page; mobile appends pages.
  const startPage = isMdUp ? currentPage : Math.min(firstPage, currentPage);
  const pageNumbersShown = Array.from(
    { length: currentPage - startPage + 1 },
    (_, i) => startPage + i,
  );
  const shownFrom = (startPage - 1) * PAGE_SIZE + 1;
  const shownTo = Math.min(currentPage * PAGE_SIZE, cappedTotal);
  const hasMore = currentPage < totalPages;
  const capped = arranged.length > MAX_PAGES * PAGE_SIZE;

  function goToPage(next: number) {
    setPage(next);
    if (isMdUp) setFirstPage(next);
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ block: "start" }),
    );
  }

  const sortedShops = useMemo(
    () =>
      categoryId
        ? [
            ...sampleShops.filter((shop) => shop.categoryId === categoryId),
            ...sampleShops.filter((shop) => shop.categoryId !== categoryId),
          ]
        : sampleShops,
    [categoryId],
  );
  const stripShops = sortedShops.slice(0, 5);
  const showStrip = search.trim().length === 0;

  // Pool for one sponsored slot of one page: relevant to the ads around it
  // (the page's category, or the dominant category of the 8 ads before the
  // slot), never a seller already visible in those neighbouring ads.
  const chunks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pageNumbersShown.map((p) => {
      const pageListings = arranged.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
      const categoryIds: (string | null)[] = [];
      const pools = SPONSORED_AFTER.map((after) => {
        if (pageListings.length < after) {
          categoryIds.push(null);
          return [];
        }
        const before = pageListings.slice(Math.max(0, after - 8), after);
        const nearby = new Set(
          pageListings
            .slice(Math.max(0, after - 8), after + 8)
            .map((l) => l.sellerName)
            .filter((name): name is string => !!name),
        );
        let relevantId = categoryId;
        if (!relevantId) {
          const counts = new Map<string, number>();
          before.forEach((l) =>
            counts.set(l.categoryId, (counts.get(l.categoryId) ?? 0) + 1),
          );
          relevantId =
            [...counts.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;
        }
        categoryIds.push(relevantId);
        return sampleShops
          .filter((s) => !nearby.has(s.name))
          .filter((s) => {
            if (q) return `${s.name} ${s.category}`.toLowerCase().includes(q);
            return !relevantId || s.categoryId === relevantId;
          })
          .sort((x, y) => y.rating - x.rating);
      });
      return { page: p, listings: pageListings, pools, categoryIds };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arranged, categoryId, search, startPage, currentPage]);

  const sponsoredOrder = useSponsoredOrder(chunks, `${pathname}|${listKey}`);
  const sponsoredLayout = sponsoredLayoutFor(view, isMdUp, isLgUp, isXlUp);

  const singleDealScope = dealScope?.length === 1 ? dealScope[0] : null;
  const heading = dealScope
    ? singleDealScope
      ? t(`filters.deal.${singleDealScope}`)
      : t("header.dealsTitle")
    : activeSubcategory
      ? `${activeSubcategory.name} ${t("header.categoryTitleSuffix")}`
      : activeCategory
        ? `${activeCategory.name} ${t("header.categoryTitleSuffix")}`
        : t("header.allListingsTitle");
  // The base /ads page (no category/search/deal/filter) shows a real stat
  // line here instead of generic copy — "25,876 ads · 1,240 posted today"
  // — so it isn't duplicated by a separate "marketplace today" widget.
  const subtitle = dealScope
    ? t("header.dealsSubtitle")
    : !categoryId && !search.trim() && activeFilterCount(filters) === 0
      ? t("header.statsLine", {
          total: BASE_TOTAL_LISTINGS.toLocaleString(),
          postedToday: POSTED_TODAY.toLocaleString(),
        })
      : t("header.subtitle");

  // The marketplace-wide total only makes sense while nothing narrows the
  // results; otherwise the toolbar carries the filtered count.
  const showGlobalTotal =
    !categoryId &&
    !dealScope &&
    !search.trim() &&
    activeFilterCount(filters) === 0;
  const countLabel = showGlobalTotal
    ? `${BASE_TOTAL_LISTINGS.toLocaleString()} ${t("header.listingsStat")}`
    : t("toolbar.resultsFound", { count: filteredListings.length });

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearch(inputValue.trim());
  }

  function clearAll() {
    if (categoryId) {
      router.push(search ? `/ads?q=${encodeURIComponent(search)}` : "/ads");
      return;
    }
    setFilters(DEFAULT_FILTERS);
  }

  const renderPage = (chunk: (typeof chunks)[number]) => (
    <div
      key={chunk.page}
      className={`${
        view === "grid"
          ? "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5"
          : "flex flex-col gap-3"
      } ${chunk.page > startPage ? "mt-3 md:mt-4" : ""}`}
    >
      {buildPageEntries(chunk.page, chunk.listings).map((entry) => {
        if (entry.kind === "listing") {
          return (
            <ListingCard
              key={entry.listing.id}
              listing={entry.listing}
              view={view}
            />
          );
        }
        const single = isSingleBusinessLayout(sponsoredLayout);
        const shops = sponsoredUnitShops(
          sponsoredOrder?.get(chunk.page)?.[entry.slot] ?? [],
          sponsoredLayout,
        );
        // Row layouts drop out when there is nobody relevant; the cell
        // layouts keep a fallback so every grid row stays full.
        if (!single && (sponsoredOrder === null || shops.length === 0))
          return null;
        const categoryName =
          categories.find((c) => c.id === chunk.categoryIds[entry.slot])
            ?.name ?? "";
        return (
          <div
            key={entry.key}
            className={sponsoredContainerClass(view, sponsoredLayout)}
          >
            {sponsoredOrder === null ? (
              <SponsoredPlaceholder />
            ) : (
              <SponsoredUnit
                shops={shops}
                layout={sponsoredLayout}
                contextCategory={categoryName}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const sortControl = (
    <QuickSelect standalone label={t(`toolbar.sort.${sort}`)}>
      {SORT_VALUES.map((value) => (
        <SelectRow
          key={value}
          active={sort === value}
          onClick={() => setSort(value)}
        >
          {t(`toolbar.sort.${value}`)}
        </SelectRow>
      ))}
    </QuickSelect>
  );

  const mobileSortControl = (
    <QuickSelect standalone icon={ArrowUpDown} label={t("toolbar.sortShort")}>
      {SORT_VALUES.map((value) => (
        <SelectRow
          key={value}
          active={sort === value}
          onClick={() => setSort(value)}
        >
          {t(`toolbar.sort.${value}`)}
        </SelectRow>
      ))}
    </QuickSelect>
  );

  const viewToggle = (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--color-market-border)] p-1">
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-label={t("toolbar.gridView")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          view === "grid"
            ? "bg-blue-600 text-white"
            : "text-[var(--color-market-text-muted)] hover:bg-[var(--color-market-background)]"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setView("list")}
        aria-label={t("toolbar.listView")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          view === "list"
            ? "bg-blue-600 text-white"
            : "text-[var(--color-market-text-muted)] hover:bg-[var(--color-market-background)]"
        }`}
      >
        <ListIcon className="h-4 w-4" />
      </button>
    </div>
  );

  const locationSelect = (
    <QuickSelect
      icon={MapPin}
      label={filters.location ?? t("search.allSriLanka")}
    >
      <SelectRow
        active={!filters.location}
        onClick={() => setFilters({ ...filters, location: null })}
      >
        {t("search.allSriLanka")}
      </SelectRow>
      {ALL_DISTRICTS.map((loc) => (
        <SelectRow
          key={loc}
          active={filters.location === loc}
          onClick={() => setFilters({ ...filters, location: loc })}
        >
          {loc}
        </SelectRow>
      ))}
    </QuickSelect>
  );

  const countText = (
    <p className="whitespace-nowrap text-sm font-semibold text-[var(--color-market-text)]">
      {countLabel}
    </p>
  );

  return (
    <div className="marketplace-page">
      {/* ================= Hero: plain background, no stock photo — the
          search bar and Marketplace Today panel carry the section on
          their own now. ================= */}
      <div className="relative isolate bg-gradient-to-b from-[#eaf1ff] to-[var(--color-market-background)] dark:from-[#0d1930]">
        <section className="relative z-20">
          <div className="relative mx-auto max-w-7xl px-4 pb-3 pt-0 sm:px-6 sm:pb-4 sm:pt-3">
            {/* Mobile: logo mark + search + location on ONE 56px row (the
                global top bar is hidden on listing pages on mobile). */}
            <form
              onSubmit={submitSearch}
              className="flex h-14 items-center gap-2 sm:hidden"
            >
              <Link href="/" aria-label="SLMarket.lk" className="shrink-0">
                <Image
                  src="/icon.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </Link>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("search.placeholder")}
                  aria-label={t("search.placeholder")}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              {locationSelect}
            </form>

            {/* ================= Breadcrumb ================= */}
            <nav className="mb-2 hidden items-center gap-1.5 sm:flex text-xs text-[var(--color-market-text-muted)]">
              <Link href="/" className="hover:text-blue-600">
                {t("breadcrumb.home")}
              </Link>
              <span>/</span>
              <Link href="/ads" className="hover:text-blue-600">
                {t("breadcrumb.listings")}
              </Link>
              <span>/</span>
              {dealScope ? (
                singleDealScope ? (
                  <>
                    <Link href="/ads/deals" className="hover:text-blue-600">
                      {t("breadcrumb.deals")}
                    </Link>
                    <span>/</span>
                    <span className="text-[var(--color-market-text)]">
                      {heading}
                    </span>
                  </>
                ) : (
                  <span className="text-[var(--color-market-text)]">
                    {t("breadcrumb.deals")}
                  </span>
                )
              ) : activeCategory && activeSubcategory ? (
                <>
                  <Link
                    href={categoryHref(activeCategory.id)}
                    className="hover:text-blue-600"
                  >
                    {activeCategory.name}
                  </Link>
                  <span>/</span>
                  <span className="text-[var(--color-market-text)]">
                    {activeSubcategory.name}
                  </span>
                </>
              ) : (
                <span className="text-[var(--color-market-text)]">
                  {activeCategory
                    ? activeCategory.name
                    : t("breadcrumb.allListings")}
                </span>
              )}
            </nav>

            <div className="xl:flex xl:items-start xl:justify-between xl:gap-6">
              <div className="min-w-0 flex-1">
                <div className="max-w-2xl">
                  <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-3xl">
                    {heading}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--color-market-text-secondary)]">
                    {subtitle}
                  </p>
                </div>

                {/* Search + popular searches, on a soft frosted panel so they stay
              readable over the photo */}
                <div className="mt-3 hidden sm:block lg:max-w-[46rem]">
                  <form
                    onSubmit={submitSearch}
                    className="flex flex-col gap-2 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-2 shadow-sm sm:flex-row sm:items-stretch sm:gap-0 sm:p-0"
                  >
                    {/* On mobile this row is [input][location chip] — the
                    category picker moves to sm+ only, since CategoryRow
                    below already covers category selection on mobile. */}
                    <div className="flex items-stretch gap-2 sm:contents">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[var(--color-market-border)] px-4 py-2.5 sm:rounded-none sm:border-0 sm:py-3">
                        <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                        <input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={t("search.placeholder")}
                          aria-label={t("search.placeholder")}
                          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={openCategoryModal}
                        className="hidden shrink-0 items-center gap-2 border-y-0 border-l border-r-0 border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3.5 py-3 text-sm font-medium text-[var(--color-market-text-secondary)] outline-none transition hover:border-blue-200 sm:flex sm:w-44"
                      >
                        <LayoutGrid className="h-4 w-4 shrink-0 text-blue-500" />
                        <span className="flex-1 truncate text-left">
                          {activeSubcategory
                            ? activeSubcategory.name
                            : activeCategory
                              ? activeCategory.name
                              : t("search.allCategories")}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>

                      {locationSelect}
                    </div>

                    <button
                      type="submit"
                      className="btn-solid flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold sm:rounded-none sm:rounded-r-2xl sm:py-3"
                    >
                      <Search className="h-4 w-4" />
                      {t("search.searchButton")}
                    </button>
                  </form>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-1 pb-0.5">
                    <span className="text-xs font-semibold text-[var(--color-market-text-muted)]">
                      {t("search.popularSearches")}
                    </span>
                    {POPULAR_SEARCHES.map((s) => (
                      <Link
                        key={s.key}
                        href={s.href}
                        className="rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)]/80 px-2.5 py-0.5 text-xs font-medium text-[var(--color-market-text-secondary)] transition hover:border-blue-300 hover:text-blue-600"
                      >
                        {t(`search.popular.${s.key}`)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {showGlobalTotal && (
                <div className="mt-2 xl:mt-1">
                  <MarketplaceTodayPanel
                    t={t}
                    onSelectDistrict={(district) =>
                      setFilters({ ...filters, location: district })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        {!dealScope && (
          <div className="pt-4">
            <CategoryRow
              categories={categories}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              allAdsLabel={t("categorySwitcher.all")}
              allInCategoryLabel={
                activeCategory
                  ? `${t("categorySwitcher.all")} ${activeCategory.name}`
                  : null
              }
            />
          </div>
        )}

        {/* ================= Filter command bar (with count / sort / view) ================= */}
        <div className="sticky top-0 z-30 -mx-4 mt-2 border-b border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-4 py-2 sm:static sm:mx-0 sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            categoryId={categoryId}
            categoryName={activeCategory?.name ?? t("categorySwitcher.all")}
            resultsCount={filteredListings.length}
            onClearAll={clearAll}
            mobileSort={mobileSortControl}
            mobileView={viewToggle}
            trailing={
              <>
                {/* Not shown when the stats line under the title already
                    carries this exact number — no duplicate count. */}
                {!showGlobalTotal && countText}
                {sortControl}
                {viewToggle}
              </>
            }
          />
        </div>

        {/* ================= Results ================= */}
        <div ref={resultsRef} className="scroll-mt-4" />
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Search className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-[var(--color-market-text)]">
              {t("empty.title")}
            </p>
            <p className="text-xs text-[var(--color-market-text-muted)]">
              {t("empty.desc")}
            </p>
            <button
              type="button"
              onClick={() => {
                clearAll();
                setSearch("");
                setInputValue("");
              }}
              className="btn-outline mt-2 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              {t("empty.clear")}
            </button>
          </div>
        ) : (
          <div className="mt-5">{chunks.map(renderPage)}</div>
        )}

        {filteredListings.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Desktop and tablet: numbered pages, each a real URL. */}
            <div className="hidden w-full flex-col items-center gap-3 md:flex">
              <p className="text-sm text-[var(--color-market-text-secondary)]">
                {t("pagination.showing", {
                  from: shownFrom.toLocaleString(),
                  to: shownTo.toLocaleString(),
                  total: (showGlobalTotal
                    ? BASE_TOTAL_LISTINGS
                    : filteredListings.length
                  ).toLocaleString(),
                })}
              </p>
              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={goToPage}
                />
              )}
            </div>

            {/* Mobile: append the next 28. */}
            <div className="flex w-full flex-col items-center gap-3 md:hidden">
              <p className="text-sm text-[var(--color-market-text-secondary)]">
                {t("pagination.showingCount", {
                  shown: shownTo.toLocaleString(),
                  total: (showGlobalTotal
                    ? BASE_TOTAL_LISTINGS
                    : filteredListings.length
                  ).toLocaleString(),
                })}
              </p>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  className="btn-outline flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
                >
                  {t("pagination.showMore")}
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>

            {capped && currentPage === MAX_PAGES && (
              <div className="w-full rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 text-center dark:border-blue-900 dark:bg-[#0f1b2e]">
                <p className="text-sm font-semibold text-[var(--color-market-text)]">
                  {t("pagination.narrowTitle")}
                </p>
                <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
                  {t("pagination.narrowDesc")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Businesses move to the bottom of the page, after pagination —
            no mid-scroll row competing with ads, no bento layout. */}
        {showStrip && (
          <div className="mt-10 border-t border-[var(--color-market-border)] pt-8">
            <FeaturedBusinessesStrip shops={stripShops} />
          </div>
        )}
      </div>
    </div>
  );
}
