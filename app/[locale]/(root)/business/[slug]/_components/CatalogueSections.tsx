"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BadgeCheck,
  ChevronDown,
  Check,
  Copy,
  Search,
  SlidersHorizontal,
  Timer,
  X,
} from "lucide-react";
import { Pagination } from "@/app/[locale]/(root)/ads/_components/Pagination";
import { useIsMdUp } from "@/hooks/useMediaQuery";
import { priceDropPercent } from "@/lib/business/pricing";
import {
  activeOffers,
  type Availability,
  type Condition,
  type StorefrontBusiness,
  type StorefrontCollection,
  type WarrantyKind,
} from "@/lib/business/storefront";
import { ProductCard } from "./ProductCard";
import { cropStyle, formatDate, scrollToSection, useNow } from "./format";

const PAGE_SIZE = 28;
const AUTO_COLLECTION_LIMIT = 3; // automatic ones only when the shop has fewer own
const MAX_COLLECTIONS = 8;
const NEW_ARRIVAL_DAYS = 14;

const humanize = (id: string) =>
  id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");

/* ---------------- shared catalogue state ---------------- */

type CatalogueState = {
  collection: string | null;
  pickCollection: (id: string | null) => void;
};
const CatalogueContext = createContext<CatalogueState>({
  collection: null,
  pickCollection: () => {},
});

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [collection, setCollection] = useState<string | null>(null);
  return (
    <CatalogueContext.Provider
      value={{
        collection,
        pickCollection: (id) => {
          setCollection(id);
          if (id) scrollToSection("products");
        },
      }}
    >
      {children}
    </CatalogueContext.Provider>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-extrabold text-[var(--color-market-text)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] text-[var(--color-market-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

const CARD =
  "rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 md:p-5";

/* ---------------- collections ---------------- */

type ShownCollection = StorefrontCollection & { count: number };

function useCollections(business: StorefrontBusiness): ShownCollection[] {
  return useMemo(() => {
    const countOf = (id: string) => {
      if (id === "auto-new")
        return business.products.filter(
          (p) => p.addedDaysAgo <= NEW_ARRIVAL_DAYS,
        ).length;
      if (id === "auto-drops")
        return business.products.filter((p) =>
          priceDropPercent(p.price, p.lowestPrice30d),
        ).length;
      return business.products.filter((p) => p.collections.includes(id)).length;
    };
    const own = business.collections.slice(0, MAX_COLLECTIONS);
    // Small shops still get something to browse: New arrivals and Price
    // drops build themselves from the catalogue.
    const autos: StorefrontCollection[] =
      business.collections.length < AUTO_COLLECTION_LIMIT
        ? [
            {
              id: "auto-new",
              name: "new",
              image: business.products[0]?.image ?? null,
              crop: business.products[0]?.crop,
            },
            {
              id: "auto-drops",
              name: "drops",
              image: business.products[0]?.image ?? null,
              crop: business.products[0]?.crop,
            },
          ]
        : [];
    return [...own, ...autos]
      .map((c) => ({ ...c, count: countOf(c.id) }))
      .filter((c) => c.count > 0);
  }, [business]);
}

export function CollectionsSection({
  business,
}: {
  business: StorefrontBusiness;
}) {
  const t = useTranslations("storefront");
  const { pickCollection } = useContext(CatalogueContext);
  const collections = useCollections(business);
  if (collections.length === 0) return null;
  const nameOf = (c: ShownCollection) =>
    c.id === "auto-new"
      ? t("collections.autoNew")
      : c.id === "auto-drops"
        ? t("collections.autoDrops")
        : c.name;

  return (
    <section id="collections" className={`${CARD} scroll-mt-32`}>
      <SectionHeading
        title={t("collections.title")}
        subtitle={t("collections.subtitle", { name: business.name })}
      />
      <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {collections.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pickCollection(c.id)}
            className="group w-[132px] shrink-0 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface-soft)] p-1.5 text-left transition hover:border-blue-300 md:w-[148px]"
          >
            <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {c.image && (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="150px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  style={cropStyle(c.crop)}
                />
              )}
            </span>
            <span className="mt-1.5 block truncate px-0.5 text-[13px] font-semibold text-[var(--color-market-text)]">
              {nameOf(c)}
            </span>
            <span className="block px-0.5 text-xs text-[var(--color-market-text-muted)]">
              {t("collections.count", { count: c.count })}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- top picks ---------------- */

export function TopPicksSection({
  business,
}: {
  business: StorefrontBusiness;
}) {
  const t = useTranslations("storefront");
  const picks = business.products.filter((p) => p.pinned).slice(0, 4);
  if (picks.length === 0) return null;
  return (
    <section id="top-picks" className={`${CARD} scroll-mt-32`}>
      <SectionHeading
        title={t("topPicks.title", { name: business.name })}
        action={
          <button
            type="button"
            onClick={() => scrollToSection("products")}
            className="shrink-0 text-sm font-semibold text-blue-600"
          >
            {t("topPicks.viewAll", {
              count: business.products.length,
              kind: t(`kind.${business.itemsKind}`).toLowerCase(),
            })}
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {picks.map((p) => (
          <ProductCard key={p.id} business={business} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ---------------- offers ---------------- */

function CopyCode({ code }: { code: string }) {
  const t = useTranslations("storefront");
  const [copied, setCopied] = useState(false);
  return (
    <span className="flex items-center gap-2">
      <span className="rounded-md border border-dashed border-blue-300 bg-white px-2 py-1 text-xs font-bold tracking-wide text-blue-700 dark:bg-transparent dark:text-blue-300">
        {code}
      </span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="flex h-7 items-center gap-1 rounded-md border border-[var(--color-market-border)] px-2 text-xs font-semibold text-[var(--color-market-text-secondary)] hover:border-blue-300"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        {copied ? t("offers.copied") : t("offers.copy")}
      </button>
    </span>
  );
}

function TimeLeft({ endsAt }: { endsAt: string }) {
  const t = useTranslations("storefront");
  const now = useNow();
  if (!now) return null;
  const ms = new Date(endsAt).getTime() - now.getTime();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor(ms / 3_600_000);
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
      <Timer className="h-3.5 w-3.5" />
      {days >= 1
        ? t("offers.endsInDays", { count: days })
        : hours >= 1
          ? t("offers.endsInHours", { count: hours })
          : t("offers.endsSoon")}
    </span>
  );
}

export function OffersSection({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const now = useNow();
  const offers = activeOffers(business.offers, now ?? new Date(0));
  if (offers.length === 0) return null;
  return (
    <section id="offers" className={`${CARD} scroll-mt-32`}>
      <SectionHeading
        title={t("offers.title")}
        subtitle={t("offers.subtitle", { name: business.name })}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {offers.map((o) => (
          <article
            key={o.id}
            className="flex gap-3 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface-soft)] p-2.5"
          >
            <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {o.image && (
                <Image
                  src={o.image}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                  style={cropStyle(o.crop)}
                />
              )}
              <span className="absolute left-1.5 top-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">
                {o.badge}
              </span>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3 className="text-sm font-bold text-[var(--color-market-blue)]">
                {o.title}
              </h3>
              {o.description && (
                <p className="text-xs text-[var(--color-market-text-secondary)]">
                  {o.description}
                </p>
              )}
              {o.code && <CopyCode code={o.code} />}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <TimeLeft endsAt={o.endsAt} />
                <button
                  type="button"
                  onClick={() => scrollToSection("products")}
                  className="text-xs font-semibold text-blue-600"
                >
                  {t("offers.shop")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- brands ---------------- */

export function BrandsSection({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const locale = useLocale();
  const authorised = business.brands.filter((b) => b.authorised);
  const others = business.brands.filter((b) => !b.authorised);
  if (business.brands.length === 0) return null;

  return (
    <section id="brands" className={`${CARD} scroll-mt-32`}>
      {authorised.length > 0 && (
        <>
          <SectionHeading
            title={t("brands.authorisedTitle")}
            subtitle={t("brands.subtitle")}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {authorised.map((b) => (
              <div
                key={b.name}
                className="flex flex-col items-center gap-1 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface-soft)] p-3 text-center"
              >
                <span className="text-lg font-extrabold tracking-tight text-[var(--color-market-text)]">
                  {b.name}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <BadgeCheck className="h-3.5 w-3.5 fill-blue-600 text-white" />
                  {t("brands.authorised")}
                </span>
                {b.proofVerifiedAt && (
                  <span className="text-xs text-[var(--color-market-text-muted)]">
                    {t("brands.proof", {
                      date: formatDate(b.proofVerifiedAt, locale),
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {others.length > 0 && (
        <div
          className={
            authorised.length > 0
              ? "mt-4 border-t border-[var(--color-market-border)] pt-4"
              : ""
          }
        >
          <p className="mb-2 text-[13px] font-semibold text-[var(--color-market-text-secondary)]">
            {authorised.length > 0 ? t("brands.also") : t("brands.title")}
          </p>
          <div className="flex flex-wrap gap-2">
            {others.map((b) => (
              <span
                key={b.name}
                className="rounded-lg border border-[var(--color-market-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-market-text-secondary)]"
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- all products ---------------- */

type SortValue = "newest" | "price-asc" | "price-desc";
type Filters = {
  q: string;
  category: string;
  condition: Condition | null;
  availability: Availability | null;
  warranty: WarrantyKind | null;
  brand: string | null;
  min: string;
  max: string;
  sort: SortValue;
};
const DEFAULT_FILTERS: Filters = {
  q: "",
  category: "all",
  condition: null,
  availability: null,
  warranty: null,
  brand: null,
  min: "",
  max: "",
  sort: "newest",
};

function RadioRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T | null) => void;
}) {
  const t = useTranslations("storefront");
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-bold text-[var(--color-market-text)]">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {[{ value: null as T | null, label: t("filters.any") }, ...options].map(
          (o) => (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={value === o.value}
              onClick={() => onChange(o.value)}
              className={`h-9 rounded-lg border px-3 text-sm font-medium transition ${
                value === o.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300"
              }`}
            >
              {o.label}
            </button>
          ),
        )}
      </div>
    </fieldset>
  );
}

export function AllProductsSection({
  business,
}: {
  business: StorefrontBusiness;
}) {
  const t = useTranslations("storefront");
  const isMdUp = useIsMdUp();
  const { collection, pickCollection } = useContext(CatalogueContext);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const kind = t(`kind.${business.itemsKind}`);

  const set = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    business.products.forEach((p) =>
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1),
    );
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [business.products]);
  const brands = useMemo(
    () =>
      [
        ...new Set(
          business.products.map((p) => p.brand).filter((b): b is string => !!b),
        ),
      ].sort(),
    [business.products],
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const min = filters.min ? Number(filters.min) : null;
    const max = filters.max ? Number(filters.max) : null;
    const list = business.products.filter((p) => {
      if (collection === "auto-new" && p.addedDaysAgo > NEW_ARRIVAL_DAYS)
        return false;
      if (
        collection === "auto-drops" &&
        !priceDropPercent(p.price, p.lowestPrice30d)
      )
        return false;
      if (
        collection &&
        !collection.startsWith("auto-") &&
        !p.collections.includes(collection)
      )
        return false;
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (filters.condition && p.condition !== filters.condition) return false;
      if (filters.availability && p.availability !== filters.availability)
        return false;
      if (filters.warranty && p.warranty?.kind !== filters.warranty)
        return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      if (
        q &&
        !`${p.title} ${p.specs.join(" ")} ${p.brand ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    const sorted = [...list];
    if (filters.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-desc")
      sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    // Sold items always go to the end.
    return [
      ...sorted.filter((p) => p.availability !== "sold"),
      ...sorted.filter((p) => p.availability === "sold"),
    ];
  }, [business.products, filters, collection]);

  useEffect(() => setPage(1), [filters, collection]);

  const activeCount =
    [
      filters.condition,
      filters.availability,
      filters.warranty,
      filters.brand,
    ].filter(Boolean).length + (filters.min || filters.max ? 1 : 0);
  const filtersActive =
    activeCount > 0 ||
    !!filters.q ||
    filters.category !== "all" ||
    !!collection;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const shown = isMdUp
    ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filtered.slice(0, currentPage * PAGE_SIZE);
  const shownFrom = isMdUp ? (currentPage - 1) * PAGE_SIZE + 1 : 1;
  const shownTo = isMdUp
    ? Math.min(currentPage * PAGE_SIZE, filtered.length)
    : shown.length;

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    pickCollection(null);
  };

  const conditionOptions = (
    ["new", "used", "reconditioned"] as Condition[]
  ).map((c) => ({
    value: c,
    label: t(`condition.${c}`),
  }));
  const availabilityOptions = (
    ["in-stock", "few-left", "pre-order", "sold"] as Availability[]
  ).map((a) => ({
    value: a,
    label: t(`availability.${a}`),
  }));
  const warrantyOptions = (["company", "shop"] as WarrantyKind[]).map((w) => ({
    value: w,
    label: t(`warranty.${w}`),
  }));

  if (business.products.length === 0) {
    return (
      <section id="products" className={`${CARD} scroll-mt-32`}>
        <h2 className="font-heading text-lg font-extrabold text-[var(--color-market-text)]">
          {t("catalogue.title", { kind, count: 0 })}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-market-text-muted)]">
          {t("catalogue.emptyShop", {
            kind: kind.toLowerCase(),
            name: business.name,
          })}
        </p>
      </section>
    );
  }

  return (
    <section id="products" className={`${CARD} scroll-mt-32`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-extrabold text-[var(--color-market-text)]">
          {t("catalogue.title", { kind, count: business.products.length })}
        </h2>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none">
          <label className="relative min-w-0 flex-1 md:w-[280px] md:flex-none">
            <span className="sr-only">
              {t("catalogue.search", { name: business.name })}
            </span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder={t("catalogue.search", { name: business.name })}
              className="h-10 w-full rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] pl-9 pr-3 text-sm text-[var(--color-market-text)] placeholder:text-[var(--color-market-text-muted)] focus:border-blue-400 focus:outline-none"
            />
          </label>
          <label className="relative hidden md:block">
            <span className="sr-only">{t("catalogue.sort")}</span>
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as SortValue })}
              className="h-10 appearance-none rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] pl-3 pr-8 text-sm font-medium text-[var(--color-market-text)]"
            >
              <option value="newest">{t("catalogue.sortNewest")}</option>
              <option value="price-asc">{t("catalogue.sortPriceAsc")}</option>
              <option value="price-desc">{t("catalogue.sortPriceDesc")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 text-sm font-semibold text-[var(--color-market-text-secondary)] hover:border-blue-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters.title")}
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="scrollbar-hide -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {[["all", business.products.length] as const, ...categories].map(
            ([id, count]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filters.category === id}
                onClick={() => set({ category: id })}
                className={`flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition ${
                  filters.category === id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300"
                }`}
              >
                {id === "all" ? t("catalogue.all") : humanize(id)}
                <span
                  className={`text-xs ${filters.category === id ? "text-white/80" : "text-[var(--color-market-text-muted)]"}`}
                >
                  {count}
                </span>
              </button>
            ),
          )}
        </div>
      )}

      {collection && (
        <p className="mb-3 flex items-center gap-2 text-sm text-[var(--color-market-text-secondary)]">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {collection === "auto-new"
              ? t("collections.autoNew")
              : collection === "auto-drops"
                ? t("collections.autoDrops")
                : (business.collections.find((c) => c.id === collection)
                    ?.name ?? collection)}
          </span>
          <button
            type="button"
            onClick={() => pickCollection(null)}
            aria-label={t("filters.clear")}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[var(--color-market-blue-light)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-semibold text-[var(--color-market-text)]">
            {business.products.length === 0
              ? t("catalogue.emptyShop", {
                  kind: kind.toLowerCase(),
                  name: business.name,
                })
              : t("catalogue.noResults", { kind: kind.toLowerCase() })}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAll}
              className="btn-outline mt-1 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              {t("filters.clear")}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} business={business} product={p} />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-[var(--color-market-text-secondary)]">
              {isMdUp
                ? t("catalogue.showing", {
                    from: shownFrom,
                    to: shownTo,
                    total: filtered.length,
                  })
                : t("catalogue.showingCount", {
                    shown: shownTo,
                    total: filtered.length,
                  })}
            </p>
            {isMdUp
              ? totalPages > 1 && (
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={setPage}
                  />
                )
              : currentPage < totalPages && (
                  <button
                    type="button"
                    onClick={() => setPage(currentPage + 1)}
                    className="btn-outline flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
                  >
                    {t("catalogue.showMore")}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
          </div>
        </>
      )}

      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--color-market-surface)] p-5 md:max-w-md md:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--color-market-text)]">
                {t("filters.title")}
              </h3>
              <button
                type="button"
                aria-label={t("filters.close")}
                onClick={() => setSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-market-blue-light)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <RadioRow
                label={t("filters.condition")}
                value={filters.condition}
                options={conditionOptions}
                onChange={(v) => set({ condition: v })}
              />
              <fieldset>
                <legend className="mb-1.5 text-[13px] font-bold text-[var(--color-market-text)]">
                  {t("filters.price")}
                </legend>
                <div className="flex items-center gap-2">
                  <input
                    inputMode="numeric"
                    value={filters.min}
                    onChange={(e) =>
                      set({ min: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder={t("filters.min")}
                    className="h-10 w-full rounded-lg border border-[var(--color-market-border)] bg-transparent px-3 text-sm"
                  />
                  <span className="text-[var(--color-market-text-muted)]">
                    {t("filters.to")}
                  </span>
                  <input
                    inputMode="numeric"
                    value={filters.max}
                    onChange={(e) =>
                      set({ max: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder={t("filters.max")}
                    className="h-10 w-full rounded-lg border border-[var(--color-market-border)] bg-transparent px-3 text-sm"
                  />
                </div>
              </fieldset>
              <RadioRow
                label={t("filters.availability")}
                value={filters.availability}
                options={availabilityOptions}
                onChange={(v) => set({ availability: v })}
              />
              <RadioRow
                label={t("filters.warranty")}
                value={filters.warranty}
                options={warrantyOptions}
                onChange={(v) => set({ warranty: v })}
              />
              {brands.length > 0 && (
                <RadioRow
                  label={t("filters.brand")}
                  value={filters.brand}
                  options={brands.map((b) => ({ value: b, label: b }))}
                  onChange={(v) => set({ brand: v })}
                />
              )}
              <div className="md:hidden">
                <p className="mb-1.5 text-[13px] font-bold text-[var(--color-market-text)]">
                  {t("catalogue.sort")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["newest", "price-asc", "price-desc"] as SortValue[]).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={filters.sort === s}
                        onClick={() => set({ sort: s })}
                        className={`h-9 rounded-lg border px-3 text-sm font-medium transition ${
                          filters.sort === s
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300"
                        }`}
                      >
                        {s === "newest"
                          ? t("catalogue.sortNewest")
                          : s === "price-asc"
                            ? t("catalogue.sortPriceAsc")
                            : t("catalogue.sortPriceDesc")}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="btn-outline h-11 flex-1 rounded-xl text-sm font-semibold"
              >
                {t("filters.clear")}
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="btn-solid h-11 flex-1 rounded-xl text-sm font-bold"
              >
                {t("filters.show", { count: filtered.length })}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
