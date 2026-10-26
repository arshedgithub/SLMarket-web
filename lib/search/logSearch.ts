"use client";

// Browser: count a search someone typed (never chip clicks, which would
// only reinforce the chips). Fire and forget.
export function logSearch(q: string) {
  const term = q.trim();
  if (term.length < 2) return;
  const body = JSON.stringify({ q: term });
  try {
    if (navigator.sendBeacon?.("/api/search/log", body)) return;
  } catch {
    /* fall through */
  }
  void fetch("/api/search/log", {
    method: "POST",
    body,
    keepalive: true,
  }).catch(() => {});
}
