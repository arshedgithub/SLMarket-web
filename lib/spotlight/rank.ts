import { seededHash } from "@/lib/hash";
import type { Spotlight, SpotlightCandidate } from "./types";

/*
 * Which spotlights fill a page's slots.
 *   - Only candidates that fit the page: a campaign targeted at another
 *     category or district is left out, and with a category open only
 *     businesses in that category qualify.
 *   - Order: pinned, then relevance (targeted at this page first), then
 *     tier, then fewest impressions today (paying advertisers in a tier
 *     get equal exposure), then a seeded random tiebreak (a new seed per
 *     page view, so every refresh shows a different one).
 *   - One per advertiser. Advertisers at their frequency cap are skipped;
 *     ones already seen this session go last (the pool resets once every
 *     candidate has been seen).
 *   - Image campaigns and businesses alternate where the pool allows.
 * Nothing qualifying means no slot at all.
 */

export type SpotlightContext = {
  category?: string | null;
  district?: string | null;
};

function eligible(c: SpotlightCandidate, ctx: SpotlightContext): boolean {
  if (c.targetCategory && c.targetCategory !== (ctx.category ?? null))
    return false;
  if (c.targetDistrict && c.targetDistrict !== (ctx.district ?? null))
    return false;
  if (c.kind === "business" && ctx.category && c.categoryId !== ctx.category)
    return false;
  return true;
}

function relevance(c: SpotlightCandidate, ctx: SpotlightContext): number {
  let r = 0;
  if (
    ctx.category &&
    (c.targetCategory === ctx.category || c.categoryId === ctx.category)
  )
    r++;
  if (
    ctx.district &&
    (c.targetDistrict === ctx.district || c.district === ctx.district)
  )
    r++;
  return r;
}

export function rankSpotlights(
  pool: SpotlightCandidate[],
  opts: {
    count: number;
    seed: string;
    ctx?: SpotlightContext;
    seen?: Set<string>; // spot ids shown this session
    capped?: Set<string>; // advertisers at their frequency cap
    exclude?: Set<string>; // advertisers already on the page (business strip)
  },
): Spotlight[] {
  const ctx = opts.ctx ?? {};
  const seen = opts.seen ?? new Set<string>();
  const blocked = new Set([...(opts.capped ?? []), ...(opts.exclude ?? [])]);

  const ordered = pool
    .filter((c) => eligible(c, ctx) && !blocked.has(c.advertiser))
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        Number(seen.has(a.id)) - Number(seen.has(b.id)) ||
        relevance(b, ctx) - relevance(a, ctx) ||
        a.tier - b.tier ||
        a.impressionsToday - b.impressionsToday ||
        seededHash(opts.seed + a.id) - seededHash(opts.seed + b.id),
    );

  const picked: SpotlightCandidate[] = [];
  const advertisers = new Set<string>();
  for (const c of ordered) {
    if (picked.length >= opts.count) break;
    if (advertisers.has(c.advertiser)) continue;
    advertisers.add(c.advertiser);
    picked.push(c);
  }
  return alternateKinds(picked).map(toSpotlight);
}

// Image campaigns and businesses take turns; a pinned one keeps slot 1.
export function alternateKinds<T extends { kind: string; pinned: boolean }>(
  list: T[],
): T[] {
  const out: T[] = [];
  const rest = [...list];
  while (rest.length) {
    const prev = out[out.length - 1];
    let i = prev ? rest.findIndex((c) => c.kind !== prev.kind && !c.pinned) : 0;
    if (i < 0) i = 0;
    out.push(rest.splice(i, 1)[0]);
  }
  return out;
}

// Ranking-only fields never reach the browser.
const CANDIDATE_ONLY = new Set([
  "impressionsToday",
  "targetCategory",
  "targetDistrict",
  "categoryId",
  "district",
]);

function toSpotlight(c: SpotlightCandidate): Spotlight {
  return Object.fromEntries(
    Object.entries(c).filter(([k]) => !CANDIDATE_ONLY.has(k)),
  ) as Spotlight;
}
