"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { categoryIcon } from "@/config/const/categoryIcons";
import {
  GPS_COOKIE,
  PLACE_COOKIE,
  isDistrict,
  nearestDistrict,
  rememberChosenDistrict,
  rememberGpsDistrict,
} from "@/lib/listings/nearYou";

export type HeroCategory = { id: string; name: string; iconName: string };

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Option = {
  value: string | null;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

// A segment of the search bar that opens a list (rendered in a portal so
// the hero's overflow never clips it).
function HeroSelect({
  label,
  ariaLabel,
  icon: Icon,
  options,
  value,
  onChange,
  header,
  className = "",
}: {
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  header?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useOutsideClick([wrapRef, panelRef], () => setOpen(false));

  useIsoLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const place = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left, width: r.width });
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
    <div ref={wrapRef} className={`relative flex min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex h-12 w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:h-14 sm:rounded-none sm:border-0 sm:border-l sm:bg-transparent dark:border-slate-700 dark:bg-white/5 dark:text-slate-200 sm:dark:bg-transparent"
      >
        <Icon className="h-4 w-4 shrink-0 text-blue-600" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, 240),
            }}
            className="scrollbar-hide z-[200] max-h-80 max-w-[92vw] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-2xl dark:bg-[#111d30]"
          >
            {header}
            {options.map((o) => {
              const OptIcon = o.icon;
              const active = o.value === value;
              return (
                <button
                  key={o.value ?? "all"}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[15px] text-text hover:bg-background"
                >
                  {OptIcon && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <OptIcon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="flex-1 truncate">{o.label}</span>
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
  );
}

function readCookie(name: string): string | null {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.split("=")[1]) : null;
}

/*
 * The homepage search: what, which category, where. 56px tall on larger
 * screens; on phones the category and place sit on a row above the input.
 * The place starts as the visitor's district when the site already knows
 * it, and "Use my location" fills it from GPS.
 */
export function HeroSearch({
  categories,
  districts,
  labels,
}: {
  categories: HeroCategory[];
  districts: string[];
  labels: {
    allCategories: string;
    category: string;
    allSriLanka: string;
    location: string;
    useMyLocation: string;
    placeholder: string;
    search: string;
    searchButton: string;
  };
}) {
  const router = useRouter();
  const [category, setCategory] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const known = readCookie(GPS_COOKIE) ?? readCookie(PLACE_COOKIE);
    if (isDistrict(known)) setDistrict(known);
  }, []);

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
        rememberGpsDistrict(d);
        setDistrict(d);
        setLocating(false);
      },
      () => setLocating(false),
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    if (district) {
      params.set("location", district);
      rememberChosenDistrict(district);
    }
    const base = category ? `/ads/${category}` : "/ads";
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  }

  const selectedCategory = categories.find((c) => c.id === category);

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_15px_45px_rgba(30,74,140,0.12)] backdrop-blur sm:flex-row sm:items-stretch sm:gap-0 sm:p-1 dark:border-slate-700 dark:bg-[#111d30]/95"
    >
      <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3.5 sm:order-1 sm:border-0 sm:bg-transparent dark:border-slate-700 dark:bg-white/5 sm:dark:bg-transparent">
        <Search
          aria-hidden
          className="mr-2.5 h-5 w-5 shrink-0 text-slate-500"
        />
        <input
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          aria-label={labels.search}
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 sm:h-14 dark:text-white dark:placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:order-2 sm:flex sm:gap-0">
        <HeroSelect
          className="sm:w-48"
          label={selectedCategory?.name ?? labels.allCategories}
          ariaLabel={labels.category}
          icon={
            selectedCategory
              ? categoryIcon(selectedCategory.iconName)
              : LayoutGrid
          }
          value={category}
          onChange={setCategory}
          options={[
            { value: null, label: labels.allCategories, icon: LayoutGrid },
            ...categories.map((c) => ({
              value: c.id,
              label: c.name,
              icon: categoryIcon(c.iconName),
            })),
          ]}
        />
        <HeroSelect
          className="sm:w-44"
          label={district ?? labels.allSriLanka}
          ariaLabel={labels.location}
          icon={MapPin}
          value={district}
          onChange={setDistrict}
          header={
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="mb-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[15px] font-semibold text-blue-700 hover:bg-background disabled:opacity-60 dark:text-blue-300"
            >
              <LocateFixed
                aria-hidden
                className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`}
              />
              {labels.useMyLocation}
            </button>
          }
          options={[
            { value: null, label: labels.allSriLanka },
            ...districts.map((d) => ({ value: d, label: d })),
          ]}
        />
      </div>

      <button
        type="submit"
        className="market-primary h-12 shrink-0 rounded-xl px-6 text-base font-semibold sm:order-3 sm:ml-1 sm:h-14"
      >
        <Search aria-hidden className="h-5 w-5" />
        {labels.searchButton}
      </button>
    </form>
  );
}
