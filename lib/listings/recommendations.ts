import { DISTRICT_CENTRES, haversineKm } from "@/lib/business/directory/geo";
import {
  locationDistrict,
  type AdCard,
} from "@/app/[locale]/(root)/ads/_components/data";
import type { AdView } from "./adView";

/*
 * The rows under an ad, built from the same ads the lists show (the feed,
 * lib/listings/feed.ts), so every card opens a working ad page.
 * "Near" is the origin district resolved by lib/listings/nearYou.ts.
 */

const NEAR_KM = 25;
const MIN_ROW = 4;

function centreOf(district: string | null | undefined) {
  return district ? DISTRICT_CENTRES[district] : undefined;
}

function distanceKm(from: string | null, place: string): number {
  const a = centreOf(from);
  const b = centreOf(locationDistrict(place));
  return a && b ? haversineKm(a, b) : Number.POSITIVE_INFINITY;
}

function minutesAgo(ad: AdCard): number {
  const at = Date.parse(ad.postedAt);
  return Number.isFinite(at)
    ? (Date.now() - at) / 60_000
    : Number.MAX_SAFE_INTEGER;
}

// Higher is more similar: attributes, price band, condition. Distance and
// recency break ties.
function similarity(ad: AdView, l: AdCard): number {
  const d = l.details ?? {};
  let score = 0;
  if (l.subcategoryId === ad.subcategoryId) score += 4;
  if (ad.details.brand && d.brand === ad.details.brand) score += 3;
  if (ad.details.deviceType && d.deviceType === ad.details.deviceType)
    score += 2;
  if (ad.price && l.price >= ad.price * 0.7 && l.price <= ad.price * 1.3)
    score += 2;
  if (ad.details.condition && d.condition === ad.details.condition) score += 1;
  return score;
}

function rank(ad: AdView, origin: string | null, list: AdCard[]) {
  return [...list].sort(
    (a, b) =>
      similarity(ad, b) - similarity(ad, a) ||
      distanceKm(origin, a.location) - distanceKm(origin, b.location) ||
      minutesAgo(a) - minutesAgo(b),
  );
}

export type SimilarLevel = 1 | 2 | 3 | 4;
export type SimilarRow = { level: SimilarLevel; ads: AdCard[] };

/*
 * The fallback ladder. Each level runs only when the one before it has
 * fewer than 4 ads, and the row shows that level alone, so its heading
 * can say honestly what it is:
 *   1  same subcategory within ~25 km     "Similar laptops near Colombo"
 *   2  same subcategory, anywhere          "Similar laptops in other districts"
 *   3  same category, nearby               "Other electronics near you"
 *   4  popular nearby, any category        "Popular near you"
 * Fewer than 4 even at level 4: no row. Reserved ads are left out.
 */
export function similarAds(
  ad: AdView,
  origin: string | null,
  pool: AdCard[],
  exclude: Set<string>,
  limit = 8,
): SimilarRow | null {
  const others = pool.filter(
    (l) => l.slug !== ad.slug && !exclude.has(l.slug) && !l.reserved,
  );
  const near = (l: AdCard) => distanceKm(origin, l.location) <= NEAR_KM;
  const sameSub = (l: AdCard) =>
    l.categoryId === ad.categoryId && l.subcategoryId === ad.subcategoryId;

  const levels: [SimilarLevel, AdCard[]][] = [
    [1, others.filter((l) => sameSub(l) && near(l))],
    [2, others.filter(sameSub)],
    [3, others.filter((l) => l.categoryId === ad.categoryId && near(l))],
    [4, others.filter(near)],
  ];
  for (const [level, list] of levels) {
    if (list.length < MIN_ROW) continue;
    const ads =
      level === 4
        ? [...list].sort(
            (a, b) =>
              Number(!!b.premium || !!b.featured) -
                Number(!!a.premium || !!a.featured) ||
              minutesAgo(a) - minutesAgo(b),
          )
        : rank(ad, origin, list);
    return { level, ads: ads.slice(0, limit) };
  }
  return null;
}

// Business ads: the business's ads in the same category first, then the
// rest. (Cards carry a seller name for business ads only.)
export function moreFromSeller(
  ad: AdView,
  pool: AdCard[],
  limit = 8,
): AdCard[] {
  const name = ad.seller.business?.name;
  if (!name) return [];
  const theirs = pool.filter(
    (l) => l.sellerName === name && l.slug !== ad.slug,
  );
  return [
    ...theirs.filter((l) => l.categoryId === ad.categoryId),
    ...theirs.filter((l) => l.categoryId !== ad.categoryId),
  ].slice(0, limit);
}

export type NearbyBusiness = {
  name: string;
  slug: string;
  categoryId: string;
  location: string; // town or district
  rating: number | null;
  sponsored: boolean; // a paid (premium) placement, labelled as such
};

// Private-seller ads only (never on a paying business's ad): up to 3
// businesses in the ad's category, nearest first, paid ones labelled.
export function businessesNearby(
  ad: AdView,
  origin: string | null,
  businesses: NearbyBusiness[],
  limit = 3,
): NearbyBusiness[] {
  if (ad.seller.business) return [];
  return businesses
    .filter((b) => b.categoryId === ad.categoryId)
    .sort(
      (a, b) =>
        distanceKm(origin, a.location) - distanceKm(origin, b.location) ||
        (b.rating ?? 0) - (a.rating ?? 0),
    )
    .slice(0, limit);
}
