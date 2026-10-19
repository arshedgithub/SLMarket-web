"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Bell, BellRing } from "lucide-react";
import { Link } from "@/i18n/navigation";

/*
 * Save the current /ads search and get new matches by email. Signed-out
 * visitors go to sign in and come back to the same page.
 */
export function SaveSearchButton({
  query,
  label,
  className = "",
}: {
  query: string;
  label: string;
  className?: string;
}) {
  const t = useTranslations("listings");
  const { status } = useSession();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let live = true;
    setSavedId(null);
    fetch(`/api/user/saved-searches?query=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : { searches: [] }))
      .then(
        (d: { searches?: { id: string }[] }) =>
          live && setSavedId(d.searches?.[0]?.id ?? null),
      )
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [query, status]);

  const base = `inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-sm font-semibold transition ${className}`;

  if (status !== "authenticated") {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(query)}`}
        className={`${base} border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600`}
      >
        <Bell aria-hidden className="h-4 w-4" />
        {t("savedSearch.save")}
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    setError(false);
    try {
      if (savedId) {
        const res = await fetch(
          `/api/user/saved-searches?id=${encodeURIComponent(savedId)}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error();
        setSavedId(null);
      } else {
        const res = await fetch("/api/user/saved-searches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, label }),
        });
        if (!res.ok) throw new Error();
        const d = (await res.json()) as { search: { id: string } };
        setSavedId(d.search.id);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={!!savedId}
      title={
        error
          ? t("savedSearch.failed")
          : savedId
            ? t("savedSearch.savedHint")
            : t("savedSearch.saveHint")
      }
      className={`${base} disabled:opacity-60 ${
        savedId
          ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
          : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-200 hover:text-blue-600"
      }`}
    >
      {savedId ? (
        <BellRing aria-hidden className="h-4 w-4" />
      ) : (
        <Bell aria-hidden className="h-4 w-4" />
      )}
      {error
        ? t("savedSearch.failed")
        : savedId
          ? t("savedSearch.saved")
          : t("savedSearch.save")}
    </button>
  );
}
