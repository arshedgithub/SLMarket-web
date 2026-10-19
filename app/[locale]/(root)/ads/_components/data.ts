/*
 * Types and configuration for the ad lists (/ads, the homepage, the ad
 * page). Ads and businesses come from the database (lib/listings/feed.ts);
 * nothing here is sample data. Demo content lives in the database, put
 * there by prisma/seed.ts.
 */

import type { BusinessHighlight } from "@/lib/business/highlights";
import type { OpeningHours, ResponseStats } from "@/lib/business/responseTime";
import {
  SRI_LANKA_DISTRICTS,
  flatCities,
} from "@/config/const/sriLankaLocations";

// Ads store the town/city a seller actually typed (e.g.
// "Rajagiriya", "Negombo"), which reads better on a card than the district
// name. The Location filter operates at district level though, so this
// resolves a listing's location up to its district for matching.
export function locationDistrict(location: string): string {
  if (SRI_LANKA_DISTRICTS.some((d) => d.name === location)) return location;
  return flatCities.find((c) => c.city === location)?.district ?? location;
}

export type Condition = "new" | "used" | "like-new" | "reconditioned" | "na";
export type SellerType = "individual" | "verified" | "shop";
// coupon: a code for money off; offer: a special offer such as "Buy 2
// get 10% off" (promotionType DISCOUNT); price-drop: a genuine drop.
export type DealTag = "coupon" | "price-drop" | "offer";

// What an ad card shows, built from a Listing row (lib/listings/feed.ts).
export type AdCard = {
  id: string;
  // The ad's page is /ad/<slug>.
  slug: string;
  // How many photos the ad has (the card's photo count).
  photos?: number;
  // Where the cover photo's subject sits (0 to 1), for object-position.
  focus?: { x: number; y: number } | null;
  // One key per seller ("b:<business id>" or "u:<user id>"), for keeping
  // one seller from crowding a page.
  sellerKey: string;
  // Structured details (Listing.attributes, listingFields keys), used to
  // rank similar ads.
  details?: Record<string, string>;
  title: string;
  categoryId: string;
  subcategoryId: string;
  location: string;
  price: number;
  priceLabel: string;
  originalPriceLabel?: string;
  image: string;
  condition: Condition;
  sellerType: SellerType;
  // The business that posted it (business ads only; private sellers'
  // names are not shown on cards).
  sellerName?: string;
  // The business page (/business/<slug>) and logo, business ads only.
  sellerSlug?: string;
  sellerLogo?: string | null;
  // The business's number, international digits, for the list view's
  // Call / WhatsApp buttons (business ads only).
  contactPhone?: string;
  featured?: boolean;
  // Paid tier above Featured. A card shows one tier badge: Premium wins.
  premium?: boolean;
  deal?: DealTag;
  // Sellers open to offers — a small muted note beside the price, never a
  // deal type (almost every classified is negotiable).
  negotiable?: boolean;
  // The actual coupon/offer text shown on cards with deal: "coupon".
  offer?: string;
  description?: string;
  // Card meta, most important first, in a fixed order per category:
  //   vehicles     fuel, transmission, year (then anything else)
  //   electronics  condition, then specs
  //   property     beds, baths, area (land: area only)
  attrs: string[];
  postedAgo: string;
  // Exact time (ISO), for "posted today" counts and recency.
  postedAt: string;
  // A buyer is lined up; others can still ask to be next.
  reserved?: boolean;
  // The seller marked it urgent (details.urgent).
  urgent?: boolean;
};

export {
  BUSINESS_HIGHLIGHTS,
  type BusinessHighlight,
} from "@/lib/business/highlights";

// A business as the lists show it (sponsored units, the featured strip,
// the homepage rail), built from its BusinessProfile row.
export type ShopCard = {
  // BusinessProfile id (the spotlight advertiser id).
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  category: string; // the category's display name
  location: string; // town, else district
  verified: boolean;
  // Paid tier ("premium" = a paid placement, labelled where shown).
  tier: "premium" | "toprated" | "verified" | "standard";
  // Reviews and response stats are not collected yet: null until they are.
  rating: number | null;
  reviews: number;
  response: ResponseStats | null;
  listings: number; // live ads
  phone: string | null; // international digits, for tel: / wa.me
  cover: string | null;
  logo: string | null;
  // The first sentence of the bio.
  tagline: string;
  highlights: BusinessHighlight[];
  hours?: OpeningHours;
  // When the business joined (ISO), for the "New" label.
  createdAt: string;
};

/*
 * ============================================================
 * FILTER OPTIONS
 *
 * Only VALUES/keys live here. Display labels are resolved at render
 * time via useTranslations("listings") so the page stays translatable
 * (messages/{locale}/listings.json), keyed by the value itself.
 * ============================================================
 */

// All 25 Sri Lankan districts (config/const/sriLankaLocations.ts is the
// single source of truth, shared with the post-ad location picker).
export const ALL_DISTRICTS: string[] = SRI_LANKA_DISTRICTS.map((d) => d.name);

// The 3 busiest districts, shown as the
// default "Popular" quick-picks in the Location filter. The search box in
// that same filter still matches against all of ALL_DISTRICTS.
export const TOP_DISTRICTS = ["Colombo", "Gampaha", "Kandy"];

export const PRICE_PRESETS = [
  { key: "under50k", min: 0, max: 50000 },
  { key: "50kTo250k", min: 50000, max: 250000 },
  { key: "250kTo1m", min: 250000, max: 1000000 },
  { key: "1mPlus", min: 1000000, max: null as number | null },
] as const;

export const CONDITION_VALUES: Condition[] = [
  "na",
  "new",
  "used",
  "like-new",
  "reconditioned",
];

export const SELLER_VALUES: (SellerType | "all")[] = [
  "all",
  "individual",
  "verified",
  "shop",
];

export const DEAL_VALUES: DealTag[] = ["price-drop", "coupon", "offer"];

// "newest" is "Featured first, then newest" (featured ads are pinned).
export const SORT_VALUES = [
  "newest",
  "price-asc",
  "price-desc",
  "nearest",
] as const;

export type SortValue = (typeof SORT_VALUES)[number];

/*
 * ============================================================
 * CATEGORY FILTERS
 *
 * Each field is a listingFields key (config/const/listingFields.ts), matched
 * against the ad's structured details (adQuery.ts matchesField):
 *   exact   the detail equals the option (case-insensitive)
 *   range   numeric: "2020 to 2023", "Before 2015", "4+", "Under 50,000 km"
 *   contains  the detail contains the option ("512GB" matches "512GB SSD")
 *   text    the detail contains what was typed
 * Labels: categoryFields.<categoryId>.<key> in messages/<locale>/listings.json.
 * ============================================================
 */

export type CategoryFieldDef = {
  key: string;
  match: "exact" | "contains" | "range" | "text";
  options: string[]; // empty for "text"
};

export const CATEGORY_FILTER_FIELDS: Record<string, CategoryFieldDef[]> = {
  vehicles: [
    {
      key: "brand",
      match: "exact",
      options: [
        "Toyota",
        "Honda",
        "Suzuki",
        "Nissan",
        "Mitsubishi",
        "Bajaj",
        "Yamaha",
        "TVS",
      ],
    },
    { key: "model", match: "text", options: [] },
    {
      key: "year",
      match: "range",
      options: ["2020 or newer", "2015 to 2019", "2010 to 2014", "Before 2010"],
    },
    {
      key: "mileage",
      match: "range",
      options: ["Under 50,000 km", "50,000 to 100,000 km", "Over 100,000 km"],
    },
    {
      key: "fuelType",
      match: "exact",
      options: ["Petrol", "Diesel", "Hybrid", "Electric"],
    },
    { key: "transmission", match: "exact", options: ["Automatic", "Manual"] },
  ],
  property: [
    { key: "listingType", match: "exact", options: ["Sell", "Rent out"] },
    {
      key: "propertyType",
      match: "exact",
      options: ["House", "Apartment", "Land", "Commercial", "Room", "Annex"],
    },
    { key: "bedrooms", match: "range", options: ["1", "2", "3", "4+"] },
    {
      key: "furnishing",
      match: "exact",
      options: ["Furnished", "Semi-furnished", "Unfurnished"],
    },
  ],
  electronics: [
    {
      key: "deviceType",
      match: "exact",
      options: ["Phone", "Laptop", "Tablet", "Camera", "Audio", "TV"],
    },
    {
      key: "brand",
      match: "exact",
      options: ["Apple", "Samsung", "Dell", "HP", "Lenovo", "Sony", "Canon"],
    },
    {
      key: "storage",
      match: "contains",
      options: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    },
  ],
  jobs: [
    {
      key: "employmentType",
      match: "exact",
      options: ["Full-time", "Part-time", "Contract", "Internship"],
    },
    {
      key: "workMode",
      match: "exact",
      options: ["On-site", "Hybrid", "Remote"],
    },
  ],
};
