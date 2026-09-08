"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronRight, MapPin, Search, X } from "lucide-react";
import {
  POPULAR_CITIES,
  SRI_LANKA_DISTRICTS,
  flatCities,
} from "@/config/const/sriLankaLocations";

export function LocationPicker({
  district,
  city,
  onChange,
}: {
  district: string;
  city: string;
  onChange: (next: { district: string; city: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [openDistrict, setOpenDistrict] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flatCities
      .filter(
        (c) =>
          c.city.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query]);

  const pick = (d: string, c: string) => {
    onChange({ district: d, city: c });
    setQuery("");
    setOpenDistrict(null);
  };

  return (
    <div className="space-y-5">
      {/* Selected pill */}
      {city && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 py-3">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-market-text)]">
            <MapPin className="h-4 w-4 text-primary" />
            {city}
            <span className="font-normal text-[var(--color-market-text-muted)]">
              {district} District
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange({ district: "", city: "" })}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-market-text-muted)] hover:bg-surface hover:text-[var(--color-market-text)]"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-market-text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your city or town…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-market-text)] outline-none transition placeholder:text-[var(--color-market-text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {results.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            {results.map((r) => (
              <button
                key={`${r.district}-${r.city}`}
                type="button"
                onClick={() => pick(r.district, r.city)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-background"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="font-medium text-[var(--color-market-text)]">
                  {r.city}
                </span>
                <span className="text-xs text-[var(--color-market-text-muted)]">
                  {r.district}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular chips */}
      {!query && !city && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-market-text-muted)]">
            Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((c) => {
              const d = flatCities.find((f) => f.city === c)?.district ?? c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => pick(d, c)}
                  className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-[var(--color-market-text-secondary)] transition hover:border-primary/40 hover:text-primary"
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Browse by district */}
      {!query && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-market-text-muted)]">
            Browse all districts
          </p>
          <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border bg-surface p-1.5">
            {SRI_LANKA_DISTRICTS.map((d) => {
              const open = openDistrict === d.name;
              return (
                <div key={d.name}>
                  <button
                    type="button"
                    onClick={() => setOpenDistrict(open ? null : d.name)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-background"
                  >
                    <span className="font-semibold text-[var(--color-market-text)]">
                      {d.name}
                      <span className="ml-2 font-normal text-xs text-[var(--color-market-text-muted)]">
                        {d.province}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 text-[var(--color-market-text-muted)] transition-transform ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
                      {d.cities.map((c) => {
                        const active = city === c && district === d.name;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => pick(d.name, c)}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-[var(--color-market-text-secondary)] hover:border-primary/40"
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
