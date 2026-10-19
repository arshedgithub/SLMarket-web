"use client";

import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categoryAccent, categoryGlyphSrc } from "@/config/const/categoryIcons";
import { useCategoryModalStore } from "@/store/categoryModalStore";

export type CategoryGridItem = {
  id: string;
  name: string;
  count: number;
  // "124 ads", "New", or "" (lib/listings/socialProof.ts decides).
  countLabel: string;
};

// The catch-all category never takes a headline spot.
const ALWAYS_IN_MORE = new Set(["other"]);

/*
 * The categories people browse most, with ads in them: 8 on desktops (one
 * row of 9 with "More"), 7 below that (two rows of 4). "More" opens the
 * All categories menu (the one behind "Browse ads" in the header).
 */
export function CategoryGrid({
  heading,
  items,
  moreLabel,
}: {
  heading: string;
  items: CategoryGridItem[];
  moreLabel: string;
}) {
  const openCategories = useCategoryModalStore((s) => s.open);
  const visible = items
    .filter((i) => i.count > 0 && !ALWAYS_IN_MORE.has(i.id))
    .slice(0, 8);

  return (
    <div>
      <h2 className="font-heading mb-4 text-xl font-extrabold leading-tight tracking-tight text-[color:var(--color-market-text)] sm:text-3xl">
        {heading}
      </h2>
      <ul className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-9">
        {visible.map((item, i) => (
          <li key={item.id} className={i === 7 ? "hidden lg:block" : undefined}>
            <Link
              href={`/ads/${item.id}`}
              className="group flex h-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 sm:border sm:border-[var(--color-market-border)] sm:bg-[var(--color-market-surface)] sm:px-2 sm:py-4 sm:hover:-translate-y-0.5 sm:hover:border-blue-300 sm:hover:shadow-[0_10px_24px_rgba(31,76,150,0.1)]"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition group-hover:scale-105 sm:h-14 sm:w-14 ${categoryAccent(item.id)}`}
              >
                <Image
                  src={categoryGlyphSrc(item.id)}
                  alt=""
                  width={28}
                  height={28}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7"
                />
              </span>
              <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-[color:var(--color-market-text)] sm:text-[15px]">
                {item.name}
              </span>
              {item.countLabel && (
                <span className="text-xs font-medium text-[color:var(--color-market-text-secondary)] sm:text-[13px]">
                  {item.countLabel}
                </span>
              )}
            </Link>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={openCategories}
            aria-haspopup="dialog"
            aria-controls="categories-menu"
            className="group flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 sm:border sm:border-[var(--color-market-border)] sm:bg-[var(--color-market-surface)] sm:px-2 sm:py-4 sm:hover:-translate-y-0.5 sm:hover:border-blue-300 sm:hover:shadow-[0_10px_24px_rgba(31,76,150,0.1)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition group-hover:scale-105 group-hover:bg-blue-50 group-hover:text-blue-700 sm:h-14 sm:w-14 dark:bg-slate-800 dark:text-slate-200">
              <LayoutGrid aria-hidden className="h-6 w-6" />
            </span>
            <span className="text-[13px] font-semibold leading-tight text-[color:var(--color-market-text)] sm:text-[15px]">
              {moreLabel}
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}
