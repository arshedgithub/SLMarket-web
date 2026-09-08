"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryIcon } from "@/config/const/categoryIcons";
import { useCategoryModalStore } from "@/store/categoryModalStore";

export type CategoryRailItem = {
  id: string;
  name: string;
  href: string;
  image: string;
  description: string;
  iconName: string;
};

export function CategoryRail({
  items,
  heading,
  subheading,
  viewAllLabel,
}: {
  items: CategoryRailItem[];
  heading: string;
  subheading: string;
  viewAllLabel: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const openCategoryModal = useCategoryModalStore((s) => s.open);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(overflow > 4 && el.scrollLeft < overflow - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // Layout/fonts/images can settle a frame or two after hydration, so
    // measure again on the next frames and whenever the size changes.
    updateArrows();
    const raf1 = requestAnimationFrame(updateArrows);
    const raf2 = requestAnimationFrame(() =>
      requestAnimationFrame(updateArrows),
    );

    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    window.addEventListener("load", updateArrows);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateArrows)
        : null;
    ro?.observe(el);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      window.removeEventListener("load", updateArrows);
      ro?.disconnect();
    };
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.85),
      behavior: "smooth",
    });
  };

  return (
    <div className="rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 shadow-[0_20px_55px_-24px_rgba(16,33,63,0.25)] sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
            {heading}
          </h2>
          <p className="mt-1 truncate text-sm text-[var(--color-market-text-muted)]">
            {subheading}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openCategoryModal}
            className="hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-blue-600 hover:text-blue-700 sm:flex"
          >
            {viewAllLabel}
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canLeft}
              aria-label="Scroll categories left"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canRight}
              aria-label="Scroll categories right"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x gap-3 overflow-x-auto sm:gap-4"
      >
        {items.map((item) => {
          const Icon = categoryIcon(item.iconName);
          return (
            <Link
              key={item.id}
              href={item.href}
              className="market-category-card group block w-[148px] shrink-0 snap-start sm:w-[168px]"
            >
              <div className="relative aspect-[1.15] overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-900">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="180px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-blue-600 shadow-sm dark:bg-slate-900/95 dark:text-blue-300">
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <div className="px-3 pb-3 pt-2.5">
                <h3 className="truncate text-sm font-semibold text-[var(--color-market-text)]">
                  {item.name}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-[var(--color-market-text-muted)]">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={openCategoryModal}
        className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-semibold text-blue-600 sm:hidden"
      >
        {viewAllLabel}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
