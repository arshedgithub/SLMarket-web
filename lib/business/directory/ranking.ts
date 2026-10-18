import type { DirectoryBusiness } from "./types";

/*
 * "Recommended" ranking. Payment never affects it: paid visibility comes
 * only through labelled sponsored positions (see sponsored.ts). The weights
 * are starting points to tune with data.
 */

export const WEIGHTS = {
  relevance: 0.3,
  distance: 0.2,
  trust: 0.15,
  rating: 0.15,
  responsiveness: 0.1,
  freshness: 0.1,
} as const;

// Bayesian average: a single 5-star review can't outrank a long record.
export const RATING_PRIOR_WEIGHT = 10; // "C" in the plan

export function weightedRating(
  average: number,
  count: number,
  platformAverage: number,
  c = RATING_PRIOR_WEIGHT,
): number {
  if (count <= 0) return platformAverage;
  return (count * average + c * platformAverage) / (count + c);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function trustScore(level: number) {
  return clamp01(level / 4);
}

export function responsivenessScore(r: DirectoryBusiness["response"]) {
  if (r.conversations < 10) return 0.4; // not enough data to reward or punish
  const speed =
    r.medianMinutes <= 60
      ? 1
      : r.medianMinutes <= 180
        ? 0.75
        : r.medianMinutes <= 1440
          ? 0.4
          : 0;
  return clamp01(0.5 * r.replyRate + 0.5 * speed);
}

export function freshnessScore(
  b: Pick<DirectoryBusiness, "lastActiveDaysAgo" | "completeness">,
) {
  const activity = clamp01(1 - b.lastActiveDaysAgo / 30);
  return 0.6 * activity + 0.4 * clamp01(b.completeness);
}

// Closer is better, reduced gradually. Unknown distance is neutral.
export function distanceScore(km: number | null) {
  return km === null ? 0.5 : 1 / (1 + km / 15);
}

export const NEW_BUSINESS_DAYS = 30;
export const NEW_BUSINESS_BOOST = 0.04;

export type RankContext = {
  platformAverage: number;
  // 0..1 match strength for this business (search relevance, or category
  // match on browse pages)
  relevance: number;
  distanceKm: number | null;
};

export function rankScore(b: DirectoryBusiness, ctx: RankContext): number {
  const rating = clamp01(
    (weightedRating(b.rating.average, b.rating.count, ctx.platformAverage) -
      1) /
      4,
  );
  let score =
    WEIGHTS.relevance * clamp01(ctx.relevance) +
    WEIGHTS.distance * distanceScore(ctx.distanceKm) +
    WEIGHTS.trust * trustScore(b.verifiedLevel) +
    WEIGHTS.rating * rating +
    WEIGHTS.responsiveness * responsivenessScore(b.response) +
    WEIGHTS.freshness * freshnessScore(b);
  // A small lift for the first 30 days, so a new business is seen before
  // it has any reviews.
  if (b.createdDaysAgo <= NEW_BUSINESS_DAYS) score += NEW_BUSINESS_BOOST;
  return score;
}

// Equal scores fall back to the business id, so results never reshuffle
// between page loads.
export function compareRanked(
  a: { id: string; score: number },
  b: { id: string; score: number },
) {
  return b.score - a.score || a.id.localeCompare(b.id);
}

export function platformAverageRating(list: DirectoryBusiness[]): number {
  let sum = 0;
  let n = 0;
  for (const b of list) {
    sum += b.rating.average * b.rating.count;
    n += b.rating.count;
  }
  return n ? sum / n : 4.2;
}
