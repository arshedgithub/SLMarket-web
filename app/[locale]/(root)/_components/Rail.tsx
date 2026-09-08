"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Rail({
  eyebrow,
  heading,
  headingHighlight,
  subheading,
  viewAllHref,
  viewAllLabel,
  children,
}: {
  eyebrow?: string;
  heading: string;
  headingHighlight?: string;
  subheading?: string;
  viewAllHref: string;
  viewAllLabel: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(overflow > 4 && el.scrollLeft < overflow - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const r1 = requestAnimationFrame(update);
    const r2 = requestAnimationFrame(() => requestAnimationFrame(update));
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
      ro?.disconnect();
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.82),
      behavior: "smooth",
    });
  };

  const arrowCls =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
            {heading}
            {headingHighlight && (
              <>
                {" "}
                <span className="text-[#1557d6]">{headingHighlight}</span>
              </>
            )}
          </h2>
          {subheading && (
            <p className="mt-1 truncate text-sm text-[var(--color-market-text-muted)]">
              {subheading}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canLeft}
              aria-label="Scroll left"
              className={arrowCls}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canRight}
              aria-label="Scroll right"
              className={arrowCls}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
          >
            {viewAllLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div
        ref={ref}
        className="scrollbar-hide flex gap-3 overflow-x-auto sm:gap-4"
      >
        {children}
      </div>
    </div>
  );
}
