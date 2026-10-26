"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
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
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  type FiltersState,
} from "./adQuery";

export { activeFilterCount, DEFAULT_FILTERS, type FiltersState };

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
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
      {count}
    </span>
  );
}

function FilterPopover({
  label,
  icon: Icon,
  active,
  count = active ? 1 : 0,
  panelClassName = "w-72",
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  count?: number;
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
        className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-sm font-semibold transition ${
          active
            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
            : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
        {count > 0 && <CountBadge count={count} />}
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
          aria-label={t("filters.locationSearchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none "
        />
      </div>
      {!query && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-market-text-secondary)]">
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
          inputMode="numeric"
          aria-label={t("filters.min")}
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
          inputMode="numeric"
          aria-label={t("filters.max")}
          placeholder={t("filters.max")}
          value={max ?? ""}
          onChange={(e) =>
            onChange(min, e.target.value ? Number(e.target.value) : null, null)
          }
          className="w-full min-w-0 rounded-xl border border-[var(--color-market-border)] px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-market-text-secondary)]">
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
          <div className="space-y-3">
            <p className="text-sm font-bold text-[var(--color-market-text)]">
              {t("filters.moreFilters")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    negotiable: !filters.negotiable,
                  })
                }
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  filters.negotiable
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)]"
                }`}
              >
                {t("filters.negotiable")}
              </button>
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    verifiedOnly: !filters.verifiedOnly,
                  })
                }
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  filters.verifiedOnly
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)]"
                }`}
              >
                {t("filters.verifiedOnly")}
              </button>
            </div>
          </div>
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
  onClearAll,
  mobileSort,
  mobileView,
  trailing,
  chipsTrailing,
}: {
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  categoryId: string | null;
  categoryName: string;
  resultsCount: number;
  onClearAll: () => void;
  // Mobile-only: sort control and view toggle around the key chips.
  mobileSort?: ReactNode;
  mobileView?: ReactNode;
  // Desktop-only content pinned to the right end of the command bar.
  trailing?: ReactNode;
  // Shown at the end of the active-filters row (e.g. Save search).
  chipsTrailing?: ReactNode;
}) {
  const t = useTranslations("listings");
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = activeFilterCount(filters);
  const hasExtraFields =
    categoryId && (CATEGORY_FILTER_FIELDS[categoryId]?.length ?? 0) > 0;

  // No "category" entry here — the category row above already shows the
  // active category with its own way back to "All", so a second removable
  // chip for the same thing would be a duplicate control.
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
  if (filters.negotiable) {
    chips.push({
      key: "negotiable",
      label: t("filters.negotiable"),
      onRemove: () => onFiltersChange({ ...filters, negotiable: false }),
    });
  }
  if (filters.verifiedOnly) {
    chips.push({
      key: "verifiedOnly",
      label: t("filters.verifiedOnly"),
      onRemove: () => onFiltersChange({ ...filters, verifiedOnly: false }),
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
      label: `${t(`categoryFields.${categoryId}.${key}`)}: ${val}`,
      onRemove: () => {
        const extra = { ...filters.extra };
        delete extra[key];
        onFiltersChange({ ...filters, extra });
      },
    });
  });

  return (
    <div>
      {/* Desktop / tablet command bar — no "Category" button here, the
          category row above the toolbar already covers navigation. */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {/* No Location button: the search bar's location picker is the one
            control for it. */}
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
          count={filters.deals.length}
        >
          <DealsFields
            value={filters.deals}
            onChange={(v) => onFiltersChange({ ...filters, deals: v })}
          />
        </FilterPopover>

        {(
          [
            ["negotiable", filters.negotiable],
            ["verifiedOnly", filters.verifiedOnly],
          ] as const
        ).map(([key, on]) => (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onClick={() => onFiltersChange({ ...filters, [key]: !on })}
            className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-sm font-semibold transition ${
              on
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600"
            }`}
          >
            {t(`filters.${key}`)}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-sm font-semibold transition ${
            activeCount > 0
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
              : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasExtraFields
            ? t("filters.categoryFilters", { category: categoryName })
            : t("filters.allFilters")}
          {activeCount > 0 && <CountBadge count={activeCount} />}
        </button>

        {trailing && (
          <div className="ml-auto flex items-center gap-3">{trailing}</div>
        )}
      </div>

      {/* Mobile bar: Filters | Sort | key chips (scroll) | view toggle.
          Solid background with a bottom border — content never shows
          through it while scrolling. */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 text-sm font-semibold text-[var(--color-market-text-secondary)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters.filters")}
          {activeCount > 0 && <CountBadge count={activeCount} />}
        </button>
        {mobileSort}
        <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {[
            {
              key: "price",
              label: t("filters.price"),
              active: filters.priceMin !== null || filters.priceMax !== null,
            },
            {
              key: "condition",
              label: t("filters.conditionLabel"),
              active: filters.condition !== "na",
            },
          ].map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setSheetOpen(true)}
              className={`flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border px-3 text-sm font-semibold ${
                chip.active
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)]"
              }`}
            >
              {chip.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        {mobileView}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-market-text)]">
            {t("filters.resultsCount", { count: resultsCount })}
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={t("filters.removeFilter", { filter: chip.label })}
              className="flex h-8 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
            >
              {chip.label}
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-semibold text-[var(--color-market-text-secondary)] underline-offset-2 hover:text-rose-600 hover:underline"
          >
            {t("filters.clearAll")}
          </button>
          {chipsTrailing && <div className="ml-auto">{chipsTrailing}</div>}
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
