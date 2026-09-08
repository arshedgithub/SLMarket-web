"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, LayoutGrid, Check } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { categoryIcon } from "@/config/const/categoryIcons";
import type { CategoryRailItem } from "./CategoryRail";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function HeroSearch({
  items,
  allLabel,
  placeholder,
  searchLabel,
  categoryLabel,
  searchButtonLabel,
}: {
  items: CategoryRailItem[];
  allLabel: string;
  placeholder: string;
  searchLabel: string;
  categoryLabel: string;
  searchButtonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CategoryRailItem | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useOutsideClick([ref, panelRef], () => setOpen(false));

  const SelectedIcon = selected ? categoryIcon(selected.iconName) : LayoutGrid;

  useIsoLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const place = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 10, right: window.innerWidth - r.right });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  return (
    <form
      className="marketplace-search mt-7 max-w-2xl"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex min-w-0 flex-1 items-center px-3">
        <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
        <input
          type="search"
          placeholder={placeholder}
          aria-label={searchLabel}
          className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </div>

      <div
        ref={ref}
        className="relative flex shrink-0 items-center border-l border-slate-200 dark:border-slate-700"
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={categoryLabel}
          className="flex items-center gap-1.5 py-2 pl-3 pr-2.5 text-xs font-semibold text-slate-600 outline-none dark:text-slate-300"
        >
          <SelectedIcon className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="max-w-[92px] truncate lg:max-w-[130px]">
            {selected ? selected.name : allLabel}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open &&
          pos &&
          createPortal(
            <div
              ref={panelRef}
              role="listbox"
              style={{ position: "fixed", top: pos.top, right: pos.right }}
              className="scrollbar-hide z-[200] max-h-72 w-64 max-w-[86vw] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-2xl dark:bg-[#111d30]"
            >
              <button
                type="button"
                role="option"
                aria-selected={selected === null}
                onClick={() => {
                  setSelected(null);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-text hover:bg-background"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  <LayoutGrid className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate font-medium">{allLabel}</span>
                {selected === null && (
                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                )}
              </button>

              {items.map((item) => {
                const Icon = categoryIcon(item.iconName);
                const active = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setSelected(item);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-text hover:bg-background"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>
                    {active && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>,
            document.body,
          )}
      </div>

      <button
        type="submit"
        aria-label={searchButtonLabel}
        className="market-primary ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
