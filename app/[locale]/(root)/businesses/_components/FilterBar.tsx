"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronDown,
  Clock,
  Info,
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  DISTANCE_OPTIONS,
  SORT_KEYS,
  type DeliveryFilter,
  type DirectoryFilters,
} from "@/lib/business/directory/types";

export type ViewMode = "grid" | "list" | "map";

const base =
  "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-sm font-semibold transition";
const idle =
  "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300";
const on =
  "border-blue-600 bg-[#EEF4FF] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

function Toggle({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${base} ${active ? on : idle}`}
    >
      {icon}
      {children}
    </button>
  );
}

function Menu({
  label,
  active,
  children,
}: {
  label: ReactNode;
  active: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${base} ${active ? on : idle}`}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 min-w-[220px] rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-xl">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuRow({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-market-text)] hover:bg-[var(--color-market-blue-light)]"
    >
      {children}
      {selected && <Check className="h-4 w-4 text-blue-600" />}
    </button>
  );
}

export function activeFilterCount(f: DirectoryFilters) {
  return (
    [f.verified, f.open, f.rating4, f.instalment].filter(Boolean).length +
    (f.delivery.length > 0 ? 1 : 0) +
    (f.distanceKm !== null ? 1 : 0) +
    (f.authorisedBrand ? 1 : 0)
  );
}

export function DirectoryFilterBar({
  filters,
  onChange,
  view,
  onView,
  onAllFilters,
  onRanking,
  hasUserLocation,
  onUseLocation,
}: {
  filters: DirectoryFilters;
  onChange: (patch: Partial<DirectoryFilters>) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  onAllFilters: () => void;
  onRanking: () => void;
  hasUserLocation: boolean;
  onUseLocation: () => void;
}) {
  const t = useTranslations("businesses");
  const count = activeFilterCount(filters);

  const toggleDelivery = (d: DeliveryFilter) =>
    onChange({
      delivery: filters.delivery.includes(d)
        ? filters.delivery.filter((x) => x !== d)
        : [...filters.delivery, d],
    });

  const views: { key: ViewMode; icon: typeof LayoutGrid }[] = [
    { key: "grid", icon: LayoutGrid },
    { key: "list", icon: ListIcon },
    { key: "map", icon: MapIcon },
  ];

  return (
    <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
      <button
        type="button"
        onClick={onAllFilters}
        className={`${base} ${count > 0 ? on : "border-blue-300 bg-[#EEF4FF] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"}`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("directory.allFilters")}
        {count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {/* Neutral while off; only an active filter takes the accent colour. */}
      <Toggle
        active={filters.verified}
        onClick={() => onChange({ verified: !filters.verified })}
        icon={
          <ShieldCheck
            className={`h-4 w-4 ${filters.verified ? "text-blue-600" : "text-slate-500"}`}
          />
        }
      >
        {t("directory.verified")}
      </Toggle>
      <Toggle
        active={filters.open}
        onClick={() => onChange({ open: !filters.open })}
        icon={
          <Clock
            className={`h-4 w-4 ${filters.open ? "text-blue-600" : "text-slate-500"}`}
          />
        }
      >
        {t("directory.openNowFilter")}
      </Toggle>
      <Toggle
        active={filters.rating4}
        onClick={() => onChange({ rating4: !filters.rating4 })}
        icon={
          <Star
            className={`h-4 w-4 ${filters.rating4 ? "fill-blue-600 text-blue-600" : "text-slate-500"}`}
          />
        }
      >
        {t("directory.rating4")}
      </Toggle>

      <div className="hidden md:block">
        <Menu
          label={t("directory.delivery")}
          active={filters.delivery.length > 0}
        >
          {() => (
            <>
              <MenuRow
                selected={filters.delivery.includes("islandwide")}
                onClick={() => toggleDelivery("islandwide")}
              >
                {t("directory.deliveryIslandwide")}
              </MenuRow>
              <MenuRow
                selected={filters.delivery.includes("district")}
                onClick={() => toggleDelivery("district")}
              >
                {t("directory.deliveryDistrict")}
              </MenuRow>
            </>
          )}
        </Menu>
      </div>

      <div className="hidden md:block">
        <Menu
          label={
            filters.distanceKm
              ? t("directory.withinKm", { km: filters.distanceKm })
              : t("directory.distance")
          }
          active={filters.distanceKm !== null}
        >
          {(close) => (
            <>
              {DISTANCE_OPTIONS.map((km) => (
                <MenuRow
                  key={km}
                  selected={filters.distanceKm === km}
                  onClick={() => {
                    onChange({
                      distanceKm: filters.distanceKm === km ? null : km,
                    });
                    close();
                  }}
                >
                  {t("directory.withinKm", { km })}
                </MenuRow>
              ))}
              {!hasUserLocation && (
                <button
                  type="button"
                  onClick={() => {
                    onUseLocation();
                    close();
                  }}
                  className="mt-1 w-full rounded-lg border-t border-[var(--color-market-border)] px-3 py-2 text-left text-[13px] font-semibold text-blue-600 hover:bg-[var(--color-market-blue-light)]"
                >
                  {t("directory.useMyLocation")}
                </button>
              )}
            </>
          )}
        </Menu>
      </div>

      <span className="mx-1 hidden h-6 w-px bg-[var(--color-market-border)] lg:block" />

      <div className="hidden md:block">
        <Menu
          label={t("directory.sortLabel", {
            sort: t(`directory.sort.${filters.sort}`),
          })}
          active={false}
        >
          {(close) =>
            SORT_KEYS.map((s) => (
              <MenuRow
                key={s}
                selected={filters.sort === s}
                onClick={() => {
                  onChange({ sort: s });
                  close();
                }}
              >
                {t(`directory.sort.${s}`)}
              </MenuRow>
            ))
          }
        </Menu>
      </div>

      <button
        type="button"
        onClick={onRanking}
        className="hidden h-10 items-center gap-1.5 whitespace-nowrap px-1 text-sm font-semibold text-blue-600 hover:underline md:flex"
      >
        <Info className="h-4 w-4" />
        {t("directory.howRanking")}
      </button>

      <div
        className="ml-auto flex shrink-0 items-center gap-1 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1"
        role="group"
        aria-label={t("directory.view")}
      >
        {views.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            aria-label={t(`directory.views.${key}`)}
            onClick={() => onView(key)}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
              view === key
                ? "bg-blue-600 text-white"
                : "text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-blue-light)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t(`directory.views.${key}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
