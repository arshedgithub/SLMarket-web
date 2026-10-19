import { beforeEach, describe, expect, it, vi } from "vitest";

// The database is mocked: each test decides what a Listing lookup returns.
const findUnique = vi.fn();
const count = vi.fn();
vi.mock("@/lib/db", () => ({ db: { listing: { findUnique, count } } }));

const { getAdView, isLiveAd, isStale, wasPriceFrom } = await import("./adView");
const { intlPhone } = await import("@/lib/phone");

const DAY = 24 * 60 * 60 * 1000;
const at = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY);

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: "clxyz0000000000000abcd1234",
    slug: "iphone-13-128gb",
    title: "iPhone 13 128GB",
    description: "Like new.",
    categoryId: "electronics",
    subcategoryId: "mobile-phones",
    attributes: { highlights: ["Like New"], condition: "Used", brand: "Apple" },
    images: ["/a.webp"],
    videoUrl: null,
    isBoosted: false,
    pricingType: "FIXED",
    price: 175000,
    currency: "LKR",
    negotiable: false,
    promotionType: "NONE",
    promotionDetail: null,
    district: "Colombo",
    city: "Colombo",
    createdAt: at(3),
    updatedAt: at(1),
    islandwideDelivery: false,
    deliveryAvailable: false,
    status: "ACTIVE",
    sellerId: "user-1",
    showContactPhone: true,
    contactPhone: null,
    allowWhatsapp: true,
    metaTitle: null,
    metaDescription: null,
    schemaMarkup: null,
    seller: {
      name: "Owner",
      phone: "94770000000",
      phoneVerified: true,
      createdAt: at(400),
    },
    businessProfile: null,
    priceHistory: [],
    _count: { analytics: 12 },
    ...overrides,
  };
}

beforeEach(() => {
  findUnique.mockReset();
  count.mockReset().mockResolvedValue(2);
});

describe("wasPriceFrom (30-day lowest price rule)", () => {
  const current = { price: 175000, startedAt: at(2), endedAt: null };

  it("shows the lowest earlier price when today's price is a real drop", () => {
    const history = [
      current,
      { price: 185000, startedAt: at(12), endedAt: at(2) },
      { price: 195000, startedAt: at(25), endedAt: at(12) },
    ];
    expect(wasPriceFrom(history, 175000)).toEqual({
      price: 185000,
      since: current.startedAt,
    });
  });

  it("ignores drops under 5%", () => {
    const history = [
      current,
      { price: 180000, startedAt: at(12), endedAt: at(2) },
    ];
    expect(wasPriceFrom(history, 175000)).toBeNull();
  });

  it("ignores prices from more than 30 days before the change", () => {
    const history = [
      current,
      { price: 250000, startedAt: at(90), endedAt: at(40) },
    ];
    expect(wasPriceFrom(history, 175000)).toBeNull();
  });

  it("needs a current price and a price", () => {
    expect(
      wasPriceFrom([{ price: 1, startedAt: at(5), endedAt: at(1) }], 175000),
    ).toBeNull();
    expect(wasPriceFrom([current], null)).toBeNull();
  });
});

describe("getAdView", () => {
  it("maps a live database row", async () => {
    findUnique.mockResolvedValue(row());
    const ad = await getAdView("iphone-13-128gb");
    expect(ad?.status).toBe("live");
    expect(ad?.details).toEqual({ condition: "Used", brand: "Apple" }); // highlights split out
    expect(ad?.highlights).toEqual(["Like New"]);
    expect(ad?.views).toBe(12);
    expect(ad?.adCode).toBe("ABCD1234");
    expect(ad?.seller.otherAdsCount).toBe(2);
    // A private seller's number falls back to their account phone.
    expect(ad?.contact.phone).toBe("94770000000");
  });

  it("uses the business's own phone and WhatsApp for business ads", async () => {
    findUnique.mockResolvedValue(
      row({
        businessProfile: {
          id: "b1",
          name: "TechZone Sri Lanka",
          slug: "techzone-sri-lanka",
          isVerified: true,
          contactPhone: "94711000001",
          whatsappNumber: "94711000009",
          status: "ACTIVE",
        },
      }),
    );
    const ad = await getAdView("iphone-13-128gb");
    expect(ad?.seller.business?.slug).toBe("techzone-sri-lanka");
    expect(ad?.contact).toEqual({
      phone: "94711000001",
      whatsapp: "94711000009",
    });
  });

  it("hides the number when the seller turned it off", async () => {
    findUnique.mockResolvedValue(
      row({ showContactPhone: false, allowWhatsapp: false }),
    );
    expect((await getAdView("iphone-13-128gb"))?.contact).toEqual({
      phone: null,
      whatsapp: null,
    });
  });

  it("keeps sold and expired ads, with their state", async () => {
    findUnique.mockResolvedValue(row({ status: "SOLD" }));
    expect((await getAdView("iphone-13-128gb"))?.status).toBe("sold");
    findUnique.mockResolvedValue(row({ status: "EXPIRED" }));
    expect((await getAdView("iphone-13-128gb"))?.status).toBe("expired");
  });

  it("keeps reserved ads contactable and never stale", async () => {
    findUnique.mockResolvedValue(
      row({ status: "RESERVED", updatedAt: at(90) }),
    );
    const ad = await getAdView("iphone-13-128gb");
    expect(ad?.status).toBe("reserved");
    expect(ad?.contact.phone).toBe("94770000000");
    expect(isStale(ad!)).toBe(false);
  });

  it("hides ads that are not public", async () => {
    for (const status of [
      "PENDING_REVIEW",
      "REJECTED",
      "PAUSED",
      "CHANGES_REQUESTED",
    ]) {
      findUnique.mockResolvedValue(row({ status }));
      expect(await getAdView("iphone-13-128gb")).toBeNull();
    }
  });

  it("hides every ad of a suspended business", async () => {
    findUnique.mockResolvedValue(
      row({
        businessProfile: {
          id: "b1",
          name: "X",
          slug: "x",
          isVerified: true,
          contactPhone: "1",
          whatsappNumber: null,
          status: "SUSPENDED",
        },
      }),
    );
    expect(await getAdView("iphone-13-128gb")).toBeNull();
  });

  it("has no ad without a row, even for a seeded demo slug", async () => {
    findUnique.mockResolvedValue(null);
    expect(await getAdView("macbook-air-m1")).toBeNull();
    expect(await getAdView("no-such-ad")).toBeNull();
  });

  it("keeps every photo of the row, in order", async () => {
    findUnique.mockResolvedValue(
      row({ images: ["/a.webp", "/b.webp", "/c.webp"] }),
    );
    expect((await getAdView("iphone-13-128gb"))?.photos).toEqual([
      "/a.webp",
      "/b.webp",
      "/c.webp",
    ]);
  });

  it("has no ad (not an invented one) when the database fails", async () => {
    findUnique.mockRejectedValue(new Error("down"));
    expect(await getAdView("macbook-air-m1")).toBeNull();
  });

  it("prices rentals per month, like the card", async () => {
    findUnique.mockResolvedValue(
      row({ attributes: { listingType: "Rent out" } }),
    );
    expect((await getAdView("iphone-13-128gb"))?.perMonth).toBe(true);
    findUnique.mockResolvedValue(row());
    expect((await getAdView("iphone-13-128gb"))?.perMonth).toBe(false);
  });
});

describe("isLiveAd (the proxy check)", () => {
  it("renders live, sold and expired rows; hides the rest", async () => {
    for (const [status, expected] of [
      ["ACTIVE", true],
      ["SOLD", true],
      ["EXPIRED", true],
      ["RESERVED", true],
      ["PENDING_REVIEW", false],
      ["REJECTED", false],
    ] as const) {
      findUnique.mockResolvedValue({ status, businessProfile: null });
      expect(await isLiveAd("x")).toBe(expected);
    }
  });

  it("is false when there is no row", async () => {
    findUnique.mockResolvedValue(null);
    expect(await isLiveAd("macbook-air-m1")).toBe(false);
    expect(await isLiveAd("no-such-ad")).toBe(false);
  });

  it("fails open when the database cannot answer", async () => {
    findUnique.mockRejectedValue(new Error("down"));
    expect(await isLiveAd("anything")).toBe(true);
  });
});

describe("isStale", () => {
  it("is true only 30+ days after an ad stopped being live", async () => {
    findUnique.mockResolvedValue(row({ status: "SOLD", updatedAt: at(31) }));
    expect(isStale((await getAdView("iphone-13-128gb"))!)).toBe(true);
    findUnique.mockResolvedValue(row({ status: "SOLD", updatedAt: at(5) }));
    expect(isStale((await getAdView("iphone-13-128gb"))!)).toBe(false);
    findUnique.mockResolvedValue(row());
    expect(isStale((await getAdView("iphone-13-128gb"))!)).toBe(false);
  });
});

describe("intlPhone", () => {
  it("turns Sri Lankan numbers into tel:/wa.me digits", () => {
    expect(intlPhone("0711000001")).toBe("94711000001");
    expect(intlPhone("071 100 0001")).toBe("94711000001");
    expect(intlPhone("+94 71 100 0001")).toBe("94711000001");
    expect(intlPhone("94711000001")).toBe("94711000001");
    expect(intlPhone("711000001")).toBe("94711000001");
  });

  it("drops anything that is not a phone number", () => {
    expect(intlPhone("12345")).toBeNull();
    expect(intlPhone("")).toBeNull();
    expect(intlPhone(null)).toBeNull();
  });

  it("is applied to business numbers stored in local format", async () => {
    findUnique.mockResolvedValue(
      row({
        businessProfile: {
          id: "b1",
          name: "T",
          slug: "t",
          isVerified: true,
          contactPhone: "0711000001",
          whatsappNumber: null,
          status: "ACTIVE",
        },
      }),
    );
    expect((await getAdView("iphone-13-128gb"))?.contact).toEqual({
      phone: "94711000001",
      whatsapp: "94711000001",
    });
  });
});
