import type { BusinessHighlight } from "../highlights";
import type { InstalmentProviderId } from "../pricing";
import type { OpeningHours } from "../responseTime";
import type { ImageCrop, ItemsKind } from "../storefront";
import type { LatLng } from "./geo";

/*
 * What the Businesses directory needs to know about a business. The
 * directory reads a list of these; today it comes from sample data
 * (sampleDirectory.ts) and later from the database and the search index.
 */

// 1 phone, 2 + business registration, 3 + address, 4 + authorised dealer proof.
export type VerifiedLevel = 1 | 2 | 3 | 4;

export type DirectoryItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  crop?: ImageCrop;
  category: string; // the business's own category ("laptops")
  brand?: string;
  pinned?: boolean;
  addedDaysAgo: number;
};

export type DirectorySponsorship = {
  categoryIds: string[];
  dailyPlan: number; // impressions bought per day
  impressionsToday: number;
};

export type DirectoryBusiness = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  itemsKind: ItemsKind;
  categoryId: string; // primary: counted and ranked strongest here
  secondaryCategoryIds: string[]; // up to 2
  subcategoryIds: string[]; // e.g. "ac-repair" under services
  typeLabel: string; // "Electronics Store"
  district: string;
  city: string;
  location: LatLng | null; // exact pin; null = no shop location
  serviceArea?: { radiusKm: number }; // approximate area instead of an address
  verifiedLevel: VerifiedLevel;
  rating: { average: number; count: number };
  response: { conversations: number; medianMinutes: number; replyRate: number };
  openingHours: OpeningHours;
  hoursSet: boolean;
  highlights: BusinessHighlight[];
  authorisedBrands: string[];
  otherBrands: string[];
  delivery: { islandwide: boolean; districts: string[] };
  instalmentProviders: InstalmentProviderId[];
  itemCount: number;
  items: DirectoryItem[];
  logo: string | null;
  brandColor: string;
  cover: string | null;
  coverCrop?: ImageCrop;
  phone: string;
  whatsapp: string;
  createdDaysAgo: number;
  lastActiveDaysAgo: number;
  completeness: number; // 0..1
  published: boolean;
  suspended: boolean;
  sponsored?: DirectorySponsorship;
};

export type SortKey = "recommended" | "nearest" | "rating" | "items";
export const SORT_KEYS: SortKey[] = [
  "recommended",
  "nearest",
  "rating",
  "items",
];

export type DeliveryFilter = "islandwide" | "district";

export type DirectoryFilters = {
  q: string;
  category: string | null;
  subcategory: string | null;
  district: string | null;
  verified: boolean;
  open: boolean;
  rating4: boolean;
  delivery: DeliveryFilter[];
  distanceKm: number | null;
  instalment: boolean;
  authorisedBrand: string | null;
  sort: SortKey;
};

export const DEFAULT_FILTERS: DirectoryFilters = {
  q: "",
  category: null,
  subcategory: null,
  district: null,
  verified: false,
  open: false,
  rating4: false,
  delivery: [],
  distanceKm: null,
  instalment: false,
  authorisedBrand: null,
  sort: "recommended",
};

export const DISTANCE_OPTIONS = [2, 5, 10, 25] as const;
