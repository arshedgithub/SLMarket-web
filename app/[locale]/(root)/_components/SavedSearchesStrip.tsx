"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Saved = { id: string; label: string; query: string };

// Signed-in visitors with saved searches get one tap back into each.
export function SavedSearchesStrip({
  heading,
  manageLabel,
}: {
  heading: string;
  manageLabel: string;
}) {
  const { status } = useSession();
  const [items, setItems] = useState<Saved[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let live = true;
    fetch("/api/user/saved-searches")
      .then((r) => (r.ok ? r.json() : { searches: [] }))
      .then(
        (d: { searches?: Saved[] }) =>
          live && setItems((d.searches ?? []).slice(0, 8)),
      )
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [status]);

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="saved-searches-heading"
      className="mx-auto max-w-7xl px-4 pt-8 sm:px-6"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="saved-searches-heading"
          className="font-heading text-lg font-extrabold tracking-tight text-[color:var(--color-market-text)] sm:text-xl"
        >
          {heading}
        </h2>
        <Link
          href="/dashboard/saved-searches"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300"
        >
          {manageLabel}
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <ul className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {items.map((s) => (
          <li key={s.id} className="shrink-0">
            <Link
              href={s.query}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-4 text-sm font-semibold text-[color:var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-700"
            >
              <Bell aria-hidden className="h-4 w-4 text-blue-600" />
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
