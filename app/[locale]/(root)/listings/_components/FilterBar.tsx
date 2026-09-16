"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  MapPin,
  Wallet,
  Sparkles,
  UserRound,
  Percent,
  SlidersHorizontal,
  Search,
  X,
} from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  ALL_DISTRICTS,
  CATEGORY_FILTER_FIELDS,
  CONDITION_VALUES,
  DEAL_VALUES,
  PRICE_PRESETS,
  SELLER_VALUES,
  TOP_DISTRICTS,
  type Condition,
  type DealTag,
  type SellerType,
} from "./data";

export type FiltersState = {
  location: string | null;
  priceMin: number | null;
  priceMax: number | null;
  pricePresetKey: string | null;
  condition: Condition;
  seller: SellerType | "all";
  deals: DealTag[];
  extra: Record<string, string>;
};

export const DEFAULT_FILTERS: FiltersState = {
  location: null,
  priceMin: null,
  priceMax: null,
  pricePresetKey: null,
  condition: "na",
  seller: "all",
  deals: [],
  extra: {},
};

export function activeFilterCount(f: FiltersState): number {
  let n = 0;
  if (f.location) n++;
  if (f.priceMin !== null || f.priceMax !== null) n++;
  if (f.condition !== "na") n++;
  if (f.seller !== "all") n++;
  n += f.deals.length;
  n += Object.keys(f.extra).length;
  return n;
}

/* ============================================================
 * Small building blocks
 * ============================================================ */

function PillButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

function FilterPopover({
  label,
  icon: Icon,
  active,
  panelClassName = "w-72",
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  panelClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition ${
          active
            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
            : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-3.5 shadow-2xl ${panelClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Filter group content (shared by desktop popovers + the sheet)
 * ============================================================ */

function LocationFields({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const t = useTranslations("listings");
  const [query, setQuery] = useState("");
  // The search box matches against all 25 districts; with no query, only
  // the 3 districts with the most listings show as one-tap "Popular" picks.
  const filtered = query
    ? ALL_DISTRICTS.filter((l) => l.toLowerCase().includes(query.toLowerCase()))
    : TOP_DISTRICTS;

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
        {t("filters.locationLabel")}
      </p>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[var(--color-market-border)] px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filters.locationSearchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {!query && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-market-text-muted)]">
          {t("filters.popular")}
        </p>
      )}
      <div className="scrollbar-hide flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
        {filtered.map((loc) => (
          <PillButton
            key={loc}
            active={value === loc}
            onClick={() => onChange(value === loc ? null : loc)}
          >
            {loc}
          </PillButton>
        ))}
      </div>
    </div>
  );
}

function PriceFields({
  min,
  max,
  presetKey,
  onChange,
}: {
  min: number | null;
  max: number | null;
  presetKey: string | null;
  onChange: (
    min: number | null,
    max: number | null,
    key: string | null,
  ) => void;
}) {
  const t = useTranslations("listings");
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
        {t("filters.priceRange")}
      </p>
      <div className="mb-3 flex items-center gap-2">
        <input
          type="number"
          placeholder={t("filters.min")}
          value={min ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null, max, null)
          }
          className="w-full min-w-0 rounded-xl border border-[var(--color-market-border)] px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <span className="text-[var(--color-market-text-muted)]">
          {t("filters.to")}
        </span>
        <input
          type="number"
          placeholder={t("filters.max")}
          value={max ?? ""}
          onChange={(e) =>
            onChange(min, e.target.value ? Number(e.target.value) : null, null)
          }
          className="w-full min-w-0 rounded-xl border border-[var(--color-market-border)] px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-market-text-muted)]">
        {t("filters.quickPicks")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PRICE_PRESETS.map((p) => (
          <PillButton
            key={p.key}
            active={presetKey === p.key}
            onClick={() =>
              presetKey === p.key
                ? onChange(null, null, null)
                : onChange(p.min, p.max, p.key)
            }
          >
            {t(`filters.pricePresets.${p.key}`)}
          </PillButton>
        ))}
      </div>
    </div>
  );
}

function ConditionFields({
  value,
  onChange,
}: {
  value: Condition;
  onChange: (v: Condition) => void;
}) {
  const t = useTranslations("listings");
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
        {t("filters.conditionLabel")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CONDITION_VALUES.map((c) => (
          <PillButton key={c} active={value === c} onClick={() => onChange(c)}>
            {t(`filters.condition.${c}`)}
          </PillButton>
        ))}
      </div>
    </div>
  );
}

function SellerFields({
  value,
  onChange,
}: {
  value: SellerType | "all";
  onChange: (v: SellerType | "all") => void;
}) {
  const t = useTranslations("listings");
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
        {t("filters.sellerLabel")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SELLER_VALUES.map((s) => (
          <PillButton key={s} active={value === s} onClick={() => onChange(s)}>
            {t(`filters.seller.${s}`)}
          </PillButton>
        ))}
      </div>
    </div>
  );
}

function DealsFields({
  value,
  onChange,
}: {
  value: DealTag[];
  onChange: (v: DealTag[]) => void;
}) {
  const t = useTranslations("listings");
  const toggle = (tag: DealTag) =>
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag],
    );
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
        {t("filters.deals")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {DEAL_VALUES.map((d) => (
          <PillButton
            key={d}
            active={value.includes(d)}
            onClick={() => toggle(d)}
          >
            {t(`filters.deal.${d}`)}
          </PillButton>
        ))}
      </div>
    </div>
  );
}

function ExtraFields({
  categoryId,
  value,
  onChange,
}: {
  categoryId: string | null;
  value: Record<string, string>;
  onChange: (key: string, v: string | null) => void;
}) {
  const t = useTranslations("listings");
  const fields = categoryId ? CATEGORY_FILTER_FIELDS[categoryId] : undefined;
  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <p className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
            {t(`categoryFields.${categoryId}.${field.key}`)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {field.options.map((opt) => (
              <PillButton
                key={opt}
                active={value[field.key] === opt}
                onClick={() =>
                  onChange(field.key, value[field.key] === opt ? null : opt)
                }
              >
                {opt}
              </PillButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * Full filters sheet — modal on desktop, bottom sheet on mobile
 * ============================================================ */

export function FiltersSheet({
  open,
  onClose,
  filters,
  onFiltersChange,
  categoryId,
  categoryName,
  resultsCount,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  categoryId: string | null;
  categoryName: string;
  resultsCount: number;
  sections: Array<
    "location" | "price" | "condition" | "seller" | "deals" | "extra"
  >;
}) {
  const t = useTranslations("listings");
  if (!open) return null;

  const has = (s: (typeof sections)[number]) => sections.includes(s);
  const hasExtra =
    has("extra") &&
    categoryId &&
    (CATEGORY_FILTER_FIELDS[categoryId]?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("filters.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
      />

      <div className="relative flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-[var(--color-market-surface)] shadow-2xl sm:max-h-[80vh] sm:w-full sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[var(--color-market-border)] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-market-text)]">
              {t("filters.refineResults")}
            </h2>
            {hasExtra && (
              <p className="text-xs text-[var(--color-market-text-muted)]">
                {t("filters.categoryFilters", { category: categoryName })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("filters.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-market-text-muted)] hover:bg-[var(--color-market-background)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {has("location") && (
            <LocationFields
              value={filters.location}
              onChange={(v) => onFiltersChange({ ...filters, location: v })}
            />
          )}
          {has("price") && (
            <PriceFields
              min={filters.priceMin}
              max={filters.priceMax}
              presetKey={filters.pricePresetKey}
              onChange={(min, max, key) =>
                onFiltersChange({
                  ...filters,
                  priceMin: min,
                  priceMax: max,
                  pricePresetKey: key,
                })
              }
            />
          )}
          {has("condition") && (
            <ConditionFields
              value={filters.condition}
              onChange={(v) => onFiltersChange({ ...filters, condition: v })}
            />
          )}
          {hasExtra && (
            <ExtraFields
              categoryId={categoryId}
              value={filters.extra}
              onChange={(key, v) => {
                const extra = { ...filters.extra };
                if (v) extra[key] = v;
                else delete extra[key];
                onFiltersChange({ ...filters, extra });
              }}
            />
          )}
          {has("seller") && (
            <SellerFields
              value={filters.seller}
              onChange={(v) => onFiltersChange({ ...filters, seller: v })}
            />
          )}
          {has("deals") && (
            <DealsFields
              value={filters.deals}
              onChange={(v) => onFiltersChange({ ...filters, deals: v })}
            />
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-[var(--color-market-border)] px-5 py-4">
          <button
            type="button"
            onClick={() => onFiltersChange(DEFAULT_FILTERS)}
            className="text-sm font-semibold text-[var(--color-market-text-secondary)] hover:text-blue-600"
          >
            {t("filters.clear")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-solid ml-auto flex-1 rounded-xl py-3 text-sm font-semibold sm:flex-none sm:px-8"
          >
            {t("filters.showResults", { count: resultsCount })}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Command bar — desktop dropdowns, mobile trigger, active chips
 * ============================================================ */

export function FilterBar({
  filters,
  onFiltersChange,
  categoryId,
  categoryName,
  resultsCount,
}: {
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  categoryId: string | null;
  categoryName: string;
  resultsCount: number;
}) {
  const t = useTranslations("listings");
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasExtraFields =
    categoryId && (CATEGORY_FILTER_FIELDS[categoryId]?.length ?? 0) > 0;

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.location) {
    chips.push({
      key: "location",
      label: filters.location,
      onRemove: () => onFiltersChange({ ...filters, location: null }),
    });
  }
  if (filters.priceMin !== null || filters.priceMax !== null) {
    const label = filters.pricePresetKey
      ? t(`filters.pricePresets.${filters.pricePresetKey}`)
      : `Rs. ${filters.priceMin?.toLocaleString() ?? "0"} ${t("filters.to")} ${
          filters.priceMax ? filters.priceMax.toLocaleString() : "Any"
        }`;
    chips.push({
      key: "price",
      label,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          priceMin: null,
          priceMax: null,
          pricePresetKey: null,
        }),
    });
  }
  if (filters.condition !== "na") {
    chips.push({
      key: "condition",
      label: t(`filters.condition.${filters.condition}`),
      onRemove: () => onFiltersChange({ ...filters, condition: "na" }),
    });
  }
  if (filters.seller !== "all") {
    chips.push({
      key: "seller",
      label: t(`filters.seller.${filters.seller}`),
      onRemove: () => onFiltersChange({ ...filters, seller: "all" }),
    });
  }
  filters.deals.forEach((d) => {
    chips.push({
      key: `deal-${d}`,
      label: t(`filters.deal.${d}`),
      onRemove: () =>
        onFiltersChange({
          ...filters,
          deals: filters.deals.filter((x) => x !== d),
        }),
    });
  });
  Object.entries(filters.extra).forEach(([key, val]) => {
    chips.push({
      key: `extra-${key}`,
      label: val,
      onRemove: () => {
        const extra = { ...filters.extra };
        delete extra[key];
        onFiltersChange({ ...filters, extra });
      },
    });
  });

  return (
    <div>
      {/* Desktop / tablet command bar */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <FilterPopover
          label={t("filters.location")}
          icon={MapPin}
          active={!!filters.location}
        >
          <LocationFields
            value={filters.location}
            onChange={(v) => onFiltersChange({ ...filters, location: v })}
          />
        </FilterPopover>

        <FilterPopover
          label={t("filters.price")}
          icon={Wallet}
          active={filters.priceMin !== null || filters.priceMax !== null}
        >
          <PriceFields
            min={filters.priceMin}
            max={filters.priceMax}
            presetKey={filters.pricePresetKey}
            onChange={(min, max, key) =>
              onFiltersChange({
                ...filters,
                priceMin: min,
                priceMax: max,
                pricePresetKey: key,
              })
            }
          />
        </FilterPopover>

        <FilterPopover
          label={t("filters.conditionLabel")}
          icon={Sparkles}
          active={filters.condition !== "na"}
        >
          <ConditionFields
            value={filters.condition}
            onChange={(v) => onFiltersChange({ ...filters, condition: v })}
          />
        </FilterPopover>

        <FilterPopover
          label={t("filters.sellerLabel")}
          icon={UserRound}
          active={filters.seller !== "all"}
        >
          <SellerFields
            value={filters.seller}
            onChange={(v) => onFiltersChange({ ...filters, seller: v })}
          />
        </FilterPopover>

        <FilterPopover
          label={t("filters.deals")}
          icon={Percent}
          active={filters.deals.length > 0}
        >
          <DealsFields
            value={filters.deals}
            onChange={(v) => onFiltersChange({ ...filters, deals: v })}
          />
        </FilterPopover>

        {hasExtraFields && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              Object.keys(filters.extra).length > 0
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters.moreFilters")}
          </button>
        )}
      </div>

      {/* Mobile trigger */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 py-2.5 text-sm font-semibold text-[var(--color-market-text-secondary)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters.moreFilters")}
          {activeFilterCount(filters) > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white">
              {activeFilterCount(filters)}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-market-text-muted)]">
            {t("filters.active")}
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-300 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => onFiltersChange(DEFAULT_FILTERS)}
            className="text-xs font-semibold text-[var(--color-market-text-muted)] underline-offset-2 hover:text-rose-600 hover:underline"
          >
            {t("filters.clearAll")}
          </button>
        </div>
      )}

      <FiltersSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        categoryId={categoryId}
        categoryName={categoryName}
        resultsCount={resultsCount}
        sections={[
          "location",
          "price",
          "condition",
          "extra",
          "seller",
          "deals",
        ]}
      />
    </div>
  );
}
