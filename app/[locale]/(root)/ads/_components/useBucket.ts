"use client";

import { useEffect, useState } from "react";
import { bucketForWidth, VIEWPORT_COOKIE, type Bucket } from "./adQuery";

/*
 * The screen bucket (mobile, tablet, laptop, desktop) that sets ads per
 * page. The server renders with its guess (the cookie from the last visit,
 * else the user agent); after hydration the real width wins, and is saved
 * so the next server render already matches.
 */
export function useBucket(initial: Bucket): Bucket {
  const [bucket, setBucket] = useState<Bucket>(initial);

  useEffect(() => {
    const update = () => {
      const next = bucketForWidth(window.innerWidth);
      setBucket(next);
      document.cookie = `${VIEWPORT_COOKIE}=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
    };
    update();
    const queries = [640, 1024, 1280].map((w) =>
      window.matchMedia(`(min-width: ${w}px)`),
    );
    queries.forEach((q) => q.addEventListener("change", update));
    return () =>
      queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  return bucket;
}
