"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, LayoutGrid } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categoryAccent, categoryGlyphSrc } from "@/config/const/categoryIcons";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import { CATEGORY_LISTING_COUNTS, subcategoryListingCount } from "./data";
import type { CategoryOption } from "./ListingsExperience";

// Top-level chips shown before the row runs out of horizontal space — the
// fixed, traffic-ordered subset from config/const/navLinks.ts (see that
// file's header comment: it's the single category schema everything else
// reads from too, so this row, the mega menu and the homepage never
// disagree). No trailing "More" button on mobile: the row just scrolls,
// with the next chip peeking at the edge to signal that.
const TOP_LEVEL_VISIBLE = 8;

type Chip = {
  key: string;
  href: string;
  label: string;
  count: number | null;
  active: boolean;
  hasIcon?: boolean;
};

function ariaLabelFor(chip: Chip) {
  return chip.count != null
    ? `${chip.label}, ${chip.count.toLocaleString()} ads`
    : chip.label;
}

// Single-line 40px chip: coloured icon circle (the same white glyph +
// accent colour as the homepage's category cards), 14px name, 13px muted
// count. Filled #EEF4FF + blue border + blue text when active — never the
// same look as a filter chip (outlined, neutral icon, chevron).
function ChipLink({ chip }: { chip: Chip }) {
  return (
    <Link
      href={chip.href}
      aria-current={chip.active ? "page" : undefined}
      aria-label={ariaLabelFor(chip)}
      data-active={chip.active || undefined}
      className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border pl-1.5 pr-3 sm:h-10 text-[14px] font-semibold transition-colors ${
        chip.active
          ? "border-blue-600 bg-[#EEF4FF] text-blue-700 dark:bg-blue-950/40"
          : chip.count === 0
            ? "pointer-events-none border-[var(--color-market-border)] text-[var(--color-market-text-muted)]/50"
            : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {chip.key === "all" ? (
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/40">
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
      {chip.count != null && (
        <span
          className={`text-[13px] ${chip.active ? "text-blue-600/70" : "text-current opacity-70"}`}
        >
          {chip.count.toLocaleString()}
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
  activeCategory,
  activeSubcategory,
  allAdsLabel,
  allInCategoryLabel,
}: {
  categories: CategoryOption[];
  activeCategory: CategoryOption | null;
  activeSubcategory: { id: string; name: string } | null;
  allAdsLabel: string;
  // e.g. "All Vehicles" — built by the caller so it can be translated.
  allInCategoryLabel: string | null;
}) {
  const openCategoryModal = useCategoryModalStore((s) => s.open);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // The right-edge fade only signals "more to scroll" — once the row is
  // scrolled to its end it goes away so the last chip/More shows clearly.
  const [atEnd, setAtEnd] = useState(false);
  const updateAtEnd = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  };
  useEffect(() => {
    updateAtEnd();
    window.addEventListener("resize", updateAtEnd);
    return () => window.removeEventListener("resize", updateAtEnd);
  }, [activeCategory?.id, activeSubcategory?.id]);

  // Bring the active chip into view on mobile without moving the page
  // itself (the row doesn't stick, so this only matters on first paint).
  useEffect(() => {
    scrollRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeCategory?.id, activeSubcategory?.id]);

  let chips: Chip[];
  let backChip: { href: string; label: string } | null = null;

  if (!activeCategory) {
    chips = [
      {
        key: "all",
        href: "/ads",
        label: allAdsLabel,
        count: null,
        active: true,
      },
      ...categories.slice(0, TOP_LEVEL_VISIBLE).map((cat) => ({
        key: cat.id,
        href: `/ads/${cat.id}`,
        label: cat.name,
        count: CATEGORY_LISTING_COUNTS[cat.id] ?? 0,
        active: false,
        hasIcon: true,
      })),
    ];
  } else if (!activeSubcategory) {
    backChip = { href: "/ads", label: allAdsLabel };
    chips = [
      {
        key: "all-in-category",
        href: `/ads/${activeCategory.id}`,
        label: allInCategoryLabel ?? activeCategory.name,
        count: CATEGORY_LISTING_COUNTS[activeCategory.id] ?? 0,
        active: true,
      },
      ...activeCategory.subcategories.map((sub) => ({
        key: sub.id,
        href: `/ads/${activeCategory.id}/${sub.id}`,
        label: sub.name,
        count: subcategoryListingCount(
          activeCategory.id,
          sub.id,
          activeCategory.subcategories.length,
        ),
        active: false,
      })),
    ];
  } else {
    backChip = {
      href: `/ads/${activeCategory.id}`,
      label: activeCategory.name,
    };
    chips = [
      {
        key: "all-in-category",
        href: `/ads/${activeCategory.id}`,
        label: allInCategoryLabel ?? activeCategory.name,
        count: CATEGORY_LISTING_COUNTS[activeCategory.id] ?? 0,
        active: false,
      },
      ...activeCategory.subcategories.map((sub) => ({
        key: sub.id,
        href: `/ads/${activeCategory.id}/${sub.id}`,
        label: sub.name,
        count: subcategoryListingCount(
          activeCategory.id,
          sub.id,
          activeCategory.subcategories.length,
        ),
        active: sub.id === activeSubcategory.id,
      })),
    ];
  }

  return (
    <nav aria-label="Categories">
      <div
        ref={scrollRef}
        onScroll={updateAtEnd}
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto"
        style={
          atEnd
            ? undefined
            : {
                maskImage:
                  "linear-gradient(to right, black 92%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, black 92%, transparent 100%)",
              }
        }
      >
        {backChip && <BackChipLink backChip={backChip} />}
        {chips.map((chip) => (
          <ChipLink key={chip.key} chip={chip} />
        ))}
        {/* Desktop only — mobile relies on swipe + the peeking next chip,
            per the mobile review (no tap-and-cover arrow). */}
        {!activeCategory && categories.length > TOP_LEVEL_VISIBLE && (
          <button
            type="button"
            onClick={openCategoryModal}
            className="hidden h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--color-market-border)] px-3 text-[14px] font-semibold text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600 sm:flex"
          >
            More
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
}
