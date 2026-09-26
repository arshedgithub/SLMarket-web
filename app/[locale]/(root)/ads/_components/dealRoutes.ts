import type { DealTag } from "./data";

// URL segment (/ads/deals/<segment>) -> the deal tag it filters on.
export const DEAL_ROUTE_TYPES = {
  coupons: { tag: "coupon", label: "Coupons & Offers" },
  "price-drops": { tag: "price-drop", label: "Price Drops" },
} as const satisfies Record<string, { tag: DealTag; label: string }>;

export type DealRouteType = keyof typeof DEAL_ROUTE_TYPES;

// Kept free of runtime imports so the proxy (edge) can use this file.
const DEAL_TAGS: DealTag[] = Object.values(DEAL_ROUTE_TYPES).map((d) => d.tag);

export function parseDealRouteType(segment: string | undefined) {
  return segment && segment in DEAL_ROUTE_TYPES
    ? (segment as DealRouteType)
    : null;
}

// Canonical ads route for a set of deal types: none -> the plain
// ads page, one -> its own deals route, everything else -> /ads/deals
// (a partial mix of two rides on ?deal= params there).
export function dealsHref(deals: DealTag[]): string {
  if (deals.length === 0) return "/ads";
  if (deals.length === 1) {
    const segment = (Object.keys(DEAL_ROUTE_TYPES) as DealRouteType[]).find(
      (key) => DEAL_ROUTE_TYPES[key].tag === deals[0],
    );
    return segment ? `/ads/deals/${segment}` : "/ads/deals";
  }
  return "/ads/deals";
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

// One URL per result set: `?deal=` params that describe a single deal type or
// every deal type belong on the deals routes (/ads/deals[/<type>]), not
// on /ads or a different deals route. Returns the canonical URL (path +
// query, no locale prefix) when the requested one differs, else null.
// A partial mix of two types stays as /ads/deals?deal=a&deal=b, with the
// params in a fixed order so there's still only one spelling of it.
export function canonicalDealsUrl(
  currentPath: string,
  searchParams: RawSearchParams,
): string | null {
  const requested = ([] as string[]).concat(searchParams.deal ?? []);
  if (requested.length === 0) return null;

  const tags = requested.includes("all")
    ? DEAL_TAGS
    : DEAL_TAGS.filter((tag) => requested.includes(tag));
  if (tags.length === 0) return null;

  const isMix = tags.length > 1 && tags.length < DEAL_TAGS.length;
  const path = isMix ? "/ads/deals" : dealsHref(tags);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "deal" || value === undefined) continue;
    ([] as string[]).concat(value).forEach((v) => query.append(key, v));
  }
  if (isMix) tags.forEach((tag) => query.append("deal", tag));

  const canonicalDeals = isMix ? tags.join(",") : "";
  const canonical = query.toString() ? `${path}?${query}` : path;
  const alreadyCanonical =
    path === currentPath && requested.join(",") === canonicalDeals;
  return alreadyCanonical ? null : canonical;
}
