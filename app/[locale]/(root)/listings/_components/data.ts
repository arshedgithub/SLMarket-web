/*
 * Sample / fallback data for the All Listings page. Placeholder data that
 * gives the design a complete visual state, in the same spirit as the
 * homepage's recommendedListings/featuredShops. Swap for a real database
 * query once the schema is extended for the general marketplace.
 */

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
export type DealTag = "coupon" | "price-drop" | "negotiable";

export type SampleListing = {
  id: string;
  title: string;
  categoryId: string;
  location: string;
  price: number;
  priceLabel: string;
  originalPriceLabel?: string;
  image: string;
  condition: Condition;
  sellerType: SellerType;
  featured?: boolean;
  deal?: DealTag;
  attrs: string[];
  postedAgo: string;
};

export const sampleListings: SampleListing[] = [
  {
    id: "l1",
    title: "Toyota Aqua 2017",
    categoryId: "vehicles",
    location: "Colombo",
    price: 6950000,
    priceLabel: "Rs. 6,950,000",
    image: `${CAT_IMG}/vehicles.webp`,
    condition: "used",
    sellerType: "individual",
    featured: true,
    attrs: ["Hybrid", "Automatic", "2017"],
    postedAgo: "5 hours ago",
  },
  {
    id: "l2",
    title: "Modern House for Rent",
    categoryId: "property",
    location: "Rajagiriya",
    price: 250000,
    priceLabel: "Rs. 250,000 / month",
    image: `${CAT_IMG}/property.webp`,
    condition: "na",
    sellerType: "individual",
    deal: "negotiable",
    attrs: ["3 Beds", "3 Baths", "2,500 sq.ft"],
    postedAgo: "1 day ago",
  },
  {
    id: "l3",
    title: "iPhone 13 128GB",
    categoryId: "electronics",
    location: "Colombo",
    price: 175000,
    priceLabel: "Rs. 175,000",
    originalPriceLabel: "Rs. 195,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "like-new",
    sellerType: "shop",
    deal: "price-drop",
    attrs: ["Like New", "128GB", "Original"],
    postedAgo: "2 hours ago",
  },
  {
    id: "l4",
    title: "Sofa Set (3+1+1)",
    categoryId: "home-garden",
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
    location: "Colombo",
    price: 299000,
    priceLabel: "Rs. 299,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "used",
    sellerType: "shop",
    deal: "coupon",
    featured: true,
    attrs: ["i7", "16GB", "512GB SSD"],
    postedAgo: "4 hours ago",
  },
  {
    id: "l6",
    title: "Yamaha FZ-S V3",
    categoryId: "vehicles",
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
    location: "Colombo",
    price: 185000,
    priceLabel: "Rs. 185,000",
    image: `${CAT_IMG}/electronics.webp`,
    condition: "like-new",
    sellerType: "individual",
    deal: "negotiable",
    attrs: ["24.1MP", "With Lens", "Like New"],
    postedAgo: "1 day ago",
  },
  {
    id: "l9",
    title: "3BR House, Negombo",
    categoryId: "property",
    location: "Negombo",
    price: 18500000,
    priceLabel: "Rs. 18.5M",
    image: `${CAT_IMG}/property.webp`,
    condition: "used",
    sellerType: "shop",
    featured: true,
    attrs: ["House", "3 Beds"],
    postedAgo: "2 days ago",
  },
  {
    id: "l10",
    title: "Accountant (Full-time)",
    categoryId: "jobs",
    location: "Colombo",
    price: 100000,
    priceLabel: "Rs. 80,000 to 120,000",
    image: `${CAT_IMG}/jobs.webp`,
    condition: "na",
    sellerType: "shop",
    attrs: ["Full-time", "Colombo"],
    postedAgo: "3 days ago",
  },
  {
    id: "l11",
    title: "10 Perches Land",
    categoryId: "property",
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
    location: "Colombo",
    price: 6500,
    priceLabel: "Rs. 6,500",
    image: `${CAT_IMG}/fashion.webp`,
    condition: "new",
    sellerType: "shop",
    deal: "coupon",
    attrs: ["Women", "Size M"],
    postedAgo: "5 hours ago",
  },
  {
    id: "l13",
    title: "Organic Spice Pack",
    categoryId: "food",
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
    location: "Colombo",
    price: 4500,
    priceLabel: "Rs. 4,500",
    image: `${CAT_IMG}/services.webp`,
    condition: "na",
    sellerType: "shop",
    attrs: ["Same Day", "Insured"],
    postedAgo: "1 day ago",
  },
  {
    id: "l15",
    title: "Mountain Bike, 21-Speed",
    categoryId: "hobbies",
    location: "Nuwara Eliya",
    price: 32000,
    priceLabel: "Rs. 32,000",
    image: `${CAT_IMG}/hobbies.webp`,
    condition: "used",
    sellerType: "individual",
    deal: "negotiable",
    attrs: ["21-Speed", "Good Condition"],
    postedAgo: "2 days ago",
  },
  {
    id: "l16",
    title: "Labrador Puppies",
    categoryId: "animals-pets",
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
    location: "Colombo",
    price: 5000,
    priceLabel: "Rs. 5,000",
    image: `${CAT_IMG}/health-beauty.webp`,
    condition: "na",
    sellerType: "shop",
    deal: "coupon",
    attrs: ["60 min", "Home Visit"],
    postedAgo: "4 hours ago",
  },
];

/*
 * ============================================================
 * FEATURED SHOPS (contextual to the selected category)
 * ============================================================
 */

export type SampleShop = {
  name: string;
  categoryId: string;
  category: string;
  location: string;
  rating: number;
  listings: string;
  tier: "toprated" | "premium" | "verified";
  cover: string;
};

export const sampleShops: SampleShop[] = [
  {
    name: "TechZone Sri Lanka",
    categoryId: "electronics",
    category: "Electronics",
    location: "Colombo",
    rating: 4.8,
    listings: "120+",
    tier: "verified",
    cover: `${CAT_IMG}/electronics.webp`,
  },
  {
    name: "AutoHub LK",
    categoryId: "vehicles",
    category: "Vehicles",
    location: "Gampaha",
    rating: 4.6,
    listings: "85+",
    tier: "toprated",
    cover: `${CAT_IMG}/vehicles.webp`,
  },
  {
    name: "HomeStyle",
    categoryId: "home-garden",
    category: "Home & Garden",
    location: "Kandy",
    rating: 4.7,
    listings: "96+",
    tier: "premium",
    cover: `${CAT_IMG}/home-garden.webp`,
  },
  {
    name: "Glamour.lk",
    categoryId: "fashion",
    category: "Fashion",
    location: "Colombo",
    rating: 4.8,
    listings: "150+",
    tier: "verified",
    cover: `${CAT_IMG}/fashion.webp`,
  },
  {
    name: "PetCare Lanka",
    categoryId: "animals-pets",
    category: "Animals & Pets",
    location: "Negombo",
    rating: 4.6,
    listings: "70+",
    tier: "toprated",
    cover: `${CAT_IMG}/animals.webp`,
  },
  {
    name: "Prime Estates",
    categoryId: "property",
    category: "Property",
    location: "Colombo",
    rating: 4.7,
    listings: "60+",
    tier: "premium",
    cover: `${CAT_IMG}/property.webp`,
  },
  {
    name: "FixIt Services",
    categoryId: "services",
    category: "Services",
    location: "Colombo",
    rating: 4.6,
    listings: "110+",
    tier: "premium",
    cover: `${CAT_IMG}/services.webp`,
  },
  {
    name: "CareerLink",
    categoryId: "jobs",
    category: "Jobs",
    location: "Colombo",
    rating: 4.9,
    listings: "45+",
    tier: "verified",
    cover: `${CAT_IMG}/jobs.webp`,
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
  { key: "toyotaAqua", href: "/listings?q=Toyota+Aqua" },
  { key: "houseForRent", href: "/listings?q=house+for+rent" },
  { key: "iphone", href: "/listings?q=iPhone" },
  { key: "partTimeJobs", href: "/listings/jobs?q=part-time" },
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

export const DEAL_VALUES: DealTag[] = ["coupon", "price-drop", "negotiable"];

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
