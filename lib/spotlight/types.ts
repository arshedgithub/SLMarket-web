/*
 * A spotlight slot in the ad lists: an admin image campaign, or a premium
 * business. Plain JSON, so the API can hand it to the client as is.
 */

export type SpotlightKind = "image" | "business";

export type SpotlightImage = {
  grid: string; // 5:4, two grid columns (laptop, desktop)
  wide: string; // 2:1, full-row banner (mobile, tablet)
  list: string; // 5:1, list view row
  // CSS object-position for images Cloudinary did not crop (site paths).
  position: string;
};

export type SpotlightBusiness = {
  name: string;
  slug: string;
  tagline: string;
  verified: boolean;
  premium: boolean;
  category: string;
  city: string;
  cover: string | null;
  logo: string | null;
  adsCount: number;
  phone: string | null; // international digits
  thumbs: { slug: string; title: string; image: string }[];
};

export type Spotlight = {
  // The stats key: "c:<campaign id>" or "b:<business id>".
  id: string;
  kind: SpotlightKind;
  // One slot per advertiser per page.
  advertiser: string;
  tier: number; // 1 highest
  pinned: boolean;
  headline: string | null;
  subline: string | null;
  ctaLabel: string;
  href: string;
  external: boolean;
  // External links show where they go ("sltelecom.lk").
  domain: string | null;
  image: SpotlightImage | null;
  altText: string | null;
  imageOnly: boolean;
  logo: string | null;
  business: SpotlightBusiness | null;
};

// A candidate before ranking: targeting and today's impressions.
export type SpotlightCandidate = Spotlight & {
  impressionsToday: number;
  targetCategory: string | null;
  targetDistrict: string | null;
  // A business's own category and district (business slots).
  categoryId: string | null;
  district: string | null;
};
