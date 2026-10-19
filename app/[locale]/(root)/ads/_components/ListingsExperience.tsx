"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  nearestDistrict,
  rememberChosenDistrict,
  rememberGpsDistrict,
} from "@/lib/listings/nearYou";
import type { FeedStats } from "@/lib/listings/feed";
import { showCount, showNewToday } from "@/lib/listings/socialProof";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import {
  ALL_DISTRICTS,
  DEAL_VALUES,
  SORT_VALUES,
  type DealTag,
  type AdCard,
  type ShopCard,
  type SortValue,
} from "./data";
import { dealsHref } from "./dealRoutes";
import { popularSearches } from "@/lib/listings/popularSearches";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  FilterBar,
  type FiltersState,
} from "./FilterBar";
import { ListingCard } from "./ListingCard";
import {
  filterAds,
  filtersFromParams,
  paginate,
  pageSizeFor,
  paramsFromFilters,
  remapPage,
  sameDeals,
  slotsAfterFor,
  type Bucket,
} from "./adQuery";
import { FeaturedBusinessesStrip } from "./BusinessCards";
import { CategoryRow } from "./CategoryRow";
import { Pagination } from "./Pagination";
import { SaveSearchButton } from "./SaveSearchButton";
import { useBucket } from "./useBucket";
import { useSpotlights } from "@/components/spotlight/useSpotlights";
import { SpotlightCard } from "@/components/spotlight/SpotlightCard";

export type CategoryOption = {
  id: string;
  name: string;
  iconName: string;
  subcategories: { id: string; name: string }[];
};

const MAX_PAGES = 50;

function categoryHref(id: string | null) {
  return id ? `/ads/${id}` : "/ads";
}

/* ============================================================
 * Small inline selects for the top search bar
 * ============================================================ */

function QuickSelect({
  icon: Icon,
  label,
  ariaLabel,
  standalone = false,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  ariaLabel?: string;
  // A free-standing pill (toolbar) instead of a segment of the search bar.
  standalone?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));

  return (
    <div ref={ref} className="relative w-auto shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`flex h-10 items-center gap-1.5 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:border-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          standalone
            ? "px-3.5"
            : "px-3 sm:h-auto sm:w-44 sm:rounded-none sm:border-y-0 sm:border-l sm:border-r-0 sm:px-3.5 sm:py-3"
        }`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-blue-600" />}
        <span className="max-w-24 truncate sm:max-w-none sm:flex-1 sm:text-left">
          {label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--color-market-text-secondary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          onClick={() => setOpen(false)}
          className="scrollbar-hide absolute right-0 top-[calc(100%+8px)] z-30 max-h-72 w-60 overflow-y-auto rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-2xl"
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
      role="option"
      aria-selected={active}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--color-market-text)] hover:bg-[var(--color-market-background)]"
    >
      <span className="flex-1 truncate">{children}</span>
      {active && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
    </button>
  );
}

/* ============================================================
 * Main experience
 * ============================================================ */

type GridEntry =
  | { kind: "ad"; ad: AdCard; index: number }
  | { kind: "slot"; slot: number };

export function ListingsExperience({
  categories,
  initialCategoryId,
  initialSubcategoryId,
  dealScope,
  ads,
  stats,
  stripShops,
  now,
  initialBucket,
  initialOrigin,
}: {
  categories: CategoryOption[];
  // The ads to list (lib/listings/feed.ts) and the counts around them.
  ads: AdCard[];
  stats: FeedStats;
  // Businesses for the Featured strip (lib/listings/feed.ts featuredStripShops).
  stripShops: ShopCard[];
  // Server time, so time-based labels match between server and client.
  now: number;
  // The server's guess at the screen size (ads per page).
  initialBucket: Bucket;
  // The visitor's district from GPS or an earlier choice, for "Nearest".
  initialOrigin: string | null;
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
  const [gpsOrigin, setGpsOrigin] = useState<string | null>(null);
  const origin = filters.location ?? gpsOrigin ?? initialOrigin;

  // The district picked here is "near you" for ad page recommendations.
  useEffect(() => {
    rememberChosenDistrict(filters.location);
  }, [filters.location]);

  const [sort, setSortState] = useState<SortValue>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(() => {
    const n = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(n) && n > 1 ? Math.min(n, MAX_PAGES) : 1;
  });
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // "Nearest" needs a place: the chosen location, else GPS (asked once).
  function setSort(next: SortValue) {
    setSortState(next);
    if (
      next !== "nearest" ||
      origin ||
      typeof navigator === "undefined" ||
      !navigator.geolocation
    )
      return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const district = nearestDistrict(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        rememberGpsDistrict(district);
        setGpsOrigin(district);
      },
      () => setSortState("newest"),
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }

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
  }, [urlPage]);

  // Any change to what is being listed starts again from page 1.
  const prevListKey = useRef<string | null>(null);
  useEffect(() => {
    if (prevListKey.current !== null && prevListKey.current !== listKey)
      setPage(1);
    prevListKey.current = listKey;
  }, [listKey]);

  // Ads per page follow the screen (adQuery.ts BUCKETS). When the size
  // changes (rotation, resize, the server guessed wrong), the page that
  // holds the same first ad is kept in view.
  const bucket = useBucket(initialBucket);
  const pageSize = pageSizeFor(bucket, view);
  const prevPageSize = useRef(pageSize);
  useEffect(() => {
    if (prevPageSize.current === pageSize) return;
    const from = prevPageSize.current;
    prevPageSize.current = pageSize;
    setPage((p) => Math.max(1, remapPage(p, from, pageSize)));
  }, [pageSize]);

  const filteredListings = useMemo(
    () =>
      filterAds(ads, {
        categoryId,
        subcategoryId,
        search,
        filters,
        sort,
        origin,
      }),
    [ads, categoryId, subcategoryId, search, filters, sort, origin],
  );

  // Featured first (up to 3 per page), no seller twice in a row, at most
  // 2 per page (adQuery.ts paginate).
  const pages = useMemo(
    () => paginate(filteredListings, pageSize, sort).slice(0, MAX_PAGES),
    [filteredListings, pageSize, sort],
  );
  const totalPages = Math.max(1, pages.length);
  const currentPage = Math.min(page, totalPages);
  const pageAds = useMemo(
    () => pages[currentPage - 1] ?? [],
    [pages, currentPage],
  );
  const shownFrom =
    pages.slice(0, currentPage - 1).reduce((n, p) => n + p.length, 0) + 1;
  const shownTo = shownFrom + pageAds.length - 1;
  const capped =
    filteredListings.length > pages.reduce((n, p) => n + p.length, 0);

  function goToPage(next: number) {
    setPage(next);
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ block: "start" }),
    );
  }

  // Spotlight slots: never in the first two rows, at a row boundary, at
  // most 2 a page. Each one is filled only when there is something to show.
  const slotsAfter = slotsAfterFor(bucket, view, pageAds.length);
  const spotlights = useSpotlights({
    count: slotsAfter.length,
    category: categoryId,
    district: filters.location,
    exclude: [],
    pageKey: `${pathname}|${listKey}|${currentPage}|${bucket}|${view}`,
  });

  const entries = useMemo(() => {
    const out: GridEntry[] = [];
    pageAds.forEach((ad, index) => {
      out.push({ kind: "ad", ad, index });
      const slot = slotsAfter.indexOf(index + 1);
      if (slot !== -1) out.push({ kind: "slot", slot });
    });
    return out;
  }, [pageAds, slotsAfter]);

  // A business already in a spotlight slot is not repeated in the strip.
  const spotlightBusinessIds = (spotlights ?? [])
    .filter((s) => s.kind === "business")
    .map((s) => s.advertiser);
  const orderedStrip = useMemo(
    () =>
      categoryId
        ? [
            ...stripShops.filter((shop) => shop.categoryId === categoryId),
            ...stripShops.filter((shop) => shop.categoryId !== categoryId),
          ]
        : stripShops,
    [categoryId, stripShops],
  );
  const popularSearchList = useMemo(() => popularSearches(ads, 6), [ads]);

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

  const narrowed =
    !!categoryId ||
    !!dealScope ||
    !!search.trim() ||
    activeFilterCount(filters) > 0;
  // Marketplace-wide numbers only when they are big enough to flatter
  // (lib/listings/socialProof.ts); otherwise plain copy.
  const statsParts = [
    showCount(stats.total)
      ? t("header.totalAds", { count: stats.total })
      : null,
    showNewToday(stats.postedToday)
      ? t("header.newToday", { count: stats.postedToday })
      : null,
  ].filter(Boolean);
  const subtitle = dealScope
    ? t("header.dealsSubtitle")
    : !narrowed && statsParts.length > 0
      ? statsParts.join(" · ")
      : t("header.subtitle");

  const resultsLabel = t("toolbar.resultsFound", {
    count: filteredListings.length,
  });

  // A category with no ads yet asks for the first one instead of showing
  // an empty grid.
  const emptyCategory =
    !!activeCategory &&
    !search.trim() &&
    activeFilterCount(filters) === 0 &&
    filteredListings.length === 0;

  const savedQuery = (() => {
    const qs = paramsFromFilters(search, filters, dealScope).toString();
    return qs ? `${pathname}?${qs}` : pathname;
  })();
  const savedLabel =
    [
      search.trim() ? `"${search.trim()}"` : null,
      activeSubcategory?.name ??
        activeCategory?.name ??
        (dealScope ? heading : null),
      filters.location,
    ]
      .filter(Boolean)
      .join(" · ") || t("header.allListingsTitle");

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

  const hrefForPage = (n: number) => {
    const qs = paramsFromFilters(search, filters, dealScope, n).toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const sortOptions = SORT_VALUES.map((value) => (
    <SelectRow
      key={value}
      active={sort === value}
      onClick={() => setSort(value)}
    >
      {t(`toolbar.sort.${value}`)}
    </SelectRow>
  ));

  const sortControl = (
    <QuickSelect
      standalone
      label={t(`toolbar.sort.${sort}`)}
      ariaLabel={t("toolbar.sortLabel")}
    >
      {sortOptions}
    </QuickSelect>
  );

  const mobileSortControl = (
    <QuickSelect
      standalone
      icon={ArrowUpDown}
      label={t("toolbar.sortShort")}
      ariaLabel={t("toolbar.sortLabel")}
    >
      {sortOptions}
    </QuickSelect>
  );

  const viewToggle = (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1">
      {(
        [
          ["grid", LayoutGrid, t("toolbar.gridView")],
          ["list", ListIcon, t("toolbar.listView")],
        ] as const
      ).map(([key, Icon, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setView(key)}
          aria-label={label}
          aria-pressed={view === key}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
            view === key
              ? "bg-blue-600 text-white"
              : "text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-background)]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );

  const locationSelect = (
    <QuickSelect
      icon={MapPin}
      label={filters.location ?? t("search.allSriLanka")}
      ariaLabel={t("filters.location")}
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

  const saveSearch = <SaveSearchButton query={savedQuery} label={savedLabel} />;

  const renderEntry = (entry: GridEntry) => {
    if (entry.kind === "ad") {
      return (
        <ListingCard
          key={entry.ad.id}
          listing={entry.ad}
          view={view}
          priority={currentPage === 1 && entry.index < 4}
        />
      );
    }
    const spot = spotlights?.[entry.slot];
    // Empty means no slot: nothing is rendered and the ads flow on.
    return spot ? (
      <SpotlightCard key={`spot-${entry.slot}`} spot={spot} layout={view} />
    ) : null;
  };

  return (
    <div className="marketplace-page ads-page">
      <div className="relative isolate bg-gradient-to-b from-[#eaf1ff] to-[var(--color-market-background)] dark:from-[#0d1930]">
        <section className="relative z-20">
          <div className="relative mx-auto max-w-7xl px-4 pb-3 pt-0 sm:px-6 sm:pb-4 sm:pt-4">
            {/* Mobile: logo mark + search + location on one row (the global
                top bar is hidden on listing pages on mobile). */}
            <form
              onSubmit={submitSearch}
              role="search"
              className="flex h-16 items-center gap-2 sm:hidden"
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
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3">
                <Search
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[var(--color-market-text-secondary)]"
                />
                <input
                  type="search"
                  enterKeyHint="search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("search.placeholder")}
                  aria-label={t("search.placeholder")}
                  className="min-w-0 flex-1 bg-transparent text-base outline-none"
                />
              </div>
              {locationSelect}
            </form>

            <nav
              aria-label={t("adPage.breadcrumb")}
              className="mb-2 hidden sm:block"
            >
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-market-text-secondary)]">
                <li>
                  <Link href="/" className="hover:text-blue-700">
                    {t("breadcrumb.home")}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                {!dealScope && !activeCategory ? (
                  <li
                    aria-current="page"
                    className="font-medium text-[var(--color-market-text)]"
                  >
                    {t("breadcrumb.allListings")}
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/ads" className="hover:text-blue-700">
                        {t("breadcrumb.allListings")}
                      </Link>
                    </li>
                    <li aria-hidden>/</li>
                    {dealScope ? (
                      singleDealScope ? (
                        <>
                          <li>
                            <Link
                              href="/ads/deals"
                              className="hover:text-blue-700"
                            >
                              {t("breadcrumb.deals")}
                            </Link>
                          </li>
                          <li aria-hidden>/</li>
                          <li
                            aria-current="page"
                            className="font-medium text-[var(--color-market-text)]"
                          >
                            {heading}
                          </li>
                        </>
                      ) : (
                        <li
                          aria-current="page"
                          className="font-medium text-[var(--color-market-text)]"
                        >
                          {t("breadcrumb.deals")}
                        </li>
                      )
                    ) : activeCategory && activeSubcategory ? (
                      <>
                        <li>
                          <Link
                            href={categoryHref(activeCategory.id)}
                            className="hover:text-blue-700"
                          >
                            {activeCategory.name}
                          </Link>
                        </li>
                        <li aria-hidden>/</li>
                        <li
                          aria-current="page"
                          className="font-medium text-[var(--color-market-text)]"
                        >
                          {activeSubcategory.name}
                        </li>
                      </>
                    ) : (
                      <li
                        aria-current="page"
                        className="font-medium text-[var(--color-market-text)]"
                      >
                        {activeCategory?.name}
                      </li>
                    )}
                  </>
                )}
              </ol>
            </nav>

            <div className="max-w-3xl">
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-3xl">
                {heading}
              </h1>
              <p className="mt-1 text-[15px] text-[var(--color-market-text-secondary)]">
                {subtitle}
              </p>
            </div>

            <div className="mt-4 hidden sm:block lg:max-w-[52rem]">
              <form
                onSubmit={submitSearch}
                role="search"
                className="flex items-stretch overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] shadow-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5 px-4">
                  <Search
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-[var(--color-market-text-secondary)]"
                  />
                  <input
                    type="search"
                    enterKeyHint="search"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("search.placeholder")}
                    aria-label={t("search.placeholder")}
                    className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={openCategoryModal}
                  className="flex w-44 shrink-0 items-center gap-2 border-l border-[var(--color-market-border)] px-3.5 text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:text-blue-700"
                >
                  <LayoutGrid
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-blue-600"
                  />
                  <span className="flex-1 truncate text-left">
                    {activeSubcategory?.name ??
                      activeCategory?.name ??
                      t("search.allCategories")}
                  </span>
                  <ChevronDown aria-hidden className="h-4 w-4 shrink-0" />
                </button>

                {locationSelect}

                <button
                  type="submit"
                  className="btn-solid flex items-center justify-center gap-2 px-6 text-[15px] font-semibold"
                >
                  <Search aria-hidden className="h-4 w-4" />
                  {t("search.searchButton")}
                </button>
              </form>

              {popularSearchList.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
                  <span className="text-[13px] font-semibold text-[var(--color-market-text-secondary)]">
                    {t("search.popularSearches")}
                  </span>
                  {popularSearchList.map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      className="inline-flex h-8 items-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 text-[13px] font-medium text-[var(--color-market-text-secondary)] transition hover:border-blue-300 hover:text-blue-700"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        {!dealScope && (
          <div className="pt-4">
            <CategoryRow
              categories={categories}
              stats={stats}
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

        {!emptyCategory && (
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
                  <p className="whitespace-nowrap text-sm font-semibold text-[var(--color-market-text)]">
                    {resultsLabel}
                  </p>
                  {saveSearch}
                  {sortControl}
                  {viewToggle}
                </>
              }
            />
          </div>
        )}

        {/* Phones: the result count and Save search under the filter bar. */}
        {!emptyCategory && (
          <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
            <p className="text-sm font-semibold text-[var(--color-market-text)]">
              {resultsLabel}
            </p>
            {saveSearch}
          </div>
        )}

        <div ref={resultsRef} className="scroll-mt-20" />
        {emptyCategory ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] px-6 py-16 text-center">
            <p className="font-heading text-xl font-bold text-[var(--color-market-text)]">
              {t("empty.firstTitle", {
                category: activeSubcategory?.name ?? activeCategory?.name ?? "",
              })}
            </p>
            <p className="max-w-md text-[15px] text-[var(--color-market-text-secondary)]">
              {t("empty.firstDesc")}
            </p>
            <Link
              href="/post-ad"
              className="btn-solid mt-3 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              <Plus aria-hidden className="h-4 w-4" />
              {t("empty.firstCta")}
            </Link>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Search
              aria-hidden
              className="h-8 w-8 text-[var(--color-market-text-secondary)]"
            />
            <p className="text-base font-semibold text-[var(--color-market-text)]">
              {t("empty.title")}
            </p>
            <p className="text-sm text-[var(--color-market-text-secondary)]">
              {t("empty.desc")}
            </p>
            <button
              type="button"
              onClick={() => {
                clearAll();
                setSearch("");
                setInputValue("");
              }}
              className="btn-outline mt-2 h-11 rounded-xl px-4 text-sm font-semibold"
            >
              {t("empty.clear")}
            </button>
          </div>
        ) : (
          <div
            className={`mt-5 ${
              view === "grid"
                ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
                : "flex flex-col gap-3"
            }`}
          >
            {entries.map(renderEntry)}
          </div>
        )}

        {filteredListings.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-sm text-[var(--color-market-text-secondary)]">
              {t("pagination.showing", {
                from: shownFrom.toLocaleString("en-US"),
                to: shownTo.toLocaleString("en-US"),
                total: filteredListings.length,
              })}
            </p>
            {totalPages > 1 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={goToPage}
                hrefFor={hrefForPage}
              />
            )}
            {capped && currentPage === totalPages && (
              <div className="w-full rounded-2xl border border-blue-100 bg-[#f4f8ff] p-4 text-center dark:border-blue-900 dark:bg-[#0f1b2e]">
                <p className="text-sm font-semibold text-[var(--color-market-text)]">
                  {t("pagination.narrowTitle")}
                </p>
                <p className="mt-1 text-sm text-[var(--color-market-text-secondary)]">
                  {t("pagination.narrowDesc")}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-surface)] hover:text-blue-700"
            >
              <ArrowUp aria-hidden className="h-4 w-4" />
              {t("pagination.backToTop")}
            </button>
          </div>
        )}

        {!search.trim() && (
          <div className="mt-12 border-t border-[var(--color-market-border)] pt-10 empty:hidden">
            <FeaturedBusinessesStrip
              shops={orderedStrip}
              now={now}
              hideIds={spotlightBusinessIds}
            />
          </div>
        )}
      </div>
    </div>
  );
}
