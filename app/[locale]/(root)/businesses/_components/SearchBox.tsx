"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Clock, Search, Store, Tag, Layers } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useRouter } from "@/i18n/navigation";
import {
  runDirectory,
  type QueryContext,
} from "@/lib/business/directory/query";
import { knownBrands } from "@/lib/business/directory/query";
import { suggest } from "@/lib/business/directory/search";
import { selectSponsored } from "@/lib/business/directory/sponsored";
import type {
  DirectoryBusiness,
  DirectoryFilters,
} from "@/lib/business/directory/types";

const RECENT_KEY = "slm:directory:recent";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 150;

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function SearchBox({
  all,
  filters,
  ctx,
  value,
  onSubmit,
  seenIds,
  compact = false,
}: {
  all: DirectoryBusiness[];
  filters: DirectoryFilters;
  ctx: QueryContext;
  value: string;
  onSubmit: (q: string) => void;
  seenIds: string[];
  compact?: boolean;
}) {
  const t = useTranslations("businesses");
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState(value);
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  useOutsideClick([wrapRef], () => setOpen(false));

  useEffect(() => setText(value), [value]);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [text]);
  useEffect(() => setRecent(readRecent()), []);

  const brands = useMemo(() => knownBrands(all), [all]);
  const suggestions = useMemo(
    () =>
      debounced.trim().length >= 2 ? suggest(debounced, all, brands) : null,
    [debounced, all, brands],
  );

  // At most one sponsored business, labelled, and never a duplicate of the
  // organic name matches above it.
  const sponsoredSuggestion = useMemo(() => {
    if (!suggestions) return null;
    const { results } = runDirectory(all, { ...filters, q: debounced }, ctx);
    const pick = selectSponsored(results, filters.category, seenIds, 1)[0];
    if (!pick || suggestions.businesses.some((b) => b.id === pick.business.id))
      return null;
    return pick.business;
  }, [suggestions, all, filters, debounced, ctx, seenIds]);

  const submit = (q: string) => {
    const clean = q.trim();
    setOpen(false);
    if (clean) {
      const next = [clean, ...readRecent().filter((r) => r !== clean)].slice(
        0,
        MAX_RECENT,
      );
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      setRecent(next);
    }
    onSubmit(clean);
  };

  const showRecent = open && text.trim().length < 2 && recent.length > 0;
  const showSuggestions =
    open &&
    suggestions &&
    (suggestions.businesses.length > 0 ||
      suggestions.products.length > 0 ||
      suggestions.categories.length > 0 ||
      sponsoredSuggestion);

  const row =
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[var(--color-market-text)] hover:bg-[var(--color-market-blue-light)]";
  const heading =
    "px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-[var(--color-market-text-muted)]";

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-1">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="flex items-center gap-2"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("directory.searchLabel")}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("directory.searchPlaceholder")}
            autoComplete="off"
            enterKeyHint="search"
            className={`w-full rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] pl-10 pr-3 text-sm text-[var(--color-market-text)] placeholder:text-[var(--color-market-text-muted)] focus:border-blue-400 focus:outline-none ${
              compact ? "h-10" : "h-12"
            }`}
          />
        </label>
        <button
          type="submit"
          className={`btn-solid shrink-0 rounded-xl px-6 text-sm font-bold ${compact ? "h-10" : "h-12"}`}
        >
          {t("directory.search")}
        </button>
      </form>

      {(showRecent || showSuggestions) && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] pb-1 shadow-xl">
          {showRecent && (
            <>
              <p className={heading}>{t("directory.recent")}</p>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={row}
                  onClick={() => submit(r)}
                >
                  <Clock className="h-4 w-4 text-slate-400" />
                  {r}
                </button>
              ))}
            </>
          )}

          {showSuggestions && suggestions && (
            <>
              {suggestions.businesses.length > 0 && (
                <>
                  <p className={heading}>{t("directory.suggestBusinesses")}</p>
                  {suggestions.businesses.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={row}
                      onClick={() => {
                        setOpen(false);
                        router.push(`/business/${b.slug}`);
                      }}
                    >
                      <Store className="h-4 w-4 text-slate-400" />
                      <span className="flex min-w-0 items-center gap-1 font-semibold">
                        <span className="truncate">{b.name}</span>
                        {b.verifiedLevel >= 2 && (
                          <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
                        )}
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-[var(--color-market-text-muted)]">
                        {b.typeLabel} &middot; {b.city}
                      </span>
                    </button>
                  ))}
                </>
              )}
              {sponsoredSuggestion && (
                <>
                  <p className={heading}>{t("directory.sponsored")}</p>
                  <button
                    type="button"
                    className={row}
                    onClick={() => {
                      setOpen(false);
                      router.push(`/business/${sponsoredSuggestion.slug}`);
                    }}
                  >
                    <Store className="h-4 w-4 text-slate-400" />
                    <span className="truncate font-semibold">
                      {sponsoredSuggestion.name}
                    </span>
                    <span className="ml-auto shrink-0 rounded-full bg-slate-900/75 px-2 py-0.5 text-xs font-semibold text-white">
                      {t("directory.sponsored")}
                    </span>
                  </button>
                </>
              )}
              {suggestions.products.length > 0 && (
                <>
                  <p className={heading}>{t("directory.suggestProducts")}</p>
                  {suggestions.products.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      className={row}
                      onClick={() => submit(p.title)}
                    >
                      <Tag className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{p.title}</span>
                      <span className="ml-auto shrink-0 text-xs text-[var(--color-market-text-muted)]">
                        {t("directory.suggestFrom", {
                          count: p.count,
                          price: p.minPrice.toLocaleString("en-US"),
                        })}
                      </span>
                    </button>
                  ))}
                </>
              )}
              {suggestions.categories.length > 0 && (
                <>
                  <p className={heading}>{t("directory.suggestCategories")}</p>
                  {suggestions.categories.map((c) => (
                    <button
                      key={`${c.categoryId}/${c.subcategoryId ?? ""}`}
                      type="button"
                      className={row}
                      onClick={() => {
                        setOpen(false);
                        router.push(
                          c.subcategoryId
                            ? `/businesses/${c.categoryId}/${c.subcategoryId}`
                            : `/businesses/${c.categoryId}`,
                        );
                      }}
                    >
                      <Layers className="h-4 w-4 text-slate-400" />
                      {t("directory.browseCategory", { name: c.name })}
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
