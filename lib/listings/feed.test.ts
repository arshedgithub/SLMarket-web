import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
const { conditionOf, feedStats, postedAgoText, toCard, toShopCard } =
  await import("./feed");
import type { AdCard } from "@/app/[locale]/(root)/ads/_components/data";
import {
  DAY,
  HOUR,
  MIN,
  NOW,
  adRow as row,
  ago,
  shopRow,
} from "./feedRows.fixture";

describe("postedAgoText", () => {
  it("uses the card's English shape", () => {
    expect(postedAgoText(ago(30 * 1000), NOW)).toBe("1 minute ago");
    expect(postedAgoText(ago(5 * MIN), NOW)).toBe("5 minutes ago");
    expect(postedAgoText(ago(1 * HOUR), NOW)).toBe("1 hour ago");
    expect(postedAgoText(ago(3 * DAY), NOW)).toBe("3 days ago");
    expect(postedAgoText(ago(15 * DAY), NOW)).toBe("2 weeks ago");
  });
});

describe("conditionOf", () => {
  it("maps the condition field to the filter buckets", () => {
    expect(conditionOf({ condition: "Brand new" }, [])).toBe("new");
    expect(conditionOf({ condition: "Used" }, [])).toBe("used");
    expect(conditionOf({ condition: "Reconditioned" }, [])).toBe(
      "reconditioned",
    );
    expect(conditionOf({}, [])).toBe("na");
  });
  it("treats a 'Like New' highlight as like-new", () => {
    expect(conditionOf({ condition: "Used" }, ["Like New"])).toBe("like-new");
  });
});

describe("toCard", () => {
  it("maps a database row to a card", () => {
    const c = toCard(row(), NOW);
    expect(c).toMatchObject({
      slug: "dell-xps",
      location: "Colombo",
      price: 299000,
      priceLabel: "Rs. 299,000",
      image: "/a.webp",
      photos: 3,
      condition: "like-new",
      sellerType: "verified",
      sellerName: "TechZone",
      featured: true,
      negotiable: true,
      fixedPrice: false,
      attrs: ["i7", "Like New"],
      postedAgo: "3 hours ago",
      postedAt: ago(3 * HOUR).toISOString(),
      reserved: false,
    });
    expect(c.details).toEqual({ condition: "Used", brand: "Dell" });
  });

  it("counts every photo, and a single photo as one", () => {
    expect(toCard(row({ images: ["/only.webp"] }), NOW).photos).toBe(1);
    expect(toCard(row({ images: [] }), NOW)).toMatchObject({
      photos: 0,
      image: "",
    });
  });

  it("marks rentals per month and coupons as deals", () => {
    const rent = toCard(
      row({ attributes: { listingType: "Rent out" }, price: 250000 }),
      NOW,
    );
    expect(rent.priceLabel).toBe("Rs. 250,000 / month");
    const coupon = toCard(
      row({ promotionType: "COUPON", promotionDetail: "10% off" }),
      NOW,
    );
    expect(coupon.deal).toBe("coupon");
    expect(coupon.offer).toBe("10% off");
  });

  it("shows a genuine drop as a price-drop deal", () => {
    const c = toCard(
      row({
        price: 175000,
        priceHistory: [
          { price: 175000, startedAt: ago(2 * DAY), endedAt: null },
          { price: 195000, startedAt: ago(20 * DAY), endedAt: ago(2 * DAY) },
        ],
      }),
      NOW,
    );
    expect(c.originalPriceLabel).toBe("Rs. 195,000");
    expect(c.deal).toBe("price-drop");
  });

  it("handles private sellers, free items and reserved ads", () => {
    const c = toCard(
      row({
        businessProfile: null,
        pricingType: "FREE",
        price: null,
        status: "RESERVED",
      }),
      NOW,
    );
    expect(c.sellerType).toBe("individual");
    expect(c.sellerName).toBeUndefined();
    expect(c.memberSince).toBe(2023);
    expect(c.priceLabel).toBe("Free");
    expect(c.reserved).toBe(true);
  });

  it("puts only a business's number on a card", () => {
    expect(toCard(row(), NOW).contactPhone).toBe("94711000001");
    expect(toCard(row({ contactPhone: "0777123456" }), NOW).contactPhone).toBe(
      "94777123456",
    );
    expect(
      toCard(row({ showContactPhone: false }), NOW).contactPhone,
    ).toBeUndefined();
    // A private seller's number stays behind the ad page's email check.
    expect(
      toCard(row({ businessProfile: null, contactPhone: "0777123456" }), NOW)
        .contactPhone,
    ).toBeUndefined();
  });

  it("marks fixed, non-negotiable prices", () => {
    expect(toCard(row({ negotiable: false }), NOW).fixedPrice).toBe(true);
    expect(
      toCard(row({ pricingType: "STARTING_FROM", negotiable: false }), NOW)
        .fixedPrice,
    ).toBe(false);
  });
});

describe("toShopCard", () => {
  it("maps a business row, without invented ratings or response times", () => {
    const s = toShopCard(
      shopRow({
        tier: "PREMIUM",
        listings: [{ islandwideDelivery: true, deliveryAvailable: false }],
      }),
    );
    expect(s).toEqual({
      id: "biz1",
      slug: "techzone",
      name: "TechZone",
      categoryId: "electronics",
      category: "Electronics",
      location: "Colombo",
      verified: true,
      tier: "premium",
      rating: null,
      reviews: 0,
      response: null,
      listings: 1,
      phone: "94711000001",
      cover: null,
      logo: null,
      tagline: "",
      createdAt: new Date(NOW).toISOString(),
      highlights: ["delivery"],
    });
  });

  it("maps every tier and prefers the WhatsApp number", () => {
    expect(toShopCard(shopRow({ tier: "TOP_RATED" })).tier).toBe("toprated");
    expect(toShopCard(shopRow({ tier: "VERIFIED" })).tier).toBe("verified");
    expect(toShopCard(shopRow({ tier: "STANDARD" })).tier).toBe("standard");
    expect(toShopCard(shopRow({ whatsappNumber: "0779999999" })).phone).toBe(
      "94779999999",
    );
  });
});

describe("feedStats", () => {
  const ad = (category: string, location: string, msAgo: number): AdCard =>
    ({
      categoryId: category,
      subcategoryId: "x",
      location,
      postedAgo: "",
      postedAt: new Date(NOW - msAgo).toISOString(),
    }) as AdCard;

  it("counts totals, categories and new ads per district", () => {
    const stats = feedStats(
      [
        ad("electronics", "Colombo", 1 * HOUR),
        ad("electronics", "Colombo", 2 * HOUR),
        ad("vehicles", "Kandy", 3 * HOUR),
        ad("vehicles", "Kandy", 3 * DAY),
        ad("property", "Galle", 30 * DAY),
      ],
      NOW,
    );
    expect(stats.total).toBe(5);
    expect(stats.postedToday).toBe(3);
    expect(stats.byCategory).toEqual({
      electronics: 2,
      vehicles: 2,
      property: 1,
    });
    expect(stats.bySubcategory["vehicles/x"]).toBe(2);
    expect(stats.districts).toEqual([
      { name: "Colombo", count24h: 2, count7d: 2 },
      { name: "Kandy", count24h: 1, count7d: 2 },
    ]);
    expect(stats.activeDistricts).toBe(2);
  });

  it("does not count an ad without a valid time as new", () => {
    expect(
      feedStats([{ ...ad("food", "Matale", 0), postedAt: "" }], NOW)
        .postedToday,
    ).toBe(0);
  });
});
