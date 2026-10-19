import { describe, expect, it } from "vitest";
import { needsReview, parseAdPayload, type AdPayload } from "./adPayload";
import { listingToDraft } from "./editDraft";

const valid: AdPayload = {
  categoryId: "electronics",
  subcategoryId: "computers",
  title: "Dell XPS 13 Laptop",
  description: "Lightly used, excellent condition, with charger.",
  attributes: { condition: "Used", brand: "Dell" },
  images: ["/a.webp"],
  pricingType: "fixed",
  price: "299000",
  negotiable: true,
  city: "Colombo",
  district: "Colombo",
};

describe("parseAdPayload", () => {
  it("maps a valid payload to listing columns", () => {
    const r = parseAdPayload(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fields).toMatchObject({
      title: "Dell XPS 13 Laptop",
      pricingType: "FIXED",
      price: 299000,
      negotiable: true,
      promotionType: "NONE",
      locationType: "SINGLE",
      showContactPhone: true,
      allowWhatsapp: true,
    });
  });

  it("reports each problem by field", () => {
    const r = parseAdPayload({
      ...valid,
      categoryId: "nope",
      title: "Short",
      images: [],
      city: "",
      price: "0",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual([
      "category",
      "city",
      "images",
      "price",
      "title",
    ]);
  });

  it("drops the price for free and contact-for-price ads", () => {
    for (const pricingType of ["free", "contact"] as const) {
      const r = parseAdPayload({ ...valid, pricingType, price: "" });
      expect(r.ok && r.fields.price).toBeNull();
    }
  });
});

describe("needsReview", () => {
  const before = parseAdPayload(valid);
  if (!before.ok) throw new Error("fixture");

  it("is false for price and contact changes", () => {
    const after = parseAdPayload({
      ...valid,
      price: "279000",
      whatsapp: false,
    });
    expect(after.ok && needsReview(before.fields, after.fields)).toBe(false);
  });

  it("is true when the ad itself changes", () => {
    for (const change of [
      { title: "Dell XPS 15 Laptop" },
      { images: ["/b.webp"] },
      { subcategoryId: "laptops" },
    ]) {
      const after = parseAdPayload({ ...valid, ...change });
      expect(after.ok && needsReview(before.fields, after.fields)).toBe(true);
    }
  });
});

describe("listingToDraft (editing)", () => {
  const listing = {
    title: "Dell XPS 13 Laptop",
    description: "Lightly used, excellent condition, with charger.",
    categoryId: "electronics",
    subcategoryId: "computers",
    attributes: { highlights: ["i7"], condition: "Used", brand: "Dell" },
    images: ["/a.webp", "/b.webp"],
    videoUrl: null,
    pricingType: "STARTING_FROM" as const,
    price: 299000 as unknown as never,
    negotiable: true,
    promotionType: "COUPON" as const,
    promotionDetail: "10% off",
    locationType: "SINGLE" as const,
    district: "Colombo",
    city: "Colombo",
    area: null,
    deliveryAvailable: true,
    islandwideDelivery: false,
    businessProfileId: "biz1",
    contactPhone: null,
    showContactPhone: true,
    allowWhatsapp: false,
  };

  it("fills the flow's draft from the listing", () => {
    const d = listingToDraft(listing);
    expect(d).toMatchObject({
      pricingType: "startingFrom",
      price: "299000",
      promotionType: "coupon",
      locationType: "single",
      sellerMode: "shop",
      shopId: "biz1",
      whatsapp: false,
      policyAccepted: true,
    });
    expect(d.attributes).toEqual({ condition: "Used", brand: "Dell" }); // highlights kept out
  });

  it("round-trips through the payload check unchanged", () => {
    const r = parseAdPayload(listingToDraft(listing) as unknown as AdPayload);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fields).toMatchObject({
      pricingType: "STARTING_FROM",
      price: 299000,
      promotionType: "COUPON",
      promotionDetail: "10% off",
      allowWhatsapp: false,
      images: ["/a.webp", "/b.webp"],
    });
  });
});
