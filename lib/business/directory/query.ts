import { isOpenAt } from "../responseTime";
import { DISTRICT_CENTRES, haversineKm, type LatLng } from "./geo";
import {
  compareRanked,
  platformAverageRating,
  rankScore,
  weightedRating,
} from "./ranking";
import { searchBusinesses } from "./search";
import type {
  DirectoryBusiness,
  DirectoryFilters,
  DirectoryItem,
} from "./types";

/*
 * One pass from "everything" to "what this page shows": eligibility, search,
 * filters, ranking, sorting, and the facet counts that sit on the chips.
 * Pure, so the server (first render, SEO) and the browser (filter changes)
 * give the same answer.
 */

export const INACTIVE_AFTER_DAYS = 90;
export const RATING_FILTER_MIN = 4;
export const VERIFIED_MIN_LEVEL = 2;
export const CLOSING_SOON_MINUTES = 60;

// A business is listed only when it is published, not suspended, has
// something to show, and has been active in the last 90 days. (Paid plans
// don't matter: a lapsed plan is still listed, with a free profile.)
export function isListed(b: DirectoryBusiness): boolean {
  return (
    b.published &&
    !b.suspended &&
    b.itemCount >= 1 &&
    b.lastActiveDaysAgo <= INACTIVE_AFTER_DAYS
  );
}

export type QueryContext = {
  now: Date;
  // The visitor's location (GPS) or the selected district's centre.
  origin: LatLng | null;
  // For "To my district" delivery.
  userDistrict: string | null;
};

// Distance in km. A business with no exact pin is measured from its
// district centre.
export function distanceKm(
  b: DirectoryBusiness,
  origin: LatLng | null,
): number | null {
  if (!origin) return null;
  const point = b.location ?? DISTRICT_CENTRES[b.district];
  return point ? haversineKm(origin, point) : null;
}

export function isOpenNow(b: DirectoryBusiness, now: Date) {
  return b.hoursSet && isOpenAt(now, b.openingHours);
}

export function inCategory(b: DirectoryBusiness, categoryId: string) {
  return (
    b.categoryId === categoryId || b.secondaryCategoryIds.includes(categoryId)
  );
}

type Skip = "category" | "none";

function passes(
  b: DirectoryBusiness,
  f: DirectoryFilters,
  ctx: QueryContext,
  platformAverage: number,
  skip: Skip = "none",
): boolean {
  if (skip !== "category") {
    if (f.category && !inCategory(b, f.category)) return false;
    if (f.subcategory && !b.subcategoryIds.includes(f.subcategory))
      return false;
  }
  if (f.district && b.district !== f.district) return false;
  if (f.verified && b.verifiedLevel < VERIFIED_MIN_LEVEL) return false;
  if (f.open && !isOpenNow(b, ctx.now)) return false;
  if (
    f.rating4 &&
    weightedRating(b.rating.average, b.rating.count, platformAverage) <
      RATING_FILTER_MIN
  ) {
    return false;
  }
  if (f.delivery.length > 0) {
    const ok = f.delivery.some((d) =>
      d === "islandwide"
        ? b.delivery.islandwide
        : b.delivery.islandwide ||
          (!!ctx.userDistrict &&
            b.delivery.districts.includes(ctx.userDistrict)),
    );
    if (!ok) return false;
  }
  if (f.distanceKm !== null) {
    const km = distanceKm(b, ctx.origin);
    if (km === null || km > f.distanceKm) return false;
  }
  if (f.instalment && b.instalmentProviders.length === 0) return false;
  if (f.authorisedBrand && !b.authorisedBrands.includes(f.authorisedBrand))
    return false;
  return true;
}

export type DirectoryResult = {
  business: DirectoryBusiness;
  score: number;
  relevance: number;
  distanceKm: number | null;
  nameMatch: boolean;
  matchedItems: DirectoryItem[];
  priceRange: { min: number; max: number } | null;
};

export type DirectoryQueryResult = {
  results: DirectoryResult[];
  // Businesses per category with every OTHER filter applied, so chip counts
  // always agree with what a click would show.
  categoryCounts: Record<string, number>;
  totalForCategoryChips: number;
  verifiedCount: number;
  platformAverage: number;
  appliedDistrict: string | null; // from the query text, e.g. "Apple dealer Kandy"
};

export function knownBrands(list: DirectoryBusiness[]) {
  return [
    ...new Set(list.flatMap((b) => [...b.authorisedBrands, ...b.otherBrands])),
  ];
}

// Browse pages have no search text: relevance is the category match, primary
// strongest.
function browseRelevance(b: DirectoryBusiness, f: DirectoryFilters) {
  if (!f.category) return 0.7;
  return b.categoryId === f.category ? 1 : 0.6;
}

export function runDirectory(
  all: DirectoryBusiness[],
  filters: DirectoryFilters,
  ctx: QueryContext,
): DirectoryQueryResult {
  const listed = all.filter(isListed);
  const platformAverage = platformAverageRating(listed);

  // Search first (it may also set a district from the words typed).
  let base: {
    business: DirectoryBusiness;
    relevance: number;
    nameMatch: boolean;
    matchedItems: DirectoryItem[];
    priceRange: DirectoryResult["priceRange"];
  }[];
  let appliedDistrict: string | null = null;
  let effective = filters;

  if (filters.q.trim()) {
    const { hits, parsed } = searchBusinesses(
      filters.q,
      listed,
      knownBrands(listed),
    );
    base = hits;
    if (parsed.district && !filters.district) {
      appliedDistrict = parsed.district;
      effective = { ...filters, district: parsed.district };
    }
    if (parsed.brand && parsed.authorisedIntent) {
      effective = {
        ...effective,
        authorisedBrand: effective.authorisedBrand ?? parsed.brand,
      };
    }
  } else {
    base = listed.map((business) => ({
      business,
      relevance: browseRelevance(business, filters),
      nameMatch: false,
      matchedItems: [],
      priceRange: null,
    }));
  }

  const scored = base
    .filter((h) => passes(h.business, effective, ctx, platformAverage))
    .map((h) => {
      const km = distanceKm(h.business, ctx.origin);
      return {
        ...h,
        distanceKm: km,
        score: rankScore(h.business, {
          platformAverage,
          relevance: h.relevance,
          distanceKm: km,
        }),
      };
    });

  const sorters: Record<
    DirectoryFilters["sort"],
    (a: DirectoryResult, b: DirectoryResult) => number
  > = {
    recommended: compareRanked as never,
    nearest: (a, b) =>
      (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) ||
      a.business.id.localeCompare(b.business.id),
    rating: (a, b) =>
      weightedRating(
        b.business.rating.average,
        b.business.rating.count,
        platformAverage,
      ) -
        weightedRating(
          a.business.rating.average,
          a.business.rating.count,
          platformAverage,
        ) || a.business.id.localeCompare(b.business.id),
    items: (a, b) =>
      b.business.itemCount - a.business.itemCount ||
      a.business.id.localeCompare(b.business.id),
  };
  const results = scored
    .map((r) => ({ ...r, business: r.business }))
    .sort((a, b) =>
      effective.sort === "recommended"
        ? compareRanked(
            { id: a.business.id, score: a.score },
            { id: b.business.id, score: b.score },
          )
        : sorters[effective.sort](a as DirectoryResult, b as DirectoryResult),
    ) as DirectoryResult[];

  // Facets: everything applied except the category itself.
  const forChips = base.filter((h) =>
    passes(h.business, effective, ctx, platformAverage, "category"),
  );
  const categoryCounts: Record<string, number> = {};
  for (const h of forChips) {
    const ids = new Set([
      h.business.categoryId,
      ...h.business.secondaryCategoryIds,
    ]);
    for (const id of ids) categoryCounts[id] = (categoryCounts[id] ?? 0) + 1;
  }

  return {
    results,
    categoryCounts,
    totalForCategoryChips: forChips.length,
    verifiedCount: results.filter(
      (r) => r.business.verifiedLevel >= VERIFIED_MIN_LEVEL,
    ).length,
    platformAverage,
    appliedDistrict,
  };
}
