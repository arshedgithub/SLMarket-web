"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  whatsappHref,
  type StorefrontBusiness,
} from "@/lib/business/storefront";
import { BusinessLogo, ShareMenu, useFollow } from "./Hero";
import { scrollToSection } from "./format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

// `also`: other section ids that belong to this item (Products covers
// collections, top picks and the full catalogue).
export type BarSection = {
  id: string;
  label: string;
  count?: number;
  also?: string[];
};

/*
 * Scroll-to-section bar for one long page (not tabs that swap content).
 * Every item scrolls to a full section, allowing for this bar's own height;
 * the active item follows the scroll; the URL hash follows the active
 * section so a link can point straight at Reviews. Once the hero has
 * scrolled away, the bar carries a condensed identity and the contact
 * actions so they are always one tap away.
 */
export function SectionBar({
  business,
  sections,
  stay,
}: {
  business: StorefrontBusiness;
  sections: BarSection[];
  // On /reviews or /questions, only that section lives on the page; the
  // other items lead back to the matching section of the main page.
  stay?: string;
}) {
  const t = useTranslations("storefront");
  const locale = useLocale();
  const follow = useFollow(business);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [condensed, setCondensed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const sectionKey = sections
    .map((s) => [s.id, ...(s.also ?? [])].join("+"))
    .join(",");

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setCondensed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // [element id, bar item id] pairs
    const pairs = sectionKey
      .split(",")
      .filter(Boolean)
      .flatMap((group) => {
        const [item, ...rest] = group.split("+");
        return [item, ...rest].map((el) => [el, item] as const);
      });
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset =
          (barRef.current?.getBoundingClientRect().bottom ?? 120) + 32;
        let current = pairs[0]?.[1] ?? "";
        let best = -Infinity;
        for (const [elId, item] of pairs) {
          const top = document
            .getElementById(elId)
            ?.getBoundingClientRect().top;
          if (top !== undefined && top <= offset && top > best) {
            best = top;
            current = item;
          }
        }
        setActive(current);
        if (window.scrollY > 300 && window.location.hash !== `#${current}`) {
          window.history.replaceState(null, "", `#${current}`);
        }
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [sectionKey]);

  const roundBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-blue-light)]";

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px" />
      <div
        ref={barRef}
        className="sticky top-0 z-30 -mx-4 border-b border-[var(--color-market-border)] bg-[var(--color-market-surface)] md:top-[64px] md:mx-0 md:rounded-b-2xl md:border md:border-t-0"
      >
        {/* Mobile top bar: back, name once the hero has scrolled off,
            follow and share. */}
        <div className="flex h-12 items-center gap-1 px-2 md:hidden">
          <button
            type="button"
            aria-label={t("mobile.back")}
            onClick={() => window.history.back()}
            className={roundBtn}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p
            className={`min-w-0 flex-1 truncate text-sm font-bold text-[var(--color-market-text)] transition-opacity ${
              condensed ? "opacity-100" : "opacity-0"
            }`}
          >
            {business.name}
          </p>
          <button
            type="button"
            aria-pressed={follow.following}
            aria-label={
              follow.following ? t("hero.following") : t("hero.follow")
            }
            onClick={follow.toggle}
            className={roundBtn}
          >
            <Heart
              className={`h-5 w-5 ${follow.following ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>
          <ShareMenu business={business} buttonClassName={roundBtn} />
        </div>

        <div className="flex items-center gap-4 md:px-4">
          {condensed && (
            <div className="hidden min-w-0 items-center gap-2 py-2 md:flex">
              <BusinessLogo
                business={business}
                className="h-8 w-8 text-xs !ring-2"
              />
              <span className="max-w-[160px] truncate text-sm font-bold text-[var(--color-market-text)]">
                {business.name}
              </span>
              {business.verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
              )}
            </div>
          )}

          <nav
            aria-label={business.name}
            className="scrollbar-hide flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 md:px-0"
          >
            {sections.map((s) => (
              <a
                key={s.id}
                href={
                  stay !== undefined && s.id !== stay
                    ? `/${locale}/business/${business.slug}#${s.id}`
                    : `#${s.id}`
                }
                aria-current={active === s.id ? "true" : undefined}
                onClick={(e) => {
                  if (stay !== undefined && s.id !== stay) return;
                  e.preventDefault();
                  scrollToSection(s.id);
                  window.history.replaceState(null, "", `#${s.id}`);
                }}
                className={`flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition ${
                  active === s.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-[var(--color-market-text-secondary)] hover:text-blue-600"
                }`}
              >
                {s.label}
                {s.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 text-xs font-bold ${
                      active === s.id
                        ? "bg-blue-600 text-white"
                        : "bg-[var(--color-market-blue-light)] text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {s.count}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {condensed && (
            <div className="hidden items-center gap-2 py-1.5 md:flex">
              <a
                href={whatsappHref(business, SITE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#16a34a] px-3 text-sm font-bold text-white hover:bg-[#15803d]"
              >
                <MessageCircle className="h-4 w-4" />
                {t("hero.whatsapp")}
              </a>
              <a
                href={`tel:+${business.phone}`}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
              >
                <Phone className="h-4 w-4" />
                {t("hero.call")}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
