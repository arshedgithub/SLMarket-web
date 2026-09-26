/*
 * Sample / fallback data for the All Listings page. Placeholder data that
 * gives the design a complete visual state, in the same spirit as the
 * homepage's recommendedListings/featuredShops. Swap for a real database
 * query once the schema is extended for the general marketplace.
 */

import type { OpeningHours } from "@/lib/business/responseTime";
import {
  SRI_LANKA_DISTRICTS,
  flatCities,
} from "@/config/const/sriLankaLocations";

const CAT_IMG = "/images/marketplace/categories";

// Sample listings store the town/city a seller actually typed (e.g.
// "Rajagiriya", "Negombo"), which reads better on a card than the district
// name. The Location filter operates at district level though, so this
// resolves a listing's location up to its district for matching.
export function locationDistrict(location: string): string {
  if (SRI_LANKA_DISTRICTS.some((d) => d.name === location)) return location;
  return flatCities.find((c) => c.city === location)?.district ?? location;
}

export type Condition = "new" | "used" | "like-new" | "reconditioned" | "na";
export type SellerType = "individual" | "verified" | "shop";
export type DealTag = "coupon" | "price-drop";

export type SampleListing = {
  id: string;
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
  // Matches a sampleShops name — only set where the sample data actually
  // ties a listing to a business, so the sponsored-slot picker can tell
  // "already visible as a seller nearby" from "seller type unspecified".
  sellerName?: string;
  featured?: boolean;
  deal?: DealTag;
  // Sellers open to offers — a small muted note beside the price, never a
  // deal type (almost every classified is negotiable).
  negotiable?: boolean;
  // The actual coupon/offer text shown on cards with deal: "coupon".
  offer?: string;
  description?: string;
  attrs: string[];
  postedAgo: string;
};

const baseListings: SampleListing[] = [
  {
    id: "l1",
    title: "Toyota Aqua 2017",
    categoryId: "vehicles",
    subcategoryId: "cars",
    location: "Colombo",
    price: 6950000,
    priceLabel: "Rs. 6,950,000",
    image: `${CAT_IMG}/vehicles.webp`,
    condition: "used",
    sellerType: "shop",
    sellerName: "AutoHub LK",
    featured: true,
    description:
      "Well maintained Toyota Aqua. Good condition, smooth drive, fuel efficient. First owner.",
    attrs: ["Hybrid", "Automatic", "2017"],
    postedAgo: "5 hours ago",
  },
  {
    id: "l2",
    title: "Modern House for Rent",
    categoryId: "property",
    subcategoryId: "houses-rent",
    location: "Rajagiriya",
    price: 250000,
    priceLabel: "Rs. 250,000 / month",
    image: `${CAT_IMG}/property.webp`,
    condition: "na",
    sellerType: "shop",
    sellerName: "Prime Estates",
    negotiable: true,
    description:
      "Beautiful modern house for rent in a quiet residential area. Spacious living area, parking available.",
    attrs: ["3 Beds", "3 Baths", "2,500 sq.ft"],
    postedAgo: "1 day ago",
  },
  {
    id: "l3",
    title: "iPhone 13 128GB",
    categoryId: "electronics",
    subcategoryId: "mobile-phones",
    location: "Colombo",
    price: 175000,
    priceLabel: "Rs. 175,000",
    originalPriceLabel: "Rs. 195,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "like-new",
    sellerType: "shop",
    sellerName: "TechZone Sri Lanka",
    deal: "price-drop",
    description:
      "Excellent condition. No scratches. With original charger and box.",
    attrs: ["Like New", "128GB", "Original"],
    postedAgo: "2 hours ago",
  },
  {
    id: "l4",
    title: "Sofa Set (3+1+1)",
    categoryId: "home-garden",
    subcategoryId: "furniture",
    location: "Gampaha",
    price: 85000,
    priceLabel: "Rs. 85,000",
    image: `${CAT_IMG}/home-garden.webp`,
    condition: "used",
    sellerType: "individual",
    attrs: ["Used", "Good Condition"],
    postedAgo: "3 hours ago",
  },
  {
    id: "l5",
    title: "Dell XPS 13 Laptop",
    categoryId: "electronics",
    subcategoryId: "computers",
    location: "Colombo",
    price: 299000,
    priceLabel: "Rs. 299,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "used",
    sellerType: "shop",
    sellerName: "TechZone Sri Lanka",
    deal: "coupon",
    featured: true,
    offer: "10% off with code WELCOME10",
    attrs: ["i7", "16GB", "512GB SSD"],
    postedAgo: "4 hours ago",
  },
  {
    id: "l6",
    title: "Yamaha FZ-S V3",
    categoryId: "vehicles",
    subcategoryId: "motorbikes",
    location: "Kandy",
    price: 780000,
    priceLabel: "Rs. 780,000",
    image: `${CAT_IMG}/vehicles.webp`,
    condition: "used",
    sellerType: "individual",
    attrs: ["2019", "150cc", "32,000 km"],
    postedAgo: "6 hours ago",
  },
  {
    id: "l7",
    title: "Dining Table Set",
    categoryId: "home-garden",
    subcategoryId: "furniture",
    location: "Negombo",
    price: 120000,
    priceLabel: "Rs. 120,000",
    image: `${CAT_IMG}/home-garden.webp`,
    condition: "used",
    sellerType: "individual",
    attrs: ["6 Chairs", "Solid Wood"],
    postedAgo: "1 day ago",
  },
  {
    id: "l8",
    title: "Canon EOS 250D",
    categoryId: "electronics",
    subcategoryId: "cameras",
    location: "Colombo",
    price: 185000,
    priceLabel: "Rs. 185,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "like-new",
    sellerType: "shop",
    sellerName: "ElectroMart LK",
    negotiable: true,
    attrs: ["24.1MP", "With Lens", "Like New"],
    postedAgo: "1 day ago",
  },
  {
    id: "l9",
    title: "3BR House, Negombo",
    categoryId: "property",
    subcategoryId: "houses-sale",
    location: "Negombo",
    price: 18500000,
    priceLabel: "Rs. 18.5M",
    image: `${CAT_IMG}/property.webp`,
    condition: "used",
    sellerType: "shop",
    sellerName: "Prime Estates",
    featured: true,
    description: "Well built 3 bedroom house close to the beach and main road.",
    attrs: ["House", "3 Beds"],
    postedAgo: "2 days ago",
  },
  {
    id: "l10",
    title: "Accountant (Full-time)",
    categoryId: "jobs",
    subcategoryId: "full-time",
    location: "Colombo",
    price: 100000,
    priceLabel: "Rs. 80,000 to 120,000",
    image: `${CAT_IMG}/jobs.webp`,
    condition: "na",
    sellerType: "shop",
    sellerName: "CareerLink",
    description:
      "We are looking for a qualified Accountant to join our team. Good knowledge of bookkeeping.",
    attrs: ["Full-time", "Colombo"],
    postedAgo: "3 days ago",
  },
  {
    id: "l11",
    title: "10 Perches Land",
    categoryId: "property",
    subcategoryId: "land-sale",
    location: "Gampaha",
    price: 2800000,
    priceLabel: "Rs. 2.8M",
    image: `${CAT_IMG}/property.webp`,
    condition: "na",
    sellerType: "individual",
    attrs: ["Land", "10 Perches"],
    postedAgo: "4 days ago",
  },
  {
    id: "l12",
    title: "Designer Party Dress",
    categoryId: "fashion",
    subcategoryId: "womens-clothing",
    location: "Colombo",
    price: 6500,
    priceLabel: "Rs. 6,500",
    image: `${CAT_IMG}/fashion.webp`,
    condition: "new",
    sellerType: "shop",
    sellerName: "Glamour.lk",
    deal: "coupon",
    description: "Brand new designer party dress, limited stock.",
    offer: "15% off with code STYLE15",
    attrs: ["Women", "Size M"],
    postedAgo: "5 hours ago",
  },
  {
    id: "l13",
    title: "Organic Spice Pack",
    categoryId: "food",
    subcategoryId: "spices",
    location: "Matale",
    price: 1200,
    priceLabel: "Rs. 1,200",
    image: `${CAT_IMG}/food.webp`,
    condition: "new",
    sellerType: "individual",
    attrs: ["Organic", "1kg"],
    postedAgo: "6 hours ago",
  },
  {
    id: "l14",
    title: "Home Deep Cleaning",
    categoryId: "services",
    subcategoryId: "cleaning",
    location: "Colombo",
    price: 4500,
    priceLabel: "Rs. 4,500",
    image: `${CAT_IMG}/services.webp`,
    condition: "na",
    sellerType: "shop",
    sellerName: "FixIt Services",
    description:
      "Same day deep cleaning for homes and apartments, fully insured team.",
    attrs: ["Same Day", "Insured"],
    postedAgo: "1 day ago",
  },
  {
    id: "l15",
    title: "Mountain Bike, 21-Speed",
    categoryId: "hobbies",
    subcategoryId: "cycling",
    location: "Nuwara Eliya",
    price: 32000,
    priceLabel: "Rs. 32,000",
    image: `${CAT_IMG}/hobbies.webp`,
    condition: "used",
    sellerType: "individual",
    negotiable: true,
    attrs: ["21-Speed", "Good Condition"],
    postedAgo: "2 days ago",
  },
  {
    id: "l16",
    title: "Labrador Puppies",
    categoryId: "animals-pets",
    subcategoryId: "dogs",
    location: "Kurunegala",
    price: 15000,
    priceLabel: "Rs. 15,000",
    image: `${CAT_IMG}/animals.webp`,
    condition: "na",
    sellerType: "individual",
    featured: true,
    attrs: ["Vaccinated", "2 Months"],
    postedAgo: "3 hours ago",
  },
  {
    id: "l17",
    title: "Tuition, Physical Science",
    categoryId: "education",
    subcategoryId: "tuition-classes",
    location: "Kandy",
    price: 3000,
    priceLabel: "Rs. 3,000 / month",
    image: `${CAT_IMG}/education.webp`,
    condition: "na",
    sellerType: "individual",
    attrs: ["Grade 10 to 11", "Online"],
    postedAgo: "1 day ago",
  },
  {
    id: "l18",
    title: "Facial & Skincare Package",
    categoryId: "health-beauty",
    subcategoryId: "skincare",
    location: "Colombo",
    price: 5000,
    priceLabel: "Rs. 5,000",
    image: `${CAT_IMG}/health-beauty.webp`,
    condition: "na",
    sellerType: "shop",
    deal: "coupon",
    offer: "Free skin check with code GLOW",
    attrs: ["60 min", "Home Visit"],
    postedAgo: "4 hours ago",
  },
  {
    id: "l19",
    title: "Honda Vezel 2016",
    categoryId: "vehicles",
    subcategoryId: "cars",
    location: "Galle",
    price: 6850000,
    priceLabel: "Rs. 6,850,000",
    image: `${CAT_IMG}/vehicles.webp`,
    condition: "used",
    sellerType: "individual",
    description: "Hybrid SUV in very good condition, regularly serviced.",
    attrs: ["2016", "Hybrid", "Automatic"],
    postedAgo: "2 days ago",
  },
  {
    id: "l20",
    title: "Bajaj Three Wheeler",
    categoryId: "vehicles",
    subcategoryId: "three-wheelers",
    location: "Gampaha",
    price: 1150000,
    priceLabel: "Rs. 1,150,000",
    image: `${CAT_IMG}/vehicles.webp`,
    condition: "used",
    sellerType: "individual",
    attrs: ["2019", "Petrol", "Good Condition"],
    postedAgo: "1 day ago",
  },
  {
    id: "l21",
    title: "Apartment for Rent",
    categoryId: "property",
    subcategoryId: "apartments",
    location: "Colombo",
    price: 120000,
    priceLabel: "Rs. 120,000 / month",
    image: `${CAT_IMG}/property.webp`,
    condition: "na",
    sellerType: "shop",
    sellerName: "Prime Estates",
    description: "Sea view apartment with parking and 24h security.",
    attrs: ["2 Beds", "Sea View", "Furnished"],
    postedAgo: "2 days ago",
  },
  {
    id: "l22",
    title: "MacBook Air M1",
    categoryId: "electronics",
    subcategoryId: "computers",
    location: "Colombo",
    price: 285000,
    priceLabel: "Rs. 285,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "like-new",
    sellerType: "shop",
    sellerName: "Digital Hub",
    description: "8GB RAM, 256GB SSD, battery health 94%.",
    attrs: ["8GB RAM", "256GB SSD", "Like New"],
    postedAgo: "3 hours ago",
  },
  {
    id: "l23",
    title: "iPhone 14 128GB",
    categoryId: "electronics",
    subcategoryId: "mobile-phones",
    location: "Kandy",
    price: 175000,
    priceLabel: "Rs. 175,000",
    originalPriceLabel: "Rs. 195,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "like-new",
    sellerType: "shop",
    sellerName: "Digital Hub",
    deal: "price-drop",
    attrs: ["128GB", "Like New", "Original"],
    postedAgo: "6 hours ago",
  },
  {
    id: "l24",
    title: "AirPods Pro 2",
    categoryId: "electronics",
    subcategoryId: "audio",
    location: "Kandy",
    price: 62000,
    priceLabel: "Rs. 62,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "new",
    sellerType: "shop",
    sellerName: "Digital Hub",
    attrs: ["USB-C", "Sealed"],
    postedAgo: "1 day ago",
  },
];

// Sample data only: repeats the base ads so the page-of-28 pagination, the
// two sponsored slots per page and the featured rhythm can be exercised.
// Replaced wholesale by the real query.
export const sampleListings: SampleListing[] = [
  ...baseListings,
  ...[2, 3].flatMap((copy) =>
    baseListings.map((l) => ({
      ...l,
      id: `${l.id}-${copy}`,
      postedAgo: copy === 2 ? "5 days ago" : "1 week ago",
    })),
  ),
];

/*
 * ============================================================
 * FEATURED SHOPS (contextual to the selected category)
 * ============================================================
 */

// The fixed list a business picks its highlights from (never free text).
export const BUSINESS_HIGHLIGHTS = [
  "delivery",
  "warranty",
  "easyPayments",
  "cod",
  "returns",
  "inspection",
  "leasing",
  "consultation",
  "siteVisits",
  "assembly",
  "freshness",
] as const;
export type BusinessHighlight = (typeof BUSINESS_HIGHLIGHTS)[number];

export type SampleShop = {
  name: string;
  categoryId: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  phone: string; // international format, no + (wa.me / tel)
  listings: string;
  tier: "toprated" | "premium" | "verified";
  cover: string;
  highlights: BusinessHighlight[];
  // Last-30-days measured response figures (business_response_stats).
  response: { conversations: number; medianMinutes: number; replyRate: number };
  // Own opening hours; the 8am-8pm Mon-Sat default applies when absent.
  hours?: OpeningHours;
};

export const sampleShops: SampleShop[] = [
  {
    name: "TechZone Sri Lanka",
    categoryId: "electronics",
    category: "Electronics",
    location: "Colombo",
    rating: 4.8,
    reviews: 56,
    phone: "94711000001",
    listings: "120+",
    tier: "verified",
    cover: `${CAT_IMG}/electronics.webp`,
    highlights: ["delivery", "warranty", "easyPayments"],
    response: { conversations: 64, medianMinutes: 42, replyRate: 0.94 },
  },
  {
    name: "AutoHub LK",
    categoryId: "vehicles",
    category: "Vehicles",
    location: "Gampaha",
    rating: 4.6,
    reviews: 41,
    phone: "94711000002",
    listings: "85+",
    tier: "toprated",
    cover: `${CAT_IMG}/vehicles.webp`,
    highlights: ["leasing", "inspection"],
    response: { conversations: 45, medianMinutes: 130, replyRate: 0.88 },
  },
  {
    name: "HomeStyle",
    categoryId: "home-garden",
    category: "Home & Garden",
    location: "Kandy",
    rating: 4.7,
    reviews: 33,
    phone: "94711000003",
    listings: "96+",
    tier: "premium",
    cover: `${CAT_IMG}/home-garden.webp`,
    highlights: ["delivery", "assembly"],
    response: { conversations: 33, medianMinutes: 55, replyRate: 0.9 },
  },
  {
    name: "Glamour.lk",
    categoryId: "fashion",
    category: "Fashion",
    location: "Colombo",
    rating: 4.8,
    reviews: 62,
    phone: "94711000004",
    listings: "150+",
    tier: "verified",
    cover: `${CAT_IMG}/fashion.webp`,
    highlights: ["cod", "returns"],
    response: { conversations: 58, medianMinutes: 25, replyRate: 0.96 },
  },
  {
    name: "PetCare Lanka",
    categoryId: "animals-pets",
    category: "Animals & Pets",
    location: "Negombo",
    rating: 4.6,
    reviews: 29,
    phone: "94711000005",
    listings: "70+",
    tier: "toprated",
    cover: `${CAT_IMG}/animals.webp`,
    highlights: ["delivery"],
    response: { conversations: 8, medianMinutes: 30, replyRate: 1.0 },
  },
  {
    name: "Prime Estates",
    categoryId: "property",
    category: "Property",
    location: "Colombo",
    rating: 4.7,
    reviews: 24,
    phone: "94711000006",
    listings: "60+",
    tier: "premium",
    cover: `${CAT_IMG}/property.webp`,
    highlights: ["consultation", "siteVisits"],
    response: { conversations: 40, medianMinutes: 300, replyRate: 0.85 },
  },
  {
    name: "FixIt Services",
    categoryId: "services",
    category: "Services",
    location: "Colombo",
    rating: 4.6,
    reviews: 47,
    phone: "94711000007",
    listings: "110+",
    tier: "premium",
    cover: `${CAT_IMG}/services.webp`,
    highlights: ["warranty"],
    response: { conversations: 50, medianMinutes: 20, replyRate: 0.97 },
  },
  {
    name: "CareerLink",
    categoryId: "jobs",
    category: "Jobs",
    location: "Colombo",
    rating: 4.9,
    reviews: 18,
    phone: "94711000008",
    listings: "45+",
    tier: "verified",
    cover: `${CAT_IMG}/jobs.webp`,
    highlights: [],
    response: { conversations: 18, medianMinutes: 90, replyRate: 0.85 },
  },
  {
    name: "Digital Hub",
    categoryId: "electronics",
    category: "Electronics",
    location: "Kandy",
    rating: 4.6,
    reviews: 38,
    phone: "94711000009",
    listings: "86",
    tier: "verified",
    cover: `${CAT_IMG}/electronics.webp`,
    highlights: ["delivery", "warranty", "easyPayments"],
    response: { conversations: 38, medianMinutes: 35, replyRate: 0.92 },
  },
  {
    name: "ElectroMart LK",
    categoryId: "electronics",
    category: "Electronics",
    location: "Gampaha",
    rating: 4.5,
    reviews: 27,
    phone: "94711000010",
    listings: "64",
    tier: "verified",
    cover: `${CAT_IMG}/electronics.webp`,
    highlights: ["delivery", "cod"],
    response: { conversations: 6, medianMinutes: 20, replyRate: 1.0 },
  },
  {
    name: "Prime Cars",
    categoryId: "vehicles",
    category: "Vehicles",
    location: "Kandy",
    rating: 4.6,
    reviews: 28,
    phone: "94711000011",
    listings: "86",
    tier: "premium",
    cover: `${CAT_IMG}/vehicles.webp`,
    highlights: ["leasing", "inspection"],
    response: { conversations: 28, medianMinutes: 45, replyRate: 0.7 },
  },
];

/*
 * ============================================================
 * FILTER OPTIONS
 *
 * Only VALUES/keys live here. Display labels are resolved at render
 * time via useTranslations("listings") so the page stays translatable
 * (messages/{locale}/listings.json), keyed by the value itself.
 * ============================================================
 */

export const POPULAR_SEARCHES = [
  { key: "toyotaAqua", href: "/ads?q=Toyota+Aqua" },
  { key: "houseForRent", href: "/ads?q=house+for+rent" },
  { key: "iphone", href: "/ads?q=iPhone" },
  { key: "partTimeJobs", href: "/ads/jobs?q=part-time" },
] as const;

// All 25 Sri Lankan districts (config/const/sriLankaLocations.ts is the
// single source of truth, shared with the post-ad location picker).
export const ALL_DISTRICTS: string[] = SRI_LANKA_DISTRICTS.map((d) => d.name);

// The 3 districts most sample listings are posted from, shown as the
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

export const DEAL_VALUES: DealTag[] = ["coupon", "price-drop"];

export const SORT_VALUES = ["newest", "price-asc", "price-desc"] as const;

export type SortValue = (typeof SORT_VALUES)[number];

/*
 * ============================================================
 * CATEGORY-SPECIFIC "MORE FILTERS" FIELDS
 *
 * Field labels are translated via categoryFields.<categoryId>.<key>.
 * The option values themselves (brand names, years, ...) are sample
 * facet data for the demo dataset and stay as-is, same as the sample
 * listings' own attrs.
 * ============================================================
 */

export type CategoryFieldDef = {
  key: string;
  options: string[];
};

export const CATEGORY_FILTER_FIELDS: Record<string, CategoryFieldDef[]> = {
  vehicles: [
    {
      key: "brand",
      options: ["Toyota", "Honda", "Suzuki", "Nissan", "Yamaha"],
    },
    {
      key: "year",
      options: ["2024", "2020 to 2023", "2015 to 2019", "Before 2015"],
    },
    { key: "fuel", options: ["Petrol", "Diesel", "Hybrid", "Electric"] },
    { key: "transmission", options: ["Automatic", "Manual"] },
  ],
  property: [
    {
      key: "propertyType",
      options: ["House", "Apartment", "Land", "Commercial"],
    },
    { key: "bedrooms", options: ["1", "2", "3", "4+"] },
    { key: "bathrooms", options: ["1", "2", "3+"] },
    {
      key: "furnished",
      options: ["Furnished", "Semi-furnished", "Unfurnished"],
    },
  ],
  electronics: [
    { key: "brand", options: ["Apple", "Samsung", "Dell", "HP", "Sony"] },
    { key: "storage", options: ["64GB", "128GB", "256GB", "512GB+"] },
    { key: "warranty", options: ["Under Warranty", "No Warranty"] },
  ],
  jobs: [
    {
      key: "jobType",
      options: ["Full-time", "Part-time", "Internship", "Remote"],
    },
    {
      key: "experience",
      options: ["Entry Level", "1 to 3 Years", "3 to 5 Years", "5+ Years"],
    },
  ],
};

/*
 * ============================================================
 * CATEGORY ROW COUNTS
 *
 * Sample marketplace-scale totals (the visible sampleListings array only
 * has a handful of items — nowhere near enough to make a category chip
 * row look real). Same spirit as ListingsExperience's own
 * BASE_TOTAL_LISTINGS. Swap for a real `groupBy` count once /ads reads
 * from the database instead of this file.
 * ============================================================
 */

export const CATEGORY_LISTING_COUNTS: Record<string, number> = {
  vehicles: 4320,
  property: 3890,
  electronics: 5120,
  "home-garden": 2410,
  fashion: 2980,
  jobs: 1540,
  services: 1860,
  food: 1120,
  agriculture: 980,
  education: 720,
  "animals-pets": 640,
  "health-beauty": 130,
  hobbies: 110,
  other: 56,
};

// Deterministic split of a category's total across its subcategories —
// stable across renders (and server/client) without hand-authoring a
// count for every one of the ~100 subcategories.
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function subcategoryListingCount(
  categoryId: string,
  subcategoryId: string,
  siblingCount: number,
): number {
  const total = CATEGORY_LISTING_COUNTS[categoryId] ?? 0;
  if (siblingCount <= 0) return 0;
  const fairShare = total / siblingCount;
  // +/- 40% of the fair share, seeded by the id so it's the same number
  // every time this subcategory renders.
  const weight =
    0.6 + (hashString(`${categoryId}/${subcategoryId}`) % 81) / 100;
  return Math.max(1, Math.round(fairShare * weight));
}
