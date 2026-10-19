"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GPS_COOKIE, PLACE_COOKIE } from "@/lib/listings/nearYou";

function readDistrict(): string | null {
  for (const name of [GPS_COOKIE, PLACE_COOKIE]) {
    const hit = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`));
    if (hit) return decodeURIComponent(hit.split("=")[1]);
  }
  return null;
}

/*
 * Districts with live ads (never a link to an empty page), busiest first,
 * with the visitor's own district moved to the front. Intro and "View all
 * districts" on the left, the district cards on the right.
 */
export function DistrictLinks({
  labels,
  districts,
}: {
  labels: {
    eyebrow: string;
    headingStart: string;
    headingHighlight: string;
    desc: string;
    viewAll: string;
  };
  districts: { name: string; countLabel: string }[];
}) {
  const [own, setOwn] = useState<string | null>(null);
  useEffect(() => setOwn(readDistrict()), []);
  if (districts.length === 0) return null;

  const shownCount =
    districts.length >= 8
      ? 8
      : districts.length >= 6
        ? 6
        : districts.length >= 4
          ? 4
          : districts.length;
  const wideCols = shownCount === 6 ? "sm:grid-cols-3" : "sm:grid-cols-4";
  const ordered = own
    ? [
        ...districts.filter((d) => d.name === own),
        ...districts.filter((d) => d.name !== own),
      ]
    : districts;

  return (
    <section
      aria-labelledby="districts-heading"
      className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center lg:gap-10"
    >
      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-market-text-secondary)]">
          <MapPin aria-hidden className="h-4 w-4 text-[#1557d6]" />
          {labels.eyebrow}
        </p>
        <h2
          id="districts-heading"
          className="font-heading mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-[32px] sm:leading-tight"
        >
          {labels.headingStart}{" "}
          <span className="text-[#1557d6]">{labels.headingHighlight}</span>
        </h2>
        <p className="mt-2 max-w-sm text-[15px] leading-6 text-[var(--color-market-text-secondary)]">
          {labels.desc}
        </p>
        <div className="mt-5 hidden lg:block">
          <Link
            href="/ads"
            className="btn-solid h-11 rounded-full px-5 text-sm font-semibold"
          >
            <MapPin aria-hidden className="h-4 w-4" />
            {labels.viewAll}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-3 shadow-[0_8px_24px_-16px_rgba(16,33,63,0.18)] sm:p-4">
        <ul className={`grid grid-cols-2 gap-2 sm:gap-3 ${wideCols}`}>
          {ordered.slice(0, shownCount).map((d) => (
            <li key={d.name} className="min-w-0">
              <Link
                href={`/ads?location=${encodeURIComponent(d.name)}`}
                className="group flex h-12 items-center gap-2 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-background)] px-3 transition hover:border-blue-300 hover:bg-[var(--color-market-surface)] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <MapPin
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#1557d6]"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-market-text)]">
                  {d.name}
                </span>
                {d.countLabel && (
                  <span className="shrink-0 text-xs font-medium text-[var(--color-market-text-secondary)]">
                    {d.countLabel}
                  </span>
                )}
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[var(--color-market-text-secondary)] transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Phones and tablets: the button sits after the districts. */}
      <div className="lg:hidden">
        <Link
          href="/ads"
          className="btn-solid h-11 w-full rounded-full px-5 text-sm font-semibold sm:w-auto"
        >
          <MapPin aria-hidden className="h-4 w-4" />
          {labels.viewAll}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
