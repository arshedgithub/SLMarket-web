"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import { categoryAccent, categoryGlyphSrc } from "@/config/const/categoryIcons";
import { SectionHeader } from "./SectionHeader";

/*
 * Concentric badge: the outer ring is the same translucent surface as the
 * card's label bar (no shadow, no visible seam) with a wide margin around the
 * solid colored disc that carries the white glyph.
 */
function CategoryBadge({
  id,
  size = 52,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const inner = Math.round(size * 0.64);
  const glyph = Math.round(size * 0.4);
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--color-market-surface)] ${className}`}
    >
      <span
        style={{ width: inner, height: inner }}
        className={`flex items-center justify-center rounded-full ${categoryAccent(id)}`}
      >
        <Image
          src={categoryGlyphSrc(id)}
          alt=""
          width={64}
          height={64}
          style={{ width: glyph, height: glyph }}
          className="object-contain"
        />
      </span>
    </span>
  );
}

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

  const arrowCls =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="rounded-3xl border border-[var(--color-market-border)] bg-[color-mix(in_srgb,var(--color-market-surface)_90%,transparent)] p-4 shadow-[0_20px_55px_-24px_rgba(16,33,63,0.25)] sm:p-5">
      <SectionHeader
        heading={heading}
        subheading={subheading}
        right={
          <>
            <div className="hidden items-center gap-1.5 lg:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={!canLeft}
                aria-label="Scroll categories left"
                className={arrowCls}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={!canRight}
                aria-label="Scroll categories right"
                className={arrowCls}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={openCategoryModal}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-600 transition hover:bg-blue-100 sm:px-3.5 sm:py-2 sm:text-sm dark:bg-blue-950 dark:text-blue-300"
            >
              {viewAllLabel}
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        }
      />

      {/* One horizontal rail at every size — 1 card on the narrowest phones,
          2 up to ~sm, then a fixed card width. */}
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x gap-3 overflow-x-auto sm:gap-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[82%] shrink-0 snap-start min-[425px]:w-[46%] sm:w-[220px]"
          >
            <CategoryCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * One category card, identical on mobile and desktop: full-bleed photo with a
 * slightly translucent full-width label bar at the bottom. The icon badge is
 * larger and its top third sits over the photo.
 */
function CategoryCard({ item }: { item: CategoryRailItem }) {
  return (
    <Link
      href={item.href}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-slate-100 dark:bg-slate-800"
    >
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="(max-width: 1024px) 45vw, 220px"
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-r from-[var(--color-market-surface)] from-30% to-[var(--color-market-surface)]/40 py-1.5 pb-4 pl-2 pr-3">
        <CategoryBadge id={item.id} size={56} className="-my-5" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-bold leading-tight text-[var(--color-market-text)]">
            {item.name}
          </h3>
          <p className="truncate text-[10px] leading-tight text-[var(--color-market-text-muted)]">
            {item.description}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-market-text-muted)]" />
      </div>
    </Link>
  );
}
