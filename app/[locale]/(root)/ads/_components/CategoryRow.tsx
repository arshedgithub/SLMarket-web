"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { compactNumber } from "@/lib/format";
import { showCount } from "@/lib/listings/socialProof";
import { Link } from "@/i18n/navigation";
import { categoryAccent, categoryGlyphSrc } from "@/config/const/categoryIcons";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import type { FeedStats } from "@/lib/listings/feed";
import type { CategoryOption } from "./ListingsExperience";

// Top-level chips, in the traffic order of config/const/navLinks.ts; the
// rest are behind "More" (the category menu).
const TOP_LEVEL_VISIBLE = 8;

type Chip = {
  key: string;
  href: string;
  label: string;
  count: number | null;
  active: boolean;
  hasIcon?: boolean;
};

// Counts below the threshold read as an empty marketplace, so they are
// left out (lib/listings/socialProof.ts).
const visibleCount = (chip: Chip) =>
  chip.count != null && showCount(chip.count) ? chip.count : null;

// Single-line 40px chip: coloured icon circle (the same white glyph +
// accent colour as the homepage's category cards), 14px name, 13px muted
// count. Filled #EEF4FF + blue border + blue text when active — never the
// same look as a filter chip (outlined, neutral icon, chevron).
function ChipLink({ chip }: { chip: Chip }) {
  const locale = useLocale();
  return (
    <Link
      href={chip.href}
      aria-current={chip.active ? "page" : undefined}
      data-active={chip.active || undefined}
      className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border pl-1.5 pr-3 text-[14px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
        chip.active
          ? "border-blue-600 bg-[#EEF4FF] text-blue-700 dark:bg-blue-950/40"
          : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {chip.key === "all" ? (
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <LayoutGrid className="h-[15px] w-[15px]" />
        </span>
      ) : (
        chip.hasIcon && (
          <span
            className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${categoryAccent(chip.key)}`}
          >
            <Image
              src={categoryGlyphSrc(chip.key)}
              alt=""
              width={32}
              height={32}
              className="h-[16px] w-[16px] object-contain"
            />
          </span>
        )
      )}
      {chip.label}
      {visibleCount(chip) != null && (
        <span
          className={`text-[13px] font-medium ${chip.active ? "text-blue-700" : "text-[var(--color-market-text-secondary)]"}`}
        >
          {compactNumber(visibleCount(chip)!, locale)}
        </span>
      )}
    </Link>
  );
}

function BackChipLink({
  backChip,
}: {
  backChip: { href: string; label: string };
}) {
  return (
    <Link
      href={backChip.href}
      className="flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 sm:h-10 text-[14px] font-semibold text-[var(--color-market-text-muted)] hover:text-blue-600"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      {backChip.label}
    </Link>
  );
}

export function CategoryRow({
  categories,
  stats,
  activeCategory,
  activeSubcategory,
  allAdsLabel,
  allInCategoryLabel,
}: {
  categories: CategoryOption[];
  stats: FeedStats;
  activeCategory: CategoryOption | null;
  activeSubcategory: { id: string; name: string } | null;
  allAdsLabel: string;
  // e.g. "All Vehicles" — built by the caller so it can be translated.
  allInCategoryLabel: string | null;
}) {
  const t = useTranslations("listings");
  const openCategoryModal = useCategoryModalStore((s) => s.open);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const update = () => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(overflow > 2 && el.scrollLeft < overflow - 2);
  };
  useEffect(() => {
    update();
    const el = scrollRef.current;
    const ro =
      el && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    if (el) ro?.observe(el);
    return () => ro?.disconnect();
  }, [activeCategory?.id, activeSubcategory?.id]);

  // Bring the active chip into view without moving the page itself.
  useEffect(() => {
    const el = scrollRef.current;
    const active = el?.querySelector<HTMLElement>('[data-active="true"]');
    if (el && active)
      el.scrollLeft =
        active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2;
  }, [activeCategory?.id, activeSubcategory?.id]);

  const scrollBy = (dir: 1 | -1) =>
    scrollRef.current?.scrollBy({
      left: dir * scrollRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });

  let chips: Chip[];
  let backChip: { href: string; label: string } | null = null;
  // Empty categories are a dead end, so they are not offered as chips (the
  // category menu behind "More" still lists every category).
  const withAds = categories.filter((c) => (stats.byCategory[c.id] ?? 0) > 0);

  if (!activeCategory) {
    chips = [
      {
        key: "all",
        href: "/ads",
        label: allAdsLabel,
        count: null,
        active: true,
      },
      ...withAds.slice(0, TOP_LEVEL_VISIBLE).map((cat) => ({
        key: cat.id,
        href: `/ads/${cat.id}`,
        label: cat.name,
        count: stats.byCategory[cat.id] ?? 0,
        active: false,
        hasIcon: true,
      })),
    ];
  } else {
    backChip = activeSubcategory
      ? { href: `/ads/${activeCategory.id}`, label: activeCategory.name }
      : { href: "/ads", label: allAdsLabel };
    chips = [
      {
        key: "all-in-category",
        href: `/ads/${activeCategory.id}`,
        label: allInCategoryLabel ?? activeCategory.name,
        count: stats.byCategory[activeCategory.id] ?? 0,
        active: !activeSubcategory,
      },
      ...activeCategory.subcategories
        .map((sub) => ({
          key: sub.id,
          href: `/ads/${activeCategory.id}/${sub.id}`,
          label: sub.name,
          count: stats.bySubcategory[`${activeCategory.id}/${sub.id}`] ?? 0,
          active: sub.id === activeSubcategory?.id,
        }))
        .filter((c) => c.active || c.count > 0),
    ];
  }

  const fade = `linear-gradient(to right, ${canLeft ? "transparent, black 32px" : "black"}, ${
    canRight ? "black calc(100% - 32px), transparent" : "black"
  })`;
  const arrowCls =
    "absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)] shadow-md transition hover:border-blue-300 hover:text-blue-600 sm:flex";

  return (
    <nav aria-label={t("categorySwitcher.label")} className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={t("shops.scrollLeft")}
          className={`${arrowCls} left-0`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={update}
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-1"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        {backChip && <BackChipLink backChip={backChip} />}
        {chips.map((chip) => (
          <ChipLink key={chip.key} chip={chip} />
        ))}
        {!activeCategory && categories.length > TOP_LEVEL_VISIBLE && (
          <button
            type="button"
            onClick={openCategoryModal}
            className="flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--color-market-border)] px-3 text-[14px] font-semibold text-[var(--color-market-text-secondary)] outline-none hover:border-blue-300 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {t("categorySwitcher.more")}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={t("shops.scrollRight")}
          className={`${arrowCls} right-0`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}
