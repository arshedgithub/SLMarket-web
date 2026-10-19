import type { FeedRow, ShopRow } from "./feed";

/*
 * Database rows as the feed queries select them, for tests. Not test files
 * themselves (vitest runs *.test.ts only).
 */

export const NOW = Date.parse("2026-10-19T12:00:00Z");
export const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;
export const ago = (ms: number) => new Date(NOW - ms);

export function adRow(o: Record<string, unknown> = {}): FeedRow {
  return {
    id: "id1",
    slug: "dell-xps",
    title: "Dell XPS 13",
    description: "Lightly used.",
    categoryId: "electronics",
    subcategoryId: "computers",
    attributes: {
      highlights: ["i7", "Like New"],
      condition: "Used",
      brand: "Dell",
    },
    images: ["/a.webp", "/b.webp", "/c.webp"],
    pricingType: "FIXED",
    price: 299000,
    negotiable: true,
    promotionType: "NONE",
    promotionDetail: null,
    district: "Colombo",
    city: "Colombo",
    isBoosted: false,
    isFeaturedHomepage: true,
    status: "ACTIVE",
    createdAt: ago(3 * HOUR),
    showContactPhone: true,
    contactPhone: null,
    sellerId: "user1",
    seller: { createdAt: new Date("2023-04-01T00:00:00Z") },
    businessProfile: {
      id: "biz1",
      slug: "techzone",
      name: "TechZone",
      isVerified: true,
      contactPhone: "0711000001",
      whatsappNumber: null,
    },
    priceHistory: [],
    ...o,
  } as unknown as FeedRow;
}

export function shopRow(o: Record<string, unknown> = {}): ShopRow {
  return {
    id: "biz1",
    slug: "techzone",
    name: "TechZone",
    categoryId: "electronics",
    city: "Colombo",
    district: "Colombo",
    isVerified: true,
    tier: "STANDARD",
    contactPhone: "0711000001",
    whatsappNumber: null,
    bannerUrl: null,
    logoUrl: null,
    bio: null,
    createdAt: new Date(NOW),
    listings: [],
    ...o,
  } as unknown as ShopRow;
}

const CATEGORIES: [string, string][] = [
  ["electronics", "mobile-phones"],
  ["electronics", "computers"],
  ["vehicles", "cars"],
  ["vehicles", "motorbikes"],
  ["property", "houses"],
  ["animals-pets", "dogs"],
  ["jobs", "it"],
];
const TOWNS = ["Colombo", "Kandy", "Galle", "Gampaha", "Kurunegala"];

// A realistic feed: 45 ads across categories, towns, ages and sellers,
// newest first (the order the query asks the database for).
export function feedRows(): FeedRow[] {
  return Array.from({ length: 45 }, (_, i) => {
    const [categoryId, subcategoryId] = CATEGORIES[i % CATEGORIES.length];
    const town = TOWNS[i % TOWNS.length];
    const business = i % 3 === 0;
    return adRow({
      id: `ad${i}`,
      slug: `ad-${i}`,
      title: `Ad ${i}`,
      categoryId,
      subcategoryId,
      city: town,
      district: town,
      price: 10_000 + i * 1_000,
      images: Array.from(
        { length: (i % 4) + 1 },
        (_, k) => `/ad${i}-${k}.webp`,
      ),
      isFeaturedHomepage: i % 7 === 2,
      isBoosted: i % 11 === 4,
      status: i % 13 === 5 ? "RESERVED" : "ACTIVE",
      createdAt: ago(i * 5 * HOUR),
      // A few sellers post several ads, as in real life.
      sellerId: `user-${i % 6}`,
      businessProfile: business
        ? {
            id: `biz-${i % 4}`,
            slug: `shop-${i % 4}`,
            name: `Shop ${i % 4}`,
            isVerified: i % 2 === 0,
            contactPhone: "0711000001",
            whatsappNumber: null,
          }
        : null,
    });
  });
}

export function shopRows(): ShopRow[] {
  const tiers = ["PREMIUM", "TOP_RATED", "VERIFIED", "STANDARD"];
  return Array.from({ length: 10 }, (_, i) =>
    shopRow({
      id: `biz-${i}`,
      slug: `shop-${i}`,
      name: `Shop ${i}`,
      categoryId: CATEGORIES[i % CATEGORIES.length][0],
      tier: tiers[Math.floor(i / 3)] ?? "STANDARD",
      listings: Array.from({ length: i }, () => ({
        islandwideDelivery: false,
        deliveryAvailable: i % 2 === 0,
      })),
    }),
  );
}
