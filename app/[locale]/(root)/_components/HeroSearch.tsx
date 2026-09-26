"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, LayoutGrid, Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
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
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  useOutsideClick([ref, panelRef], () => setOpen(false));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const base = selected ? `/ads/${selected.id}` : "/ads";
    const trimmed = query.trim();
    router.push(trimmed ? `${base}?q=${encodeURIComponent(trimmed)}` : base);
  }

  const SelectedIcon = selected ? categoryIcon(selected.iconName) : LayoutGrid;

  useIsoLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const place = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setPos({
        top: r.bottom + 8,
        left: r.left,
        width: r.width,
      });
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
      className="marketplace-search mt-6 max-w-2xl sm:mt-7"
      onSubmit={submitSearch}
    >
      {/* Category dropdown — row 1 on phones, middle segment on desktop */}
      <div
        ref={ref}
        className="relative order-1 flex w-full shrink-0 items-center rounded-xl border border-slate-200 bg-white/70 sm:order-2 sm:w-auto sm:rounded-none sm:border-0 sm:border-l sm:bg-transparent dark:border-slate-700 dark:bg-white/5 sm:dark:bg-transparent"
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={categoryLabel}
          className="flex w-full items-center gap-2 px-3.5 py-3 text-sm font-semibold text-slate-600 outline-none sm:py-2 sm:pl-3 sm:pr-2.5 sm:text-xs dark:text-slate-300"
        >
          <SelectedIcon className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="flex-1 truncate text-left sm:max-w-[92px] lg:max-w-[130px]">
            {selected ? selected.name : allLabel}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform sm:h-3.5 sm:w-3.5 ${
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
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: Math.max(pos.width, 224),
              }}
              className="scrollbar-hide z-[200] max-h-72 max-w-[92vw] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-2xl dark:bg-[#111d30]"
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

      {/* Input + submit — row 2 on phones; on desktop this wrapper dissolves so
          the input and button sit directly in the form's flex row. */}
      <div className="order-2 flex w-full min-w-0 items-center gap-1.5 sm:contents">
        <div className="flex min-w-0 flex-1 items-center rounded-xl bg-white/70 px-3 sm:order-1 sm:rounded-none sm:bg-transparent dark:bg-white/5 sm:dark:bg-transparent">
          <Search className="mr-2.5 h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={searchLabel}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:h-12 dark:text-white"
          />
        </div>

        <button
          type="submit"
          aria-label={searchButtonLabel}
          className="market-primary flex h-11 w-12 shrink-0 items-center justify-center rounded-xl sm:order-3 sm:ml-1 sm:h-12"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
