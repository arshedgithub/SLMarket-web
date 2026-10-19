"use client";

import { useState } from "react";
import { Bell, BellOff, Search, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Saved = { id: string; label: string; query: string; alerts: boolean };

export function SavedSearchList({ initial }: { initial: Saved[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function toggleAlerts(item: Saved) {
    setError(null);
    const alerts = !item.alerts;
    setItems((list) =>
      list.map((s) => (s.id === item.id ? { ...s, alerts } : s)),
    );
    const res = await fetch("/api/user/saved-searches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, alerts }),
    }).catch(() => null);
    if (!res?.ok) {
      setItems((list) =>
        list.map((s) => (s.id === item.id ? { ...s, alerts: item.alerts } : s)),
      );
      setError("Could not update alerts. Please try again.");
    }
  }

  async function remove(item: Saved) {
    setError(null);
    setItems((list) => list.filter((s) => s.id !== item.id));
    const res = await fetch(
      `/api/user/saved-searches?id=${encodeURIComponent(item.id)}`,
      { method: "DELETE" },
    ).catch(() => null);
    if (!res?.ok) {
      setItems((list) => [item, ...list]);
      setError("Could not remove the search. Please try again.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-14 text-center dark:border-gray-800 dark:bg-gray-900">
        <Search aria-hidden className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          No saved searches yet
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          On any ads page, use Save search to get new matches by email.
        </p>
        <Link
          href="/ads"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Browse ads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}
      <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
            <Link
              href={item.query}
              className="min-w-0 flex-1 font-semibold text-gray-900 hover:text-blue-700 dark:text-white"
            >
              <span className="block truncate">{item.label}</span>
            </Link>
            <button
              type="button"
              onClick={() => toggleAlerts(item)}
              aria-pressed={item.alerts}
              className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${
                item.alerts
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                  : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {item.alerts ? (
                <Bell aria-hidden className="h-4 w-4" />
              ) : (
                <BellOff aria-hidden className="h-4 w-4" />
              )}
              {item.alerts ? "Alerts on" : "Alerts off"}
            </button>
            <button
              type="button"
              onClick={() => remove(item)}
              aria-label={`Remove ${item.label}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-700 dark:border-gray-700 dark:text-gray-300"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
