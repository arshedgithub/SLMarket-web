import { cache } from "react";
import { db } from "@/lib/db";
import { withTimeout } from "@/lib/business/dbGuard";
import { priceDropPercent } from "@/lib/business/pricing";
import { intlPhone } from "@/lib/phone";

/*
 * Everything the ad page (/ad/<slug>) shows, from its Listing row. A row
 * that may not be shown (pending, rejected, paused, or its business
 * suspended) is no ad at all. There is no sample data: demo ads are seeded
 * into the database (prisma/seed.ts).
 * `contact` is server-only: a private seller's number never goes into the
 * page, only through /api/ads/reveal.
 */

// reserved: a buyer is lined up; others can still contact the seller.
export type AdStatus = "live" | "reserved" | "sold" | "expired";

export type AdView = {
  id: string;
  slug: string;
  // Short reference people can quote on the phone.
  adCode: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  photos: string[];
  videoUrl: string | null;
  isBoosted: boolean;
  pricingType: "FIXED" | "STARTING_FROM" | "CONTACT" | "FREE";
  price: number | null;
  currency: string;
  priceRange: string | null; // shown as is (salary ranges)
  perMonth: boolean;
  negotiable: boolean;
  // A genuine drop: below the lowest price of the 30 days before it.
  wasPrice: { price: number; since: Date | null } | null;
  promotionDetail: string | null;
  district: string | null;
  city: string | null;
  createdAt: Date;
  delivery: "none" | "available" | "islandwide";
  highlights: string[];
  details: Record<string, string>;
  status: AdStatus;
  statusSince: Date | null; // when it became sold / expired
  views: number | null;
  sellerUserId: string | null; // owner view
  seller: {
    name: string | null; // null: a private seller with no public name
    business: { name: string; slug: string; isVerified: boolean } | null;
    memberSince: Date | null;
    phoneVerified: boolean;
    otherAdsCount: number;
  };
  contact: { phone: string | null; whatsapp: string | null };
  metaTitle: string | null;
  metaDescription: string | null;
  schemaMarkup: unknown;
};

// Rentals and monthly salaries are priced per month (the card and the ad
// page both read this).
export const isPerMonth = (details: Record<string, string>) =>
  details.listingType === "Rent out" || details.salaryPeriod === "Per month";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const STATUS: Record<string, AdStatus | undefined> = {
  ACTIVE: "live",
  RESERVED: "reserved",
  SOLD: "sold",
  EXPIRED: "expired",
};

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      out[k] = String(v);
    }
  }
  return out;
}

// "Was" price from PriceHistory: the lowest price in the 30 days before the
// current price started, shown only when today's price is a real drop.
export function wasPriceFrom(
  history: { price: unknown; startedAt: Date; endedAt: Date | null }[],
  price: number | null,
): AdView["wasPrice"] {
  if (price === null) return null;
  const current = history.find((h) => h.endedAt === null);
  if (!current) return null;
  const windowStart = current.startedAt.getTime() - THIRTY_DAYS_MS;
  const earlier = history.filter(
    (h) => h.endedAt && h.endedAt.getTime() >= windowStart && h !== current,
  );
  if (earlier.length === 0) return null;
  const lowest = Math.min(...earlier.map((h) => Number(h.price)));
  return priceDropPercent(price, lowest)
    ? { price: lowest, since: current.startedAt }
    : null;
}

async function fromDatabase(slug: string): Promise<AdView | null> {
  let row;
  try {
    row = await withTimeout(
      db.listing.findUnique({
        where: { slug },
        include: {
          seller: {
            select: {
              name: true,
              phone: true,
              phoneVerified: true,
              createdAt: true,
            },
          },
          businessProfile: {
            select: {
              id: true,
              name: true,
              slug: true,
              isVerified: true,
              contactPhone: true,
              whatsappNumber: true,
              status: true,
            },
          },
          priceHistory: {
            orderBy: { startedAt: "desc" },
            take: 10,
            select: { price: true, startedAt: true, endedAt: true },
          },
          _count: { select: { analytics: true } },
        },
      }),
    );
  } catch {
    // Database unreachable: no ad rather than a crash.
    return null;
  }
  if (!row) return null;

  const business = row.businessProfile;
  const status = STATUS[row.status];
  if (!status || (business && business.status !== "ACTIVE")) {
    return null;
  }

  const attributes = stringRecord(row.attributes);
  const rawAttrs = row.attributes as { highlights?: unknown } | null;
  const highlights = Array.isArray(rawAttrs?.highlights)
    ? rawAttrs.highlights.filter((h): h is string => typeof h === "string")
    : [];
  delete attributes.highlights;

  // Other live ads by the same seller (or business).
  let otherAdsCount = 0;
  try {
    otherAdsCount = await withTimeout(
      db.listing.count({
        where: {
          status: "ACTIVE",
          id: { not: row.id },
          ...(business
            ? { businessProfileId: business.id }
            : { sellerId: row.sellerId, businessProfileId: null }),
        },
      }),
    );
  } catch {
    /* the count is a nice-to-have */
  }

  const price = row.price === null ? null : Number(row.price);
  const phone = row.showContactPhone
    ? intlPhone(row.contactPhone ?? business?.contactPhone ?? row.seller.phone)
    : null;

  return {
    id: row.id,
    slug: row.slug,
    adCode: row.id.slice(-8).toUpperCase(),
    title: row.title,
    description: row.description,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    photos: row.images,
    videoUrl: row.videoUrl,
    isBoosted: row.isBoosted,
    pricingType: row.pricingType,
    price,
    currency: row.currency,
    priceRange: null,
    perMonth: isPerMonth(attributes),
    negotiable: row.negotiable,
    wasPrice: wasPriceFrom(row.priceHistory, price),
    promotionDetail: row.promotionType !== "NONE" ? row.promotionDetail : null,
    district: row.district,
    city: row.city,
    createdAt: row.createdAt,
    delivery: row.islandwideDelivery
      ? "islandwide"
      : row.deliveryAvailable
        ? "available"
        : "none",
    highlights,
    details: attributes,
    status,
    statusSince:
      status === "sold" || status === "expired" ? row.updatedAt : null,
    views: row._count.analytics,
    sellerUserId: row.sellerId,
    seller: {
      name: business?.name ?? row.seller.name,
      business: business
        ? {
            name: business.name,
            slug: business.slug,
            isVerified: business.isVerified,
          }
        : null,
      memberSince: row.seller.createdAt,
      phoneVerified: row.seller.phoneVerified,
      otherAdsCount,
    },
    contact: {
      phone,
      whatsapp: row.allowWhatsapp
        ? (intlPhone(business?.whatsappNumber) ?? phone)
        : null,
    },
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    schemaMarkup: row.schemaMarkup,
  };
}

// cache(): generateMetadata and the page share one lookup per request.
export const getAdView = cache(async (slug: string): Promise<AdView | null> => {
  return fromDatabase(slug);
});

// For the proxy: is /ad/<slug> worth rendering? Sold and expired ads still
// render (with their own state); hidden ones are a 404. Fails open when
// the database cannot answer, so the page decides for itself.
export async function isLiveAd(slug: string): Promise<boolean> {
  let row;
  try {
    row = await withTimeout(
      db.listing.findUnique({
        where: { slug },
        select: { status: true, businessProfile: { select: { status: true } } },
      }),
    );
  } catch {
    return true;
  }
  if (!row) return false;
  return (
    !!STATUS[row.status] &&
    (!row.businessProfile || row.businessProfile.status === "ACTIVE")
  );
}

// An ad that stopped being live more than 30 days ago is kept out of
// search results.
export const isStale = (ad: AdView) =>
  (ad.status === "sold" || ad.status === "expired") &&
  !!ad.statusSince &&
  Date.now() - ad.statusSince.getTime() > THIRTY_DAYS_MS;
