"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SampleShop } from "./data";

const TIER = {
  toprated: { icon: Award, cls: "text-amber-600" },
  premium: { icon: Crown, cls: "text-violet-600" },
  verified: { icon: BadgeCheck, cls: "text-blue-600" },
} as const;

const LOGO_COLORS = [
  "bg-[#0c1f5e]",
  "bg-blue-600",
  "bg-[#1557d6]",
  "bg-pink-600",
  "bg-[#0b5bd3]",
];

function BusinessCard({ shop, index }: { shop: SampleShop; index: number }) {
  const t = useTranslations("listings");
  const tier = TIER[shop.tier];
  const TierIcon = tier.icon;

  return (
    <Link
      href="/businesses"
      className="group flex w-full min-w-0 flex-col overflow-hidden rounded-xl bg-[var(--color-market-surface)] shadow-[0_4px_18px_rgba(15,50,120,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(15,50,120,0.14)]"
    >
      <div className="relative h-24">
        <Image
          src={shop.cover}
          alt=""
          fill
          sizes="320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold shadow-sm ${tier.cls}`}
        >
          <TierIcon className="h-3.5 w-3.5" />
          {t(`shops.tier.${shop.tier}`)}
        </span>
      </div>

      <div className="relative px-3 pb-2.5">
        {/* Thin white ring (larger radius) around the smaller logo circle;
            about 1/4 of it overlaps the cover, and the text is centred on the
            part that sits in the card body. */}
        <span className="absolute -top-[15px] left-3 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[var(--color-market-surface)] p-1.5">
          <span
            className={`flex h-full w-full items-center justify-center rounded-full text-base font-bold text-white ${
              LOGO_COLORS[index % LOGO_COLORS.length]
            }`}
          >
            {shop.name.slice(0, 2).toUpperCase()}
          </span>
        </span>

        <div className="flex h-[53px] items-center gap-2 pl-[80px]">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[13px] font-bold text-[var(--color-market-text)]">
              <span className="truncate">{shop.name}</span>
              <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-market-text-muted)]">
              {shop.category} &middot; {shop.location}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="flex items-center justify-end gap-1 text-[13px] font-bold text-[var(--color-market-text)]">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {shop.rating.toFixed(1)}
            </p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] text-[var(--color-market-text-muted)]">
              {shop.listings} {t("shops.listings")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Compact strip near the top: guaranteed exposure for featured businesses. */
export function FeaturedBusinessesStrip({ shops }: { shops: SampleShop[] }) {
  const t = useTranslations("listings");
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

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
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) =>
    ref.current?.scrollBy({
      left: dir * Math.round(ref.current.clientWidth * 0.8),
      behavior: "smooth",
    });

  // Auto-advance so the featured slots get exposure without a click, same
  // pause-on-manual-scroll behaviour as the homepage rails.
  useEffect(() => {
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
  }, []);

  if (shops.length === 0) return null;

  const arrowCls =
    "hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 lg:flex";

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex min-w-0 items-center gap-3">
          <Star className="h-6 w-6 shrink-0 fill-amber-400 text-amber-400" />
          <h2 className="font-heading text-lg font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-xl">
            {t("shops.heading")}
          </h2>
          <span className="hidden h-5 w-px bg-[var(--color-market-border-strong)] md:block" />
          <p className="hidden truncate text-sm text-[var(--color-market-text-muted)] md:block">
            {t("shops.subheading")}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {t("shops.exploreAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            aria-label={t("shops.scrollLeft")}
            className={arrowCls}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            aria-label={t("shops.scrollRight")}
            className={arrowCls}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1 pt-1"
      >
        {shops.map((shop, i) => (
          <div
            key={shop.name}
            className="w-[310px] shrink-0 snap-start sm:w-[320px]"
          >
            <BusinessCard shop={shop} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
