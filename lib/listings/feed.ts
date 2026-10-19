import { cache } from "react";
import { db } from "@/lib/db";
import { withTimeout } from "@/lib/business/dbGuard";
import { categories } from "@/config/const/navLinks";
import type { BusinessHighlight } from "@/lib/business/highlights";
import {
  locationDistrict,
  type AdCard,
  type Condition,
  type ShopCard,
} from "@/app/[locale]/(root)/ads/_components/data";
import { isPerMonth, wasPriceFrom } from "./adView";
import { intlPhone } from "@/lib/phone";
import { seededHash } from "@/lib/hash";
import type { NearbyBusiness } from "./recommendations";

/*
 * Everything the lists show comes from the database, through here:
 *   getAdFeed()    live and reserved ads (a suspended business's ads are
 *                  left out), newest first, as cards
 *   getShopFeed()  active businesses with at least one live ad (the
 *                  directory's rule too), as cards
 * Both are read once per request and shared by every part of a page, so
 * the homepage and /ads always agree. If the database cannot answer, the
 * lists are empty: there is no sample data in the app. Demo content is
 * seeded into the database (prisma/seed.ts).
 */

const FEED_LIMIT = 500;
const FEED_TIMEOUT_MS = 10_000;

// "3 hours ago" in the English shape the cards already use.
export function postedAgoText(createdAt: Date, now = Date.now()): string {
  const minutes = Math.max(1, Math.round((now - createdAt.getTime()) / 60_000));
  const unit = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"} ago`;
  if (minutes < 60) return unit(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return unit(hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 7) return unit(days, "day");
  return unit(Math.round(days / 7), "week");
}

// The filter's condition buckets from the structured condition field.
export function conditionOf(
  details: Record<string, string>,
  highlights: string[],
): Condition {
  if (highlights.some((h) => /like new/i.test(h))) return "like-new";
  switch (details.condition) {
    case "Brand new":
      return "new";
    case "Used":
      return "used";
    case "Refurbished":
    case "Reconditioned":
      return "reconditioned";
    default:
      return "na";
  }
}

const rupees = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ */
/* Ads                                                                 */
/* ------------------------------------------------------------------ */

export type FeedRow = Awaited<ReturnType<typeof queryAds>>[number];

// Live and reserved ads that have not expired, from active businesses or
// private sellers.
export function feedWhere(now = new Date()) {
  return {
    status: { in: ["ACTIVE" as const, "RESERVED" as const] },
    AND: [
      {
        OR: [
          { businessProfileId: null },
          { businessProfile: { status: "ACTIVE" as const } },
        ],
      },
      { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    ],
  };
}

function queryAds() {
  return db.listing.findMany({
    where: feedWhere(),
    orderBy: { createdAt: "desc" },
    take: FEED_LIMIT,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      categoryId: true,
      subcategoryId: true,
      attributes: true,
      images: true,
      pricingType: true,
      price: true,
      negotiable: true,
      promotionType: true,
      promotionDetail: true,
      district: true,
      city: true,
      isBoosted: true,
      isFeaturedHomepage: true,
      status: true,
      createdAt: true,
      showContactPhone: true,
      contactPhone: true,
      photoFocus: true,
      sellerId: true,
      seller: { select: { createdAt: true } },
      businessProfile: {
        select: {
          id: true,
          slug: true,
          name: true,
          logoUrl: true,
          isVerified: true,
          contactPhone: true,
          whatsappNumber: true,
        },
      },
      priceHistory: {
        orderBy: { startedAt: "desc" },
        take: 10,
        select: { price: true, startedAt: true, endedAt: true },
      },
    },
  });
}

export function toCard(row: FeedRow, now = Date.now()): AdCard {
  const raw = (row.attributes ?? {}) as Record<string, unknown>;
  const highlights = Array.isArray(raw.highlights)
    ? raw.highlights.filter((h): h is string => typeof h === "string")
    : [];
  const details: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (
      k !== "highlights" &&
      (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    ) {
      details[k] = String(v);
    }
  }

  const price = row.price === null ? 0 : Number(row.price);
  const perMonth = isPerMonth(details);
  const was = row.price === null ? null : wasPriceFrom(row.priceHistory, price);
  const business = row.businessProfile;
  const coupon = row.promotionType === "COUPON" && row.promotionDetail;
  // Only a business's number is ever on a card; private numbers stay
  // behind the ad page's email check.
  const businessPhone =
    business && row.showContactPhone
      ? intlPhone(row.contactPhone ?? business.contactPhone)
      : null;

  const focus = Array.isArray(row.photoFocus)
    ? focusOf(row.photoFocus[0])
    : null;

  return {
    id: row.id,
    slug: row.slug,
    sellerKey: business ? `b:${business.id}` : `u:${row.sellerId}`,
    focus,
    title: row.title,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    location: row.city ?? row.district ?? "Sri Lanka",
    price,
    priceLabel:
      row.pricingType === "FREE"
        ? "Free"
        : row.price === null
          ? "Contact for price"
          : `${rupees(price)}${perMonth ? " / month" : ""}`,
    originalPriceLabel: was ? rupees(was.price) : undefined,
    image: row.images[0] ?? "",
    photos: row.images.length,
    details,
    condition: conditionOf(details, highlights),
    sellerType: business
      ? business.isVerified
        ? "verified"
        : "shop"
      : "individual",
    sellerName: business?.name,
    sellerSlug: business?.slug,
    sellerLogo: business?.logoUrl ?? null,
    contactPhone: businessPhone ?? undefined,
    featured: row.isFeaturedHomepage,
    premium: row.isBoosted,
    deal: coupon ? "coupon" : was ? "price-drop" : undefined,
    negotiable: row.negotiable,
    offer: coupon ? row.promotionDetail! : undefined,
    description: row.description,
    attrs: highlights,
    postedAgo: postedAgoText(row.createdAt, now),
    postedAt: row.createdAt.toISOString(),
    reserved: row.status === "RESERVED",
    urgent: details.urgent === "true",
  };
}

// A focal point from the stored JSON, or null when it isn't one.
function focusOf(v: unknown): { x: number; y: number } | null {
  const p = v as { x?: unknown; y?: unknown } | null;
  const ok = (n: unknown): n is number =>
    typeof n === "number" && n >= 0 && n <= 1;
  return p && ok(p.x) && ok(p.y) ? { x: p.x, y: p.y } : null;
}

// One query per request, shared by every part of the page that needs ads.
export const getAdFeed = cache(async (): Promise<AdCard[]> => {
  try {
    const rows = await withTimeout(queryAds(), FEED_TIMEOUT_MS);
    return rows.map((r) => toCard(r));
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getAdFeed] failed:", err);
    }
    return [];
  }
});

/* ------------------------------------------------------------------ */
/* Businesses                                                          */
/* ------------------------------------------------------------------ */

export type ShopRow = Awaited<ReturnType<typeof queryShops>>[number];

function queryShops() {
  return db.businessProfile.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      bio: true,
      logoUrl: true,
      createdAt: true,
      categoryId: true,
      city: true,
      district: true,
      isVerified: true,
      tier: true,
      contactPhone: true,
      whatsappNumber: true,
      bannerUrl: true,
      listings: {
        where: feedWhere(),
        select: { islandwideDelivery: true, deliveryAvailable: true },
      },
    },
  });
}

const TIER: Record<ShopRow["tier"], ShopCard["tier"]> = {
  PREMIUM: "premium",
  TOP_RATED: "toprated",
  VERIFIED: "verified",
  STANDARD: "standard",
};

export function toShopCard(row: ShopRow): ShopCard {
  const highlights: BusinessHighlight[] = [];
  if (row.listings.some((l) => l.islandwideDelivery || l.deliveryAvailable))
    highlights.push("delivery");
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.categoryId,
    category:
      categories.find((c) => c.id === row.categoryId)?.name ?? row.categoryId,
    location: row.city ?? row.district ?? "",
    verified: row.isVerified,
    tier: TIER[row.tier],
    rating: null,
    reviews: 0,
    response: null,
    listings: row.listings.length,
    phone: intlPhone(row.whatsappNumber ?? row.contactPhone),
    cover: row.bannerUrl,
    logo: row.logoUrl,
    tagline: row.bio ? row.bio.split(/(?<=[.!?])\s/)[0].slice(0, 110) : "",
    highlights,
    createdAt: row.createdAt.toISOString(),
  };
}

// Paid placement first (premium), then top rated, verified and standard.
// Within a tier the order rotates daily (a seeded shuffle), so businesses
// paying for the same tier get the same exposure over time. Every list of
// businesses (homepage strip, /ads strip) keeps this order.
export const TIER_RANK: Record<ShopCard["tier"], number> = {
  premium: 3,
  toprated: 2,
  verified: 1,
  standard: 0,
};

// Today in Sri Lanka, "YYYY-MM-DD".
export function colomboDay(now = Date.now()): string {
  return new Date(now + 5.5 * 3600_000).toISOString().slice(0, 10);
}

export function rankShops(shops: ShopCard[], seed = colomboDay()): ShopCard[] {
  return [...shops].sort(
    (x, y) =>
      TIER_RANK[y.tier] - TIER_RANK[x.tier] ||
      seededHash(seed + x.slug) - seededHash(seed + y.slug),
  );
}

const NEW_BUSINESS_DAYS = 30;
export const STRIP_MIN_ADS = 3;

export function isNewBusiness(shop: ShopCard, now = Date.now()): boolean {
  return now - Date.parse(shop.createdAt) < NEW_BUSINESS_DAYS * 86_400_000;
}

/*
 * The "Featured businesses" strip: paid tiers only (not standard), with at
 * least 3 live ads, or newer than 30 days (shown with a "New" label).
 */
export function featuredStripShops(
  shops: ShopCard[],
  now = Date.now(),
): ShopCard[] {
  return shops.filter(
    (s) =>
      s.tier !== "standard" &&
      (s.listings >= STRIP_MIN_ADS || isNewBusiness(s, now)),
  );
}

export const getShopFeed = cache(async (): Promise<ShopCard[]> => {
  try {
    const rows = await withTimeout(queryShops(), FEED_TIMEOUT_MS);
    // A business with nothing live has nothing to show (as in the directory).
    return rankShops(rows.map(toShopCard).filter((s) => s.listings > 0));
  } catch {
    return [];
  }
});

// Businesses in a category, for "Businesses selling ... near you" on
// private-seller ads. Premium-tier businesses are paid placements and are
// labelled as such.
export async function businessesInCategory(
  categoryId: string,
): Promise<NearbyBusiness[]> {
  const shops = await getShopFeed();
  return shops
    .filter((s) => s.categoryId === categoryId)
    .map((s) => ({
      name: s.name,
      slug: s.slug,
      categoryId: s.categoryId,
      location: s.location,
      rating: s.rating,
      sponsored: s.tier === "premium",
    }));
}

/* ------------------------------------------------------------------ */
/* Counts                                                              */
/* ------------------------------------------------------------------ */

export type DistrictCount = { name: string; count24h: number; count7d: number };

export type FeedStats = {
  total: number;
  postedToday: number;
  byCategory: Record<string, number>;
  bySubcategory: Record<string, number>; // "<category>/<subcategory>"
  // Districts by new ads in the last 24 hours (then 7 days), busiest first.
  districts: DistrictCount[];
  // How many districts had a new ad in the last 24 hours.
  activeDistricts: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

// How long ago an ad was posted, in ms.
function ageMs(ad: AdCard, now: number): number {
  const at = Date.parse(ad.postedAt);
  return Number.isFinite(at) ? now - at : Number.POSITIVE_INFINITY;
}

// Counts shown around the lists (category chips, "N new today").
export function feedStats(ads: AdCard[], now = Date.now()): FeedStats {
  const stats: FeedStats = {
    total: ads.length,
    postedToday: 0,
    byCategory: {},
    bySubcategory: {},
    districts: [],
    activeDistricts: 0,
  };
  const byDistrict = new Map<string, DistrictCount>();
  for (const ad of ads) {
    stats.byCategory[ad.categoryId] =
      (stats.byCategory[ad.categoryId] ?? 0) + 1;
    const key = `${ad.categoryId}/${ad.subcategoryId}`;
    stats.bySubcategory[key] = (stats.bySubcategory[key] ?? 0) + 1;

    const age = ageMs(ad, now);
    if (age >= 7 * DAY_MS) continue;
    const name = locationDistrict(ad.location);
    const d = byDistrict.get(name) ?? { name, count24h: 0, count7d: 0 };
    d.count7d += 1;
    if (age < DAY_MS) {
      d.count24h += 1;
      stats.postedToday += 1;
    }
    byDistrict.set(name, d);
  }
  stats.districts = [...byDistrict.values()].sort(
    (a, b) => b.count24h - a.count24h || b.count7d - a.count7d,
  );
  stats.activeDistricts = stats.districts.filter((d) => d.count24h > 0).length;
  return stats;
}
