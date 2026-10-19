"use client";

import dynamic from "next/dynamic";

// The map engine is large and browser-only: load it after the page.
export const LazyLocationMap = dynamic(
  () => import("./AdLocationMap").then((m) => m.AdLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    ),
  },
);
