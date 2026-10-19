"use client";

import { useEffect, useRef, useState } from "react";
import type { Spotlight } from "@/lib/spotlight/types";

/*
 * Session rules for spotlights (this browser tab only):
 *   - seen: spot ids already shown; the server puts them last, so every
 *     page view shows a different one until the pool runs out and resets
 *   - frequency cap: an advertiser counted twice in the last hour is
 *     skipped for the rest of that hour
 */

const SEEN_KEY = "slm:spot-seen";
const IMPRESSIONS_KEY = "slm:spot-imps";
const CAP = 2;
const HOUR = 60 * 60 * 1000;

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function cappedAdvertisers(now = Date.now()): string[] {
  const log = read<Record<string, number[]>>(IMPRESSIONS_KEY, {});
  return Object.entries(log)
    .filter(([, times]) => times.filter((t) => now - t < HOUR).length >= CAP)
    .map(([advertiser]) => advertiser);
}

export function recordImpression(advertiser: string) {
  const now = Date.now();
  const log = read<Record<string, number[]>>(IMPRESSIONS_KEY, {});
  log[advertiser] = [
    ...(log[advertiser] ?? []).filter((t) => now - t < HOUR),
    now,
  ];
  write(IMPRESSIONS_KEY, log);
}

export function sendSpotlightEvent(id: string, type: "impression" | "click") {
  const body = JSON.stringify({ id, type });
  try {
    if (navigator.sendBeacon?.("/api/spotlight/track", body)) return;
  } catch {
    /* fall through */
  }
  void fetch("/api/spotlight/track", {
    method: "POST",
    body,
    keepalive: true,
  }).catch(() => {});
}

// The spotlights for one page. null while loading; [] means no slot.
export function useSpotlights({
  count,
  category,
  district,
  exclude,
  pageKey,
}: {
  count: number;
  category: string | null;
  district: string | null;
  exclude: string[]; // advertisers already on the page
  pageKey: string; // changes per page view (filters, page number)
}): Spotlight[] | null {
  const [spots, setSpots] = useState<Spotlight[] | null>(null);
  const excludeKey = exclude.join(",");

  useEffect(() => {
    if (count <= 0) {
      setSpots([]);
      return;
    }
    setSpots(null);
    const seen = read<string[]>(SEEN_KEY, []);
    const params = new URLSearchParams({
      count: String(count),
      seed: Math.random().toString(36).slice(2),
      seen: seen.slice(-50).join(","),
      capped: cappedAdvertisers().join(","),
      exclude: excludeKey,
    });
    if (category) params.set("category", category);
    if (district) params.set("district", district);
    let cancelled = false;
    fetch(`/api/spotlight?${params}`)
      .then((r) => (r.ok ? r.json() : { spots: [] }))
      .then((d: { spots?: Spotlight[] }) => {
        if (cancelled) return;
        const got = d.spots ?? [];
        setSpots(got);
        write(
          SEEN_KEY,
          [
            ...seen.filter((id) => !got.some((s) => s.id === id)),
            ...got.map((s) => s.id),
          ].slice(-50),
        );
      })
      .catch(() => !cancelled && setSpots([]));
    return () => {
      cancelled = true;
    };
  }, [count, category, district, excludeKey, pageKey]);

  return spots;
}

/*
 * Counts an impression once per session when half the slot has been in
 * view for a second. Clicks are counted separately.
 */
export function useSpotlightTracking(spot: Spotlight) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const key = `slm:spot-imp:${spot.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* count anyway */
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (!entry.isIntersecting) return;
        timer = setTimeout(() => {
          sendSpotlightEvent(spot.id, "impression");
          recordImpression(spot.advertiser);
          try {
            sessionStorage.setItem(key, "1");
          } catch {
            /* ignore */
          }
          io.disconnect();
        }, 1000);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [spot.id, spot.advertiser]);

  return { ref, onClick: () => sendSpotlightEvent(spot.id, "click") };
}
