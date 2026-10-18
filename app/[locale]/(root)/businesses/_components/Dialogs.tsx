"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  DISTANCE_OPTIONS,
  SORT_KEYS,
  type DeliveryFilter,
  type DirectoryFilters,
} from "@/lib/business/directory/types";

function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const t = useTranslations("businesses");
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full flex-col rounded-t-2xl bg-[var(--color-market-surface)] md:max-w-lg md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-market-border)] px-5 py-4">
          <h2 className="text-base font-extrabold text-[var(--color-market-text)]">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label={t("directory.close")}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-market-blue-light)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-[var(--color-market-border)] px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-blue-600"
      />
      <span>
        <span className="block text-sm font-semibold text-[var(--color-market-text)]">
          {label}
        </span>
        {hint && (
          <span className="block text-xs text-[var(--color-market-text-muted)]">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

export function AllFiltersSheet({
  filters,
  onChange,
  onClear,
  onClose,
  resultCount,
  brands,
  onRanking,
}: {
  filters: DirectoryFilters;
  onChange: (patch: Partial<DirectoryFilters>) => void;
  onClear: () => void;
  onClose: () => void;
  resultCount: number;
  brands: string[];
  onRanking: () => void;
}) {
  const t = useTranslations("businesses");
  const toggleDelivery = (d: DeliveryFilter) =>
    onChange({
      delivery: filters.delivery.includes(d)
        ? filters.delivery.filter((x) => x !== d)
        : [...filters.delivery, d],
    });
  return (
    <Modal
      title={t("directory.allFilters")}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClear}
            className="btn-outline h-11 flex-1 rounded-xl text-sm font-semibold"
          >
            {t("directory.clearAll")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-solid h-11 flex-1 rounded-xl text-sm font-bold"
          >
            {t("directory.showResults", { count: resultCount })}
          </button>
        </div>
      }
    >
      <fieldset className="border-b border-[var(--color-market-border)] pb-3">
        <legend className="mb-2 text-[13px] font-bold text-[var(--color-market-text)]">
          {t("directory.sortBy")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {SORT_KEYS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filters.sort === s}
              onClick={() => onChange({ sort: s })}
              className={`h-9 rounded-lg border px-3 text-sm font-medium ${
                filters.sort === s
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)]"
              }`}
            >
              {t(`directory.sort.${s}`)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRanking}
          className="mt-2 text-[13px] font-semibold text-blue-600"
        >
          {t("directory.howRanking")}
        </button>
      </fieldset>
      <Check
        checked={filters.verified}
        onChange={(v) => onChange({ verified: v })}
        label={t("directory.verified")}
        hint={t("directory.verifiedHint")}
      />
      <Check
        checked={filters.open}
        onChange={(v) => onChange({ open: v })}
        label={t("directory.openNowFilter")}
        hint={t("directory.openHint")}
      />
      <Check
        checked={filters.rating4}
        onChange={(v) => onChange({ rating4: v })}
        label={t("directory.rating4")}
        hint={t("directory.ratingHint")}
      />
      <Check
        checked={filters.instalment}
        onChange={(v) => onChange({ instalment: v })}
        label={t("directory.instalment")}
        hint={t("directory.instalmentHint")}
      />

      <fieldset className="mt-3 border-t border-[var(--color-market-border)] pt-3">
        <legend className="text-[13px] font-bold text-[var(--color-market-text)]">
          {t("directory.delivery")}
        </legend>
        <Check
          checked={filters.delivery.includes("islandwide")}
          onChange={() => toggleDelivery("islandwide")}
          label={t("directory.deliveryIslandwide")}
        />
        <Check
          checked={filters.delivery.includes("district")}
          onChange={() => toggleDelivery("district")}
          label={t("directory.deliveryDistrict")}
        />
      </fieldset>

      <fieldset className="mt-3 border-t border-[var(--color-market-border)] pt-3">
        <legend className="mb-2 text-[13px] font-bold text-[var(--color-market-text)]">
          {t("directory.distance")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((km) => (
            <button
              key={km}
              type="button"
              aria-pressed={filters.distanceKm === km}
              onClick={() =>
                onChange({ distanceKm: filters.distanceKm === km ? null : km })
              }
              className={`h-9 rounded-lg border px-3 text-sm font-medium ${
                filters.distanceKm === km
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)]"
              }`}
            >
              {t("directory.withinKm", { km })}
            </button>
          ))}
        </div>
      </fieldset>

      {brands.length > 0 && (
        <div className="mt-3 border-t border-[var(--color-market-border)] pt-3">
          <label
            className="text-[13px] font-bold text-[var(--color-market-text)]"
            htmlFor="auth-brand"
          >
            {t("directory.authorisedDealer")}
          </label>
          <select
            id="auth-brand"
            value={filters.authorisedBrand ?? ""}
            onChange={(e) =>
              onChange({ authorisedBrand: e.target.value || null })
            }
            className="mt-1.5 h-10 w-full rounded-lg border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 text-sm"
          >
            <option value="">{t("directory.anyBrand")}</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
            {t("directory.authorisedHint")}
          </p>
        </div>
      )}
    </Modal>
  );
}

// Plain language, no weights: the signals and what does not count.
export function HowRankingDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("businesses");
  const signals = [
    "relevance",
    "distance",
    "trust",
    "rating",
    "responsiveness",
    "activity",
  ] as const;
  return (
    <Modal title={t("directory.rankingTitle")} onClose={onClose}>
      <p className="text-sm text-[var(--color-market-text-secondary)]">
        {t("directory.rankingIntro")}
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {signals.map((s) => (
          <li
            key={s}
            className="rounded-xl border border-[var(--color-market-border)] p-3"
          >
            <p className="text-sm font-bold text-[var(--color-market-text)]">
              {t(`directory.ranking.${s}.title`)}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--color-market-text-secondary)]">
              {t(`directory.ranking.${s}.text`)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-xl bg-[var(--color-market-blue-light)] p-3 text-[13px] font-medium text-[var(--color-market-text)]">
        {t("directory.rankingPayment")}
      </p>
      <p className="mt-2 text-[13px] text-[var(--color-market-text-secondary)]">
        {t("directory.rankingSponsored")}
      </p>
    </Modal>
  );
}
