"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

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

/*
 * Numbered pages. With hrefFor, every page is a real link (?page=N) that
 * crawlers can follow; a click still changes page in place.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  hrefFor?: (page: number) => string;
}) {
  const t = useTranslations("listings");
  const base =
    "flex h-11 min-w-11 items-center justify-center rounded-xl px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

  const PageLink = ({
    to,
    disabled,
    className,
    label,
    current,
    children,
  }: {
    to: number;
    disabled?: boolean;
    className: string;
    label?: string;
    current?: boolean;
    children: React.ReactNode;
  }) => {
    if (hrefFor && !disabled) {
      return (
        <Link
          href={hrefFor(to)}
          scroll={false}
          aria-label={label}
          aria-current={current ? "page" : undefined}
          onClick={(e) => {
            e.preventDefault();
            if (!current) onChange(to);
          }}
          className={className}
        >
          {children}
        </Link>
      );
    }
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-current={current ? "page" : undefined}
        onClick={() => !current && onChange(to)}
        className={className}
      >
        {children}
      </button>
    );
  };

  const edge = `${base} gap-1 px-3 text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-surface)] disabled:pointer-events-none disabled:opacity-40`;

  return (
    <nav
      aria-label={t("pagination.label")}
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <PageLink
        to={page - 1}
        disabled={page <= 1}
        label={t("pagination.previous")}
        className={edge}
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
        <span className="hidden sm:inline">{t("pagination.previous")}</span>
      </PageLink>
      {pageNumbers(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="flex h-11 w-6 items-center justify-center text-[var(--color-market-text-secondary)]"
          >
            &hellip;
          </span>
        ) : (
          <PageLink
            key={n}
            to={n}
            current={n === page}
            label={t("pagination.page", { page: n })}
            className={`${base} ${
              n === page
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {n}
          </PageLink>
        ),
      )}
      <PageLink
        to={page + 1}
        disabled={page >= totalPages}
        label={t("pagination.next")}
        className={edge}
      >
        <span className="hidden sm:inline">{t("pagination.next")}</span>
        <ChevronRight aria-hidden className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}
