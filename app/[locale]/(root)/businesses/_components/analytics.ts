"use client";

import { useEffect, type RefObject } from "react";

export type BusinessEvent =
  | "directory_view"
  | "directory_search"
  | "business_card_impression"
  | "business_card_click"
  | "contact_reveal"
  | "whatsapp_click"
  | "call_click"
  | "follow"
  | "filter_change"
  | "map_search_area"
  | "short_link_hit";

// Fire and forget. Automated browsers are skipped here as well as on the
// server, so tests and crawlers never inflate lead or impression counts.
export function trackBusinessEvent(
  event: BusinessEvent,
  data: Record<string, string | number | boolean | null> = {},
) {
  if (typeof navigator === "undefined" || navigator.webdriver) return;
  try {
    const body = JSON.stringify({ event, data });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/businesses/events",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/businesses/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* analytics never breaks the page */
  }
}

// One impression per card per page view, and only once at least half of it
// has been on screen for a full second.
const counted = new Set<string>();

export function useImpression(
  ref: RefObject<Element | null>,
  key: string,
  data: Record<string, string | number | boolean | null>,
) {
  const dataKey = JSON.stringify(data);
  useEffect(() => {
    const el = ref.current;
    if (!el || counted.has(key)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            if (counted.has(key)) return;
            counted.add(key);
            trackBusinessEvent("business_card_impression", JSON.parse(dataKey));
            observer.disconnect();
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, key, dataKey]);
}
