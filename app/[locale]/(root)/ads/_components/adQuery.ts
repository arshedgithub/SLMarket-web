import { DISTRICT_CENTRES, haversineKm } from "@/lib/business/directory/geo";
import {
  CATEGORY_FILTER_FIELDS,
  DEAL_VALUES,
  PRICE_PRESETS,
  locationDistrict,
  type AdCard,
  type CategoryFieldDef,
  type Condition,
  type DealTag,
  type SellerType,
  type SortValue,
} from "./data";

/*
 * The list rules the homepage and /ads share, as pure functions over the
 * feed (lib/listings/feed.ts getAdFeed, newest first). Kept out of the
 * components so tests can check both pages against the same feed.
 */

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

export type FiltersState = {
  location: string | null;
  priceMin: number | null;
  priceMax: number | null;
  pricePresetKey: string | null;
  condition: Condition;
  seller: SellerType | "all";
  deals: DealTag[];
  // Category fields (CATEGORY_FILTER_FIELDS), key to the chosen option.
  extra: Record<string, string>;
  negotiable: boolean;
  verifiedOnly: boolean;
};

export const DEFAULT_FILTERS: FiltersState = {
  location: null,
  priceMin: null,
  priceMax: null,
  pricePresetKey: null,
  condition: "na",
  seller: "all",
  deals: [],
  extra: {},
  negotiable: false,
  verifiedOnly: false,
};

export function activeFilterCount(f: FiltersState): number {
  let n = 0;
  if (f.location) n++;
  if (f.priceMin !== null || f.priceMax !== null) n++;
  if (f.condition !== "na") n++;
  if (f.seller !== "all") n++;
  if (f.negotiable) n++;
  if (f.verifiedOnly) n++;
  n += f.deals.length;
  n += Object.keys(f.extra).length;
  return n;
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "for",
  "in",
  "at",
  "of",
  "and",
  "with",
]);

// Words people use for the same thing as the stored value.
const SYNONYMS: Record<string, string[]> = {
  sale: ["sale", "sell"],
  sell: ["sale", "sell"],
  rent: ["rent", "rental"],
  phone: ["phone", "mobile", "iphone"],
  mobile: ["phone", "mobile"],
  bike: ["bike", "motorbike", "motorcycle"],
  car: ["car", "cars"],
  job: ["job", "jobs", "vacancy"],
  jobs: ["job", "jobs", "vacancy"],
};

// Each word of the query, with the spellings that count as a match.
export function searchTokens(q: string): string[][] {
  return q
    .toLowerCase()
    .replace(/part[\s-]time/g, "part-time")
    .split(/[^a-z0-9+-]+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .map((w) => SYNONYMS[w] ?? [w]);
}

function haystack(ad: AdCard): string {
  return [
    ad.title,
    ad.location,
    ad.sellerName ?? "",
    ...ad.attrs,
    ...Object.values(ad.details ?? {}),
  ]
    .join(" ")
    .toLowerCase();
}

// Every word must appear (in the title, details, place or seller).
export function matchesSearch(ad: AdCard, q: string): boolean {
  const tokens = searchTokens(q);
  if (tokens.length === 0) return true;
  const text = haystack(ad);
  return tokens.every((alts) => alts.some((w) => text.includes(w)));
}

/* ------------------------------------------------------------------ */
/* Category fields                                                     */
/* ------------------------------------------------------------------ */

const num = (s: string) => Number(s.replace(/[^\d.]/g, ""));

// "2015 to 2019", "2020 or newer", "Before 2010", "4+", "Under 50,000 km",
// "Over 100,000 km", or a single number.
export function parseRange(
  option: string,
): { min: number; max: number } | null {
  const o = option.toLowerCase();
  const nums = (o.match(/\d[\d,]*/g) ?? []).map((n) =>
    Number(n.replace(/,/g, "")),
  );
  if (nums.length === 0) return null;
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  const n = nums[0];
  if (/before|under|below|less/.test(o)) return { min: -Infinity, max: n - 1 };
  if (/\+|or newer|or more|over|above/.test(o))
    return { min: /over|above/.test(o) ? n + 1 : n, max: Infinity };
  return { min: n, max: n };
}

export function matchesField(
  def: CategoryFieldDef,
  value: string,
  details: Record<string, string>,
): boolean {
  const raw = details[def.key];
  if (raw === undefined || raw === "") return false;
  const have = raw.toLowerCase();
  const want = value.toLowerCase().trim();
  switch (def.match) {
    case "exact":
      return have === want;
    case "contains":
    case "text":
      return have.includes(want);
    case "range": {
      const r = parseRange(value);
      const n = num(raw);
      return !!r && Number.isFinite(n) && n >= r.min && n <= r.max;
    }
  }
}

function fieldFor(
  categoryId: string | null,
  key: string,
): CategoryFieldDef | undefined {
  return categoryId
    ? CATEGORY_FILTER_FIELDS[categoryId]?.find((f) => f.key === key)
    : undefined;
}

/* ------------------------------------------------------------------ */
/* Filtering and sorting                                               */
/* ------------------------------------------------------------------ */

export type AdQuery = {
  categoryId: string | null;
  subcategoryId: string | null;
  search: string;
  filters: FiltersState;
  sort: SortValue;
  // The visitor's district, for "Nearest" (GPS or chosen place).
  origin?: string | null;
};

// Distance from the visitor's district to the ad's district centre.
export function distanceKm(
  ad: AdCard,
  origin: string | null | undefined,
): number {
  const from = origin ? DISTRICT_CENTRES[origin] : undefined;
  const to = DISTRICT_CENTRES[locationDistrict(ad.location)];
  return from && to ? haversineKm(from, to) : Number.POSITIVE_INFINITY;
}

// /ads: the ads matching the category, search and filters, in sort order.
export function filterAds(ads: AdCard[], query: AdQuery): AdCard[] {
  const { categoryId, subcategoryId, filters, sort } = query;
  const extra = Object.entries(filters.extra);

  const list = ads.filter((ad) => {
    if (categoryId && ad.categoryId !== categoryId) return false;
    if (subcategoryId && ad.subcategoryId !== subcategoryId) return false;
    if (query.search.trim() && !matchesSearch(ad, query.search)) return false;
    if (filters.location && locationDistrict(ad.location) !== filters.location)
      return false;
    if (filters.priceMin !== null && ad.price < filters.priceMin) return false;
    if (filters.priceMax !== null && ad.price > filters.priceMax) return false;
    if (filters.condition !== "na" && ad.condition !== filters.condition)
      return false;
    if (filters.seller !== "all" && ad.sellerType !== filters.seller)
      return false;
    if (filters.negotiable && !ad.negotiable) return false;
    if (filters.verifiedOnly && ad.sellerType !== "verified") return false;
    if (
      filters.deals.length > 0 &&
      (!ad.deal || !filters.deals.includes(ad.deal))
    )
      return false;
    for (const [key, value] of extra) {
      const def = fieldFor(categoryId, key);
      if (def && !matchesField(def, value, ad.details ?? {})) return false;
    }
    return true;
  });

  const sorted = [...list];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (sort === "nearest" && query.origin) {
    const d = new Map(sorted.map((a) => [a.id, distanceKm(a, query.origin)]));
    sorted.sort((a, b) => d.get(a.id)! - d.get(b.id)!);
  }
  return sorted;
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

/*
 * Ads per page by screen. A spotlight slot takes cells, so every page
 * still ends on a full row: desktop 26 ads + 2 slots of 2 = 30 = 5 x 6,
 * laptop 24 + 4 = 28 = 4 x 7, tablet 21 + 3 = 24 = 3 x 8, mobile 20 + 2
 * = 22 = 2 x 11. Slots never sit in the first two rows. With two slots
 * they zigzag: the first starts a row (left edge), the second ends a row
 * (right edge), so they never stack down the same side. The page size
 * stays fixed even when no slot is shown (a partial last row is better
 * than ads moving between pages).
 */
export type Bucket = "mobile" | "tablet" | "laptop" | "desktop";

export const BUCKETS: Record<
  Bucket,
  { cols: number; pageSize: number; slotsAfter: number[] }
> = {
  mobile: { cols: 2, pageSize: 20, slotsAfter: [6] },
  tablet: { cols: 3, pageSize: 21, slotsAfter: [6] },
  laptop: { cols: 4, pageSize: 24, slotsAfter: [8, 16] },
  desktop: { cols: 5, pageSize: 26, slotsAfter: [10, 21] },
};

// List view: 12 rows per page, a slot after the 6th, a second after the
// 14th only on pages with 20 or more ads.
export const LIST_PAGE_SIZE = 12;
export const LIST_SLOTS_AFTER = [6, 14];

// Cookie holding the last screen bucket (components/useBucket.ts).
export const VIEWPORT_COOKIE = "vp";

export function bucketForWidth(width: number): Bucket {
  return width < 640
    ? "mobile"
    : width < 1024
      ? "tablet"
      : width < 1280
        ? "laptop"
        : "desktop";
}

export function pageSizeFor(bucket: Bucket, view: "grid" | "list"): number {
  return view === "list" ? LIST_PAGE_SIZE : BUCKETS[bucket].pageSize;
}

// The slot positions on one page (after the Nth ad), given its ad count.
export function slotsAfterFor(
  bucket: Bucket,
  view: "grid" | "list",
  adsOnPage: number,
): number[] {
  if (view === "list")
    return LIST_SLOTS_AFTER.filter(
      (n, i) => n < adsOnPage && (i === 0 || adsOnPage >= 20),
    );
  return BUCKETS[bucket].slotsAfter.filter((n) => n < adsOnPage);
}

// Same first ad in view when the page size changes (rotation, resize).
export function remapPage(
  page: number,
  oldSize: number,
  newSize: number,
): number {
  return Math.floor(((page - 1) * oldSize) / newSize) + 1;
}

export const FEATURED_PER_PAGE = 3;
export const MAX_PER_SELLER = 2;

/*
 * Splits the list into pages.
 * "newest" (Featured first, then newest):
 *   - Up to 3 featured ads open each page, the newest first: page 1 gets
 *     the 3 newest featured ads, page 2 the next 3. Featured ads beyond
 *     that show as regular ads (no badge).
 *   - No two ads from the same seller side by side, and at most 2 per
 *     page, when the rest of the list allows it. An ad that would break
 *     that moves to a later spot or page; no ad is ever dropped.
 * Other sorts keep their order exactly.
 */
export function paginate(
  list: AdCard[],
  size: number,
  sort: SortValue,
): AdCard[][] {
  const pageCount = Math.max(1, Math.ceil(list.length / size));
  if (sort !== "newest") {
    return Array.from({ length: pageCount }, (_, p) =>
      list.slice(p * size, (p + 1) * size),
    );
  }

  const featured = list.filter((l) => l.featured);
  const pinned = Array.from({ length: pageCount }, (_, p) =>
    featured.slice(p * FEATURED_PER_PAGE, (p + 1) * FEATURED_PER_PAGE),
  );
  const pinnedIds = new Set(pinned.flat().map((l) => l.id));
  const queue = list
    .filter((l) => !pinnedIds.has(l.id))
    .map((l) => (l.featured ? { ...l, featured: false } : l));

  const pages: AdCard[][] = [];
  for (let p = 0; p < pageCount; p++) {
    const page = [...pinned[p]];
    const count = new Map<string, number>();
    page.forEach((l) =>
      count.set(l.sellerKey, (count.get(l.sellerKey) ?? 0) + 1),
    );
    while (page.length < size && queue.length > 0) {
      const last = page[page.length - 1]?.sellerKey;
      let i = queue.findIndex(
        (l) =>
          l.sellerKey !== last &&
          (count.get(l.sellerKey) ?? 0) < MAX_PER_SELLER,
      );
      if (i < 0) i = queue.findIndex((l) => l.sellerKey !== last);
      if (i < 0) i = 0;
      const [ad] = queue.splice(i, 1);
      page.push(ad);
      count.set(ad.sellerKey, (count.get(ad.sellerKey) ?? 0) + 1);
    }
    pages.push(page);
  }
  // Anything left (only when pinned ads filled pages early) goes last.
  if (queue.length) pages[pages.length - 1].push(...queue);
  return pages;
}

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export const LATEST_SHOWN = 10; // two rows of 5 on desktops; smaller screens show full rows of fewer

export type LatestTab = "latest" | "featured" | "deals" | "near";

/*
 * The featured badge on the homepage: only the newest 3 featured ads
 * (the ones /ads pins on page 1), and at most 1 in every 6 cards, so a
 * highlighted card still stands out.
 */
export function homeBadges(shown: AdCard[], all: AdCard[]): AdCard[] {
  const top = new Set(
    all
      .filter((l) => l.featured)
      .slice(0, FEATURED_PER_PAGE)
      .map((l) => l.id),
  );
  const usedBlocks = new Set<number>();
  return shown.map((l, i) => {
    if (!l.featured) return l;
    const block = Math.floor(i / 6);
    const keep = top.has(l.id) && !usedBlocks.has(block);
    if (keep) usedBlocks.add(block);
    return keep ? l : { ...l, featured: false };
  });
}

// Homepage "Latest ads" tabs: newest, featured, deals, or in the visitor's
// district.
export function latestAds(
  ads: AdCard[],
  tab: LatestTab,
  origin: string | null = null,
  limit = LATEST_SHOWN,
): AdCard[] {
  const list =
    tab === "featured"
      ? ads.filter((l) => l.featured)
      : tab === "deals"
        ? ads.filter((l) => !!l.deal)
        : tab === "near"
          ? origin
            ? ads.filter((l) => locationDistrict(l.location) === origin)
            : []
          : ads;
  return list.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* URL <-> filters (shared by /ads and saved-search alerts)            */
/* ------------------------------------------------------------------ */

export function sameDeals(a: DealTag[], b: DealTag[]) {
  return a.length === b.length && a.every((d) => b.includes(d));
}

// Reconstructs filter state from the URL so a shared/bookmarked link (e.g.
// /ads/vehicles?location=Colombo&brand=Toyota&deal=price-drop) opens
// with the same refinements applied.
export function filtersFromParams(
  sp: URLSearchParams,
  categoryId: string | null,
  dealScope: DealTag[] | null,
): FiltersState {
  const priceMin = sp.get("priceMin") ? Number(sp.get("priceMin")) : null;
  const priceMax = sp.get("priceMax") ? Number(sp.get("priceMax")) : null;
  const matchedPreset = PRICE_PRESETS.find(
    (p) => p.min === priceMin && (p.max ?? null) === priceMax,
  );

  const extra: Record<string, string> = {};
  const fields = categoryId ? CATEGORY_FILTER_FIELDS[categoryId] : undefined;
  fields?.forEach((field) => {
    const v = sp.get(field.key);
    if (v) extra[field.key] = v;
  });

  return {
    location: sp.get("location"),
    priceMin,
    priceMax,
    pricePresetKey: matchedPreset?.key ?? null,
    condition: (sp.get("condition") as Condition | null) ?? "na",
    seller: (sp.get("seller") as SellerType | "all" | null) ?? "all",
    deals: dealsFromParams(sp, dealScope),
    extra,
    negotiable: sp.get("negotiable") === "1",
    verifiedOnly: sp.get("verifiedOnly") === "1",
  };
}

// `deal=all` is the compact form of "every deal type" so the URL doesn't
// carry three repeated deal params. On a deals route the route itself is the
// scope, so an absent param means "the whole scope", not "no deal filter".
export function dealsFromParams(
  sp: URLSearchParams,
  dealScope: DealTag[] | null,
): DealTag[] {
  const values = sp.getAll("deal");
  if (values.includes("all")) return DEAL_VALUES;
  const valid = values.filter((v): v is DealTag =>
    DEAL_VALUES.includes(v as DealTag),
  );
  if (valid.length > 0) return valid;
  return dealScope ?? [];
}

export function paramsFromFilters(
  search: string,
  filters: FiltersState,
  dealScope: DealTag[] | null,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (filters.location) params.set("location", filters.location);
  if (filters.priceMin !== null)
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== null)
    params.set("priceMax", String(filters.priceMax));
  if (filters.condition !== "na") params.set("condition", filters.condition);
  if (filters.seller !== "all") params.set("seller", filters.seller);
  if (filters.negotiable) params.set("negotiable", "1");
  if (filters.verifiedOnly) params.set("verifiedOnly", "1");
  const impliedByRoute = dealScope && sameDeals(filters.deals, dealScope);
  if (!impliedByRoute) {
    if (sameDeals(filters.deals, DEAL_VALUES)) params.set("deal", "all");
    else
      DEAL_VALUES.filter((d) => filters.deals.includes(d)).forEach((d) =>
        params.append("deal", d),
      );
  }
  Object.entries(filters.extra).forEach(([k, v]) => params.set(k, v));
  if (page > 1) params.set("page", String(page));
  return params;
}
