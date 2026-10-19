import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ db: { businessProfile: { findMany } } }));

const { getDirectory, toDirectoryBusiness } = await import("./fromDatabase");
const { isListed } = await import("./query");
type Row = Parameters<typeof toDirectoryBusiness>[0];

const NOW = Date.parse("2026-10-19T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(NOW - days * DAY);

function listing(o: Record<string, unknown> = {}) {
  return {
    id: "l1",
    title: "iPhone 14",
    price: 245000,
    images: ["/p.webp"],
    subcategoryId: "mobile-phones",
    attributes: { brand: "Apple" },
    islandwideDelivery: false,
    deliveryAvailable: false,
    district: "Colombo",
    createdAt: ago(2),
    updatedAt: ago(1),
    ...o,
  };
}

function row(o: Record<string, unknown> = {}): Row {
  return {
    id: "b1",
    slug: "digital-hub",
    name: "Digital Hub",
    categoryId: "electronics",
    businessType: "STORE",
    bio: "Phones and laptops with warranty. Visit us in Wellawatte.",
    logoUrl: null,
    bannerUrl: null,
    city: "Wellawatte",
    district: "Colombo",
    latitude: 6.8935,
    longitude: 79.8553,
    contactPhone: "0771234567",
    whatsappNumber: null,
    isVerified: true,
    createdAt: ago(400),
    updatedAt: ago(10),
    listings: [listing()],
    ...o,
  } as unknown as Row;
}

beforeEach(() => {
  findMany.mockReset();
});

describe("toDirectoryBusiness", () => {
  it("maps a business profile and its live ads", () => {
    const b = toDirectoryBusiness(row(), NOW);
    expect(b).toMatchObject({
      slug: "digital-hub",
      name: "Digital Hub",
      tagline: "Phones and laptops with warranty.",
      itemsKind: "products",
      typeLabel: "Electronics Store",
      district: "Colombo",
      city: "Wellawatte",
      location: { lat: 6.8935, lng: 79.8553 },
      verifiedLevel: 2,
      itemCount: 1,
      otherBrands: ["Apple"],
      phone: "94771234567",
      whatsapp: "94771234567",
      createdDaysAgo: 400,
      lastActiveDaysAgo: 1,
      published: true,
      suspended: false,
    });
    expect(b.items[0]).toMatchObject({
      id: "l1",
      price: 245000,
      image: "/p.webp",
      addedDaysAgo: 2,
    });
  });

  it("invents no reviews, response times or opening hours", () => {
    const b = toDirectoryBusiness(row(), NOW);
    expect(b.rating).toEqual({ average: 0, count: 0 });
    expect(b.response.conversations).toBe(0);
    expect(b.hoursSet).toBe(false);
    expect(b.authorisedBrands).toEqual([]);
    expect(b.instalmentProviders).toEqual([]);
  });

  it("uses an approximate area when there is no shop pin", () => {
    const b = toDirectoryBusiness(
      row({ latitude: null, longitude: null }),
      NOW,
    );
    expect(b.location).toBeNull();
    expect(b.serviceArea).toEqual({ radiusKm: 5 });
  });

  it("shows delivery only when an ad offers it", () => {
    expect(toDirectoryBusiness(row(), NOW).highlights).toEqual([]);
    const b = toDirectoryBusiness(
      row({ listings: [listing({ islandwideDelivery: true })] }),
      NOW,
    );
    expect(b.highlights).toEqual(["delivery"]);
    expect(b.delivery.islandwide).toBe(true);
  });

  it("unverified businesses are level 1", () => {
    expect(
      toDirectoryBusiness(row({ isVerified: false }), NOW).verifiedLevel,
    ).toBe(1);
  });
});

describe("getDirectory", () => {
  it("reads active businesses with their live ads", async () => {
    findMany.mockResolvedValue([row()]);
    const all = await getDirectory();
    expect(all.map((b) => b.slug)).toEqual(["digital-hub"]);
    expect(all.every(isListed)).toBe(true);
    const q = findMany.mock.calls[0][0];
    expect(q.where).toEqual({ status: "ACTIVE" });
    expect(q.select.listings.where).toEqual({
      status: { in: ["ACTIVE", "RESERVED"] },
    });
  });

  it("is empty, not invented, when the database is down", async () => {
    findMany.mockImplementation(async () => {
      throw new Error("down");
    });
    expect(await getDirectory()).toEqual([]);
  });
});
