import { invalidateCache } from "@/lib/redis";

// Call this after any listing create/update/delete/boost so the change is
// visible on next page load instead of waiting out the cache's TTL.
// Centralized here so every mutation route calls one obviously-named
// function instead of remembering the key pattern itself.
//
// Uses the Redis cache (lib/redis.ts) rather than Next's unstable_cache +
// revalidateTag: in this Next.js 16 setup, revalidateTag left the cache
// permanently missing after being called once (verified by instrumenting
// the query function and watching it re-run on every request, forever,
// after a single revalidateTag call) — a real bug/quirk in an API that's
// literally named "unstable". Redis-based invalidation is what the rest of
// this codebase already uses successfully (see HomeDataSections.tsx and the
// existing invalidateCache("listings:*") calls this was modeled on).
export async function invalidateListingsCache() {
  await invalidateCache("listings:*");
}
