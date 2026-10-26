import { describe, expect, it } from "vitest";
import { campaignSchema } from "./campaignPayload";

const base = {
  kind: "IMAGE",
  status: "LIVE",
  businessSlug: null,
  advertiser: null,
  tier: 2,
  pinned: false,
  headline: "Eid deals from Colombo shops",
  subline: "Up to 30% off verified sellers",
  ctaLabel: "View deals",
  destType: "LIST",
  destValue: "/ads/fashion?location=Colombo",
  imageId: "slmarket/spotlight/admin/eid",
  imageWidth: 3000,
  imageHeight: 1500,
  focalX: 0.5,
  focalY: 0.4,
  altText: "Shoppers in a Colombo market",
  imageOnly: false,
  logoId: null,
  cropOverrides: null,
  targetCategory: "fashion",
  targetDistrict: "Colombo",
  startsAt: "2026-10-20T00:00:00.000Z",
  endsAt: "2026-10-30T00:00:00.000Z",
};

const errorFor = (patch: Record<string, unknown>) => {
  const r = campaignSchema.safeParse({ ...base, ...patch });
  return r.success ? null : r.error.issues[0].path[0];
};

describe("spotlight campaign rules", () => {
  it("accepts a complete image campaign", () => {
    expect(campaignSchema.safeParse(base).success).toBe(true);
  });

  it("keeps the headline to 6 words", () => {
    expect(errorFor({ headline: "One two three four five six seven" })).toBe(
      "headline",
    );
  });

  it("needs alt text and a big enough master image", () => {
    expect(errorFor({ altText: "" })).toBe("altText");
    expect(errorFor({ imageWidth: 1200 })).toBe("imageId");
  });

  it("allows image-only artwork without a headline or button", () => {
    expect(
      errorFor({ imageOnly: true, headline: "", ctaLabel: "" }),
    ).toBeNull();
    expect(errorFor({ headline: "" })).toBe("headline");
  });

  it("only links to https sites, never through a shortener", () => {
    expect(
      errorFor({ destType: "EXTERNAL", destValue: "http://example.lk" }),
    ).toBe("destValue");
    expect(
      errorFor({ destType: "EXTERNAL", destValue: "https://bit.ly/x" }),
    ).toBe("destValue");
    expect(
      errorFor({
        destType: "EXTERNAL",
        destValue: "https://sltelecom.lk/offers",
      }),
    ).toBeNull();
  });

  it("checks targeting and dates", () => {
    expect(errorFor({ targetDistrict: "Atlantis" })).toBe("targetDistrict");
    expect(errorFor({ endsAt: "2026-10-01T00:00:00.000Z" })).toBe("endsAt");
    expect(errorFor({ status: "SCHEDULED", startsAt: null })).toBe("startsAt");
  });

  it("needs a business for a business campaign", () => {
    expect(errorFor({ kind: "BUSINESS", businessSlug: null })).toBe(
      "businessSlug",
    );
  });
});
