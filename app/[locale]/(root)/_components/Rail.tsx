"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Store } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "./SectionHeader";

// Server Components can't pass component references as props, so the
// eyebrow icon travels as a name and gets resolved here on the client.
const EYEBROW_ICONS = { sparkles: Sparkles, store: Store } as const;

export function Rail({
  eyebrow,
  eyebrowIcon,
  heading,
  headingHighlight,
  subheading,
  viewAllHref,
  viewAllLabel,
  dotsCount,
  children,
}: {
  eyebrow?: string;
  eyebrowIcon?: keyof typeof EYEBROW_ICONS;
  heading: string;
  headingHighlight?: string;
  subheading?: string;
  viewAllHref: string;
  viewAllLabel: string;
  dotsCount?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [activeDot, setActiveDot] = useState(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(overflow > 4 && el.scrollLeft < overflow - 4);
    if (dotsCount && dotsCount > 1) {
      const frac = overflow > 0 ? el.scrollLeft / overflow : 0;
      setActiveDot(Math.round(frac * (dotsCount - 1)));
    }
  }, [dotsCount]);

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

  // Auto-advancing carousel, on every screen size (only when dots are
  // shown). Pausing is driven off real *horizontal* scroll events on the
  // rail, not touch — a touchstart also fires when someone's finger merely
  // passes over the rail while scrolling the page vertically past this
  // section, which was pausing the carousel far too often. The grace
  // window after our own scrollBy/scrollTo call is generous because a
  // snap-mandatory rail keeps emitting scroll events while it settles into
  // place, well after the "smooth" animation visually looks done.
  useEffect(() => {
    if (!dotsCount || dotsCount < 2) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pausedUntil = 0;
    let programmatic = false;
    let programmaticTimer: number | undefined;

    const onScroll = () => {
      if (programmatic) return;
      pausedUntil = Date.now() + 6000;
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil) return;
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow <= 8) return;

      programmatic = true;
      window.clearTimeout(programmaticTimer);
      programmaticTimer = window.setTimeout(() => {
        programmatic = false;
      }, 1600);

      if (el.scrollLeft >= overflow - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({
          left: Math.round(el.clientWidth * 0.9),
          behavior: "smooth",
        });
      }
    }, 3500);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(programmaticTimer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [dotsCount]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.82),
      behavior: "smooth",
    });
  };

  const arrowCls =
    "flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <SectionHeader
        eyebrow={eyebrow}
        eyebrowIcon={eyebrowIcon ? EYEBROW_ICONS[eyebrowIcon] : undefined}
        heading={heading}
        headingHighlight={headingHighlight}
        subheading={subheading}
        right={
          <>
            <div className="hidden items-center gap-1.5 lg:flex">
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
              className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {viewAllLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <div
        ref={ref}
        className={`scrollbar-hide flex gap-3 overflow-x-auto sm:gap-4 ${
          dotsCount ? "snap-x snap-mandatory" : ""
        }`}
      >
        {children}
      </div>

      {dotsCount && dotsCount > 1 ? (
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 lg:hidden">
          <span aria-hidden="true" />
          <div className="flex justify-self-center gap-1.5">
            {Array.from({ length: dotsCount }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeDot
                    ? "w-4 bg-blue-600"
                    : "w-1.5 bg-[var(--color-market-border-strong)]"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-self-end gap-1.5">
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
        </div>
      ) : null}
    </div>
  );
}
