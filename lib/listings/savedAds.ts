"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { trackAd } from "@/lib/listings/track";

/*
 * Saved ads, shared by every heart on the page (cards, the ad page). Signed
 * in: the account's list (every device), loaded once per page load. Guest:
 * this device's list; it moves into the account on the first signed-in
 * visit.
 */

export const SAVED_KEY = "slm:saved-ads";

let saved = new Set<string>();
let loadedFor: string | null = null; // "guest" or the user id
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function readLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocal(list: string[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* storage unavailable */
  }
}

async function load(user: string | null) {
  const who = user ?? "guest";
  if (loadedFor === who) return;
  loadedFor = who;
  if (!user) {
    saved = new Set(readLocal());
    emit();
    return;
  }
  const local = readLocal();
  if (local.length) {
    const r = await fetch("/api/ads/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merge: local }),
    }).catch(() => null);
    if (r?.ok) writeLocal([]);
  }
  const res = await fetch("/api/ads/saved").catch(() => null);
  const data = res?.ok
    ? ((await res.json().catch(() => null)) as { slugs?: string[] } | null)
    : null;
  saved = new Set(data?.slugs ?? local);
  emit();
}

export function useSavedAd(slug: string): {
  saved: boolean;
  toggle: () => void;
} {
  const { data: session, status } = useSession();
  const user = session?.user?.id ?? null;

  useEffect(() => {
    if (status !== "loading") void load(user);
  }, [status, user]);

  const isSaved = useSyncExternalStore(
    subscribe,
    () => saved.has(slug),
    () => false,
  );

  const toggle = () => {
    const next = !saved.has(slug);
    saved = new Set(saved);
    if (next) saved.add(slug);
    else saved.delete(slug);
    emit();
    trackAd("save", { slug, saved: next });
    if (user) {
      void fetch("/api/ads/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, saved: next }),
      }).then((r) => {
        if (r.ok) return;
        saved = new Set(saved);
        if (next) saved.delete(slug);
        else saved.add(slug);
        emit();
      });
      return;
    }
    const list = readLocal();
    writeLocal(
      next
        ? [slug, ...list.filter((s) => s !== slug)]
        : list.filter((s) => s !== slug),
    );
  };

  return { saved: isSaved, toggle };
}
