import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

const { businessesNearby, moreFromSeller, similarAds } = await import(
  "./recommendations"
);
import type { AdView } from "./adView";
import type { NearbyBusiness } from "./recommendations";
import type { AdCard } from "@/app/[locale]/(root)/ads/_components/data";

// Minimal fixtures: only the fields the ranking reads.
function card(slug: string, o: Partial<AdCard> = {}): AdCard {
  return {
    id: slug,
    slug,
    title: slug,
    categoryId: "electronics",
    subcategoryId: "computers",
    location: "Colombo",
    price: 300000,
    priceLabel: "Rs. 300,000",
    image: "/x.webp",
    condition: "used",
    sellerType: "individual",
    attrs: [],
    postedAgo: "1 day ago",
    ...o,
  } as AdCard;
}

function ad(o: Partial<AdView> = {}): AdView {
  return {
    slug: "the-ad",
    categoryId: "electronics",
    subcategoryId: "computers",
    price: 300000,
    details: {},
    district: "Colombo",
    seller: {
      name: null,
      business: null,
      memberSince: null,
      phoneVerified: false,
      otherAdsCount: 0,
    },
    ...o,
  } as AdView;
}

const near = (n: number, o: Partial<AdCard> = {}) =>
  Array.from({ length: n }, (_, i) =>
    card(`near-${o.subcategoryId ?? "computers"}-${i}`, o),
  );

describe("similarAds fallback ladder", () => {
  it("level 1: same subcategory nearby when there are at least 4", () => {
    const row = similarAds(ad(), "Colombo", near(4), new Set());
    expect(row?.level).toBe(1);
    expect(row?.ads).toHaveLength(4);
  });

  it("level 2: same subcategory anywhere when fewer than 4 are nearby", () => {
    const pool = [
      ...near(2),
      ...Array.from({ length: 3 }, (_, i) =>
        card(`jaffna-${i}`, { location: "Jaffna" }),
      ),
    ];
    expect(similarAds(ad(), "Colombo", pool, new Set())?.level).toBe(2);
  });

  it("level 3: same category nearby", () => {
    const pool = [...near(1), ...near(3, { subcategoryId: "mobile-phones" })];
    expect(similarAds(ad(), "Colombo", pool, new Set())?.level).toBe(3);
  });

  it("level 4: popular nearby in any category, featured first", () => {
    const pool = [
      ...near(1),
      card("car", { categoryId: "vehicles", subcategoryId: "cars" }),
      card("sofa", { categoryId: "home-garden", subcategoryId: "furniture" }),
      card("dress", {
        categoryId: "fashion",
        subcategoryId: "womens-clothing",
        featured: true,
      }),
    ];
    const row = similarAds(ad(), "Colombo", pool, new Set());
    expect(row?.level).toBe(4);
    expect(row?.ads[0].slug).toBe("dress");
  });

  it("hides the row when even level 4 has fewer than 4 ads", () => {
    expect(similarAds(ad(), "Colombo", near(3), new Set())).toBeNull();
  });

  it("never includes the ad itself, excluded ads or reserved ads", () => {
    const pool = [card("the-ad"), card("held", { reserved: true }), ...near(5)];
    const row = similarAds(
      ad(),
      "Colombo",
      pool,
      new Set(["near-computers-0"]),
    );
    const slugs = row?.ads.map((l) => l.slug) ?? [];
    expect(slugs).not.toContain("the-ad");
    expect(slugs).not.toContain("held");
    expect(slugs).not.toContain("near-computers-0");
  });

  it("ranks a matching brand, then a close price band, first", () => {
    const pool = [
      card("cheap", { price: 50000 }),
      card("close", { price: 320000 }),
      card("dell", { price: 900000, details: { brand: "Dell" } }),
      card("pricey", { price: 900000 }),
    ];
    const order = similarAds(
      ad({ details: { brand: "Dell" } }),
      "Colombo",
      pool,
      new Set(),
    )?.ads.map((l) => l.slug);
    expect(order?.slice(0, 2)).toEqual(["dell", "close"]);
  });

  it("respects the limit", () => {
    expect(
      similarAds(ad(), "Colombo", near(10), new Set(), 3)?.ads,
    ).toHaveLength(3);
  });
});

describe("moreFromSeller", () => {
  const business = {
    name: "Digital Hub",
    slug: "digital-hub",
    isVerified: true,
  };
  const pool = [
    card("phone", { sellerName: "Digital Hub", categoryId: "electronics" }),
    card("chair", { sellerName: "Digital Hub", categoryId: "home-garden" }),
    card("laptop", { sellerName: "Digital Hub", categoryId: "electronics" }),
    card("other", { sellerName: "Someone Else" }),
  ];

  it("lists the business's same-category ads first, then the rest", () => {
    const rows = moreFromSeller(
      ad({ seller: { ...ad().seller, business } }),
      pool,
    );
    expect(rows.map((l) => l.slug)).toEqual(["phone", "laptop", "chair"]);
  });

  it("is empty for private sellers (cards carry no private seller name)", () => {
    expect(moreFromSeller(ad(), pool)).toEqual([]);
  });
});

describe("businessesNearby", () => {
  const biz = (
    name: string,
    location: string,
    rating: number | null = 4.5,
  ): NearbyBusiness => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    categoryId: "electronics",
    location,
    rating,
    sponsored: false,
  });
  const list = [
    biz("Far Shop", "Jaffna", 5),
    biz("Near Shop", "Colombo"),
    biz("Mid Shop", "Gampaha"),
  ];

  it("never suggests competitors on a business's own ad", () => {
    const businessAd = ad({
      seller: {
        ...ad().seller,
        business: { name: "B", slug: "b", isVerified: true },
      },
    });
    expect(businessesNearby(businessAd, "Colombo", list)).toEqual([]);
  });

  it("suggests the nearest businesses in the category on private ads", () => {
    expect(
      businessesNearby(ad(), "Colombo", list, 2).map((s) => s.name),
    ).toEqual(["Near Shop", "Mid Shop"]);
  });

  it("only suggests businesses in the ad's category", () => {
    const other = { ...biz("Car Mart", "Colombo"), categoryId: "vehicles" };
    expect(businessesNearby(ad(), "Colombo", [other])).toEqual([]);
  });
});
