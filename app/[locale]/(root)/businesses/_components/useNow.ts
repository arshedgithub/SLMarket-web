"use client";

import { useEffect, useState } from "react";

// null until mounted: anything that depends on "now" (open status) renders
// after hydration so it can never disagree with the server's HTML.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
