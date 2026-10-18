"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

// At most 7 numbers: first, last, current with neighbours, gaps as "...".
export function pageNumbers(
  current: number,
  total: number,
): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "gap", total];
  if (current >= total - 3)
    return [1, "gap", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "gap", current - 1, current, current + 1, "gap", total];
}

export function Pagination({
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
