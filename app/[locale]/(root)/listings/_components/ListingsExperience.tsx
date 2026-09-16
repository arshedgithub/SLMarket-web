"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Search,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { categoryIcon } from "@/config/const/categoryIcons";
import {
  ALL_DISTRICTS,
  CATEGORY_FILTER_FIELDS,
  locationDistrict,
  POPULAR_SEARCHES,
  PRICE_PRESETS,
  sampleListings,
  sampleShops,
  SORT_VALUES,
  type Condition,
  type DealTag,
  type SellerType,
  type SortValue,
} from "./data";
import { DEFAULT_FILTERS, FilterBar, type FiltersState } from "./FilterBar";
import { ListingCard } from "./ListingCard";
import { FeaturedShopsRail } from "./FeaturedShops";

export type CategoryOption = {
  id: string;
  name: string;
  iconName: string;
};

const PAGE_SIZE = 8;
const BASE_TOTAL_LISTINGS = 25876;

function matchesExtra(
  query: string,
  listing: { title: string; attrs: string[] },
) {
  const haystack = `${listing.title} ${listing.attrs.join(" ")}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function categoryHref(id: string | null) {
  return id ? `/listings/${id}` : "/listings";
}

// Reconstructs filter state from the URL so a shared/bookmarked link (e.g.
// /listings/vehicles?location=Colombo&brand=Toyota&deal=price-drop) opens
// with the same refinements applied.
function filtersFromParams(
  sp: URLSearchParams,
  categoryId: string | null,
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
    deals: sp.getAll("deal") as DealTag[],
    extra,
  };
}

function paramsFromFilters(
  search: string,
  filters: FiltersState,
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
  filters.deals.forEach((d) => params.append("deal", d));
  Object.entries(filters.extra).forEach(([k, v]) => params.set(k, v));
  return params;
}

/* ============================================================
 * Small inline selects for the top search bar
 * ============================================================ */

function QuickSelect({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3.5 py-3 text-sm font-medium text-[var(--color-market-text-secondary)] outline-none transition hover:border-blue-200 sm:w-44 sm:rounded-none sm:border-y-0 sm:border-l sm:border-r-0"
      >
        <Icon className="h-4 w-4 shrink-0 text-blue-500" />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="scrollbar-hide absolute left-0 top-[calc(100%+8px)] z-30 max-h-72 w-full min-w-[200px] overflow-y-auto rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-2xl sm:w-56"
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

/* ============================================================
 * Main experience
 * ============================================================ */

export function ListingsExperience({
  categories,
  initialCategoryId,
}: {
  categories: CategoryOption[];
  initialCategoryId: string | null;
}) {
  const t = useTranslations("listings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryId = initialCategoryId;
  const activeCategory = categories.find((c) => c.id === categoryId) ?? null;

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [inputValue, setInputValue] = useState(search);
  const [filters, setFilters] = useState<FiltersState>(() =>
    filtersFromParams(searchParams, categoryId),
  );
  const [sort, setSort] = useState<SortValue>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Keep the URL shareable/bookmarkable for the search text + every filter.
  useEffect(() => {
    const params = paramsFromFilters(search, filters);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters, pathname]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoryId, search, filters, sort]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    const extraEntries = Object.entries(filters.extra);

    const list = sampleListings.filter((listing) => {
      if (categoryId && listing.categoryId !== categoryId) return false;
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
  }, [categoryId, search, filters, sort]);

  const visibleListings = filteredListings.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredListings.length;

  const contextualShops = useMemo(() => {
    const shops = categoryId
      ? sampleShops.filter((s) => s.categoryId === categoryId)
      : sampleShops;
    return shops.slice(0, 8);
  }, [categoryId]);

  const showShopsRail = search.trim().length === 0;

  const heading = activeCategory
    ? `${activeCategory.name} ${t("header.categoryTitleSuffix")}`
    : t("header.allListingsTitle");
  const shopsHeading = activeCategory
    ? t("shops.headingCategory", { category: activeCategory.name })
    : t("shops.headingAll");

  const displayTotal = categoryId
    ? filteredListings.length
    : BASE_TOTAL_LISTINGS;

  // Category is a route segment (/listings/<id>), not a query param, so
  // switching category is a real navigation. Refinements that still make
  // sense (search, location, price, condition, seller, deals) travel with
  // it; category-specific facets (brand, year, ...) are dropped since they
  // don't apply to the new category.
  function goToCategory(id: string | null) {
    const params = paramsFromFilters(search, filters);
    const prevFields = categoryId
      ? (CATEGORY_FILTER_FIELDS[categoryId] ?? [])
      : [];
    prevFields.forEach((field) => params.delete(field.key));
    const qs = params.toString();
    router.push(qs ? `${categoryHref(id)}?${qs}` : categoryHref(id));
  }

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearch(inputValue.trim());
  }

  return (
    <div className="marketplace-page">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ================= Breadcrumb ================= */}
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-[var(--color-market-text-muted)]">
          <Link href="/" className="hover:text-blue-600">
            {t("breadcrumb.home")}
          </Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-blue-600">
            {t("breadcrumb.listings")}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-market-text)]">
            {activeCategory ? activeCategory.name : t("breadcrumb.allListings")}
          </span>
        </nav>

        {/* ================= Header ================= */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
              {heading}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-market-text-secondary)] sm:text-base">
              {t("header.subtitle")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            <ArrowUpRight className="h-4 w-4" />
            {displayTotal.toLocaleString()} {t("header.listingsStat")}
            <span className="hidden text-[var(--color-market-text-muted)] sm:inline">
              &middot; {t("header.newOpportunities")}
            </span>
          </div>
        </div>

        {/* ================= Search ================= */}
        <form
          onSubmit={submitSearch}
          className="mt-5 flex flex-col overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] shadow-sm sm:flex-row sm:items-stretch"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-3">
            <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.placeholder")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <QuickSelect
            icon={LayoutGrid}
            label={
              activeCategory ? activeCategory.name : t("search.allCategories")
            }
          >
            <SelectRow active={!categoryId} onClick={() => goToCategory(null)}>
              {t("search.allCategories")}
            </SelectRow>
            {categories.map((cat) => (
              <SelectRow
                key={cat.id}
                active={categoryId === cat.id}
                onClick={() => goToCategory(cat.id)}
              >
                {cat.name}
              </SelectRow>
            ))}
          </QuickSelect>

          <QuickSelect
            icon={MapPin}
            label={filters.location ?? t("search.allSriLanka")}
          >
            <SelectRow
              active={!filters.location}
              onClick={() => setFilters((f) => ({ ...f, location: null }))}
            >
              {t("search.allSriLanka")}
            </SelectRow>
            {ALL_DISTRICTS.map((loc) => (
              <SelectRow
                key={loc}
                active={filters.location === loc}
                onClick={() => setFilters((f) => ({ ...f, location: loc }))}
              >
                {loc}
              </SelectRow>
            ))}
          </QuickSelect>

          <button
            type="submit"
            className="btn-solid m-2 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold sm:m-0 sm:rounded-none"
          >
            <Search className="h-4 w-4" />
            {t("search.searchButton")}
          </button>
        </form>

        {/* Popular searches */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-market-text-muted)]">
            {t("search.popularSearches")}
          </span>
          {POPULAR_SEARCHES.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="rounded-full border border-[var(--color-market-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-market-text-secondary)] transition hover:border-blue-300 hover:text-blue-600"
            >
              {t(`search.popular.${s.key}`)}
            </Link>
          ))}
        </div>

        {/* ================= Category switcher ================= */}
        <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => goToCategory(null)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
              !categoryId
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {t("categorySwitcher.all")}
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcon(cat.iconName);
            const active = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => goToCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ================= Featured shops ================= */}
        {showShopsRail && (
          <div className="mt-7">
            <FeaturedShopsRail shops={contextualShops} heading={shopsHeading} />
          </div>
        )}

        {/* ================= Filter command bar ================= */}
        <div className="mt-7">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            categoryId={categoryId}
            categoryName={activeCategory?.name ?? t("categorySwitcher.all")}
            resultsCount={filteredListings.length}
          />
        </div>

        {/* ================= Toolbar ================= */}
        <div className="mt-5 flex items-center justify-between gap-3 border-b border-[var(--color-market-border)] pb-4">
          <p className="text-sm font-semibold text-[var(--color-market-text)]">
            {t("toolbar.resultsFound", { count: filteredListings.length })}
          </p>

          <div className="flex items-center gap-2">
            <QuickSelect icon={ChevronDown} label={t(`toolbar.sort.${sort}`)}>
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

            <div className="hidden items-center gap-1 rounded-xl border border-[var(--color-market-border)] p-1 sm:flex">
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
          </div>
        </div>

        {/* ================= Results grid ================= */}
        {visibleListings.length === 0 ? (
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
                setFilters(DEFAULT_FILTERS);
                setSearch("");
                setInputValue("");
              }}
              className="btn-outline mt-2 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              {t("empty.clear")}
            </button>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
                : "mt-5 flex flex-col gap-3"
            }
          >
            {visibleListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} view={view} />
            ))}
          </div>
        )}

        {canLoadMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="btn-outline flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            >
              {t("loadMore")}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
