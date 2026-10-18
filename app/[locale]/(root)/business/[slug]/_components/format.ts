"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ImageCrop } from "@/lib/business/storefront";

export const rs = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

const LOCALE_TAG: Record<string, string> = {
  en: "en-GB",
  si: "si-LK",
  ta: "ta-LK",
};

// Fixed to Colombo time so the server and the browser print the same day.
export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale] ?? "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date(iso));
}

// null until mounted: anything that depends on "now" (open status, offer
// countdowns) renders after hydration so it never mismatches the server.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// A different part of a shared sample photo.
export function cropStyle(crop?: ImageCrop): CSSProperties | undefined {
  if (!crop) return undefined;
  return {
    objectPosition: `${crop.x}% ${crop.y}%`,
    transformOrigin: `${crop.x}% ${crop.y}%`,
    transform: `scale(${crop.zoom})`,
  };
}

export function scrollToSection(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
