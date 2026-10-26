import type { BusinessHighlight } from "./highlights";
import type { InstalmentOffer, InstalmentProviderId } from "./pricing";
import {
  DEFAULT_HOURS,
  isOpenAt,
  windowFor,
  type OpeningHours,
} from "./responseTime";

/*
 * The one shape every storefront section reads. It is plain JSON (ISO date
 * strings, no Dates or functions) so the server page can hand it straight to
 * the client components. BusinessProfile rows are mapped into it (see
 * getStorefront.ts).
 */

// What the business sells sets the word used in the section bar, counts and
// "View all": Products (retail), Services, Vehicles (dealers), Properties
// (agencies), Courses (institutes).
export type ItemsKind =
  | "products"
  | "services"
  | "vehicles"
  | "properties"
  | "courses";

export type Availability = "in-stock" | "few-left" | "pre-order" | "sold";
export type Condition = "new" | "used" | "reconditioned";
export type WarrantyKind = "company" | "shop";
export type PrimaryAction = "whatsapp" | "call" | "enquire";

// An optional focal point (percent) and zoom, to show one part of a photo.
export type ImageCrop = { x: number; y: number; zoom: number };

export type StorefrontProduct = {
  id: string;
  title: string;
  href: string;
  image: string | null;
  crop?: ImageCrop;
  price: number;
  // Lowest price in the previous 30 days; the only basis for a drop badge.
  lowestPrice30d?: number;
  condition?: Condition;
  warranty?: { kind: WarrantyKind; months: number };
  instalment?: InstalmentOffer;
  availability: Availability;
  deliveryDays?: [number, number];
  specs: string[];
  // The business's own category chip ("laptops", "phones"), and brand.
  category: string;
  brand?: string;
  collections: string[];
  addedDaysAgo: number;
  negotiable?: boolean;
  pinned?: boolean;
};

export type StorefrontCollection = {
  id: string;
  name: string;
  image: string | null;
  crop?: ImageCrop;
};

export type StorefrontOffer = {
  id: string;
  title: string;
  description: string;
  code?: string;
  badge: string; // "10% OFF", "Free Gift"
  endsAt: string; // ISO; an expired offer is not shown
  image: string | null;
  crop?: ImageCrop;
};

export type StorefrontBrand = {
  name: string;
  authorised: boolean;
  proofVerifiedAt?: string; // YYYY-MM-DD, authorised brands only
};

export type StorefrontReview = {
  id: string;
  name: string;
  date: string; // ISO
  stars: number;
  text: string;
  product?: string;
  photos?: { image: string; crop?: ImageCrop }[];
  helpful: number;
  reply?: { text: string; date: string };
};

export type StorefrontQuestion = {
  id: string;
  question: string;
  date: string;
  answer?: { text: string; date: string };
};

export type StorefrontBranch = {
  id: string;
  label: string;
  address: string;
  district: string;
  phone?: string;
  main?: boolean;
};

export type StorefrontBusiness = {
  slug: string;
  name: string;
  tagline: string;
  itemsKind: ItemsKind;
  categoryId: string;
  categoryName: string;
  city: string;
  district: string;
  // Cover is a photo only: no text, no overlay. Without one, a solid band
  // in the brand colour is used.
  cover: string | null;
  coverCrop?: ImageCrop;
  brandColor: string;
  logo: string | null;
  verified: boolean;
  verification: {
    phone?: string; // dates, YYYY-MM-DD
    registration?: string;
    address?: string;
    authorisedDealer?: string;
  };
  legalName?: string;
  registrationNumber?: string;
  registeredAddress?: string;
  sinceYear: number;
  establishedYear?: number;
  followers: number;
  rating: { average: number; count: number; distribution: number[] }; // 5..1, percent
  response: { conversations: number; medianMinutes: number; replyRate: number };
  openingHours: OpeningHours;
  hoursSet: boolean;
  // days = weekdays (0 Sunday) the row applies to, so today can be highlighted.
  hoursTable: { label: string; value: string; days?: number[] }[];
  phone: string; // international, no +
  whatsapp: string;
  primaryAction: PrimaryAction;
  highlights: { key: BusinessHighlight; policy: string }[];
  collections: StorefrontCollection[];
  products: StorefrontProduct[];
  offers: StorefrontOffer[];
  brands: StorefrontBrand[];
  reviews: StorefrontReview[];
  questions: StorefrontQuestion[];
  about: {
    story: string;
    team: { name: string; role: string }[];
    teamSize?: string;
    languages: string[];
    payments: string[];
    instalmentProviders: InstalmentProviderId[];
    deliveryAreas: string;
    deliveryFee: string;
    warrantyPolicy: string;
    returnsPolicy: string;
    faq: { q: string; a: string }[];
    social: {
      kind: "facebook" | "instagram" | "youtube" | "website";
      url: string;
    }[];
  };
  branches: StorefrontBranch[];
  isNew: boolean;
  // The shop pin (ad page map, directions). Absent: district area only.
  location?: { lat: number; lng: number };
};

/* ------------------------------------------------------------------ */

export function whatsappHref(
  business: Pick<StorefrontBusiness, "name" | "whatsapp">,
  siteUrl: string,
  product?: Pick<StorefrontProduct, "title" | "price" | "href">,
) {
  const text = product
    ? `Hi ${business.name}, I'm interested in ${product.title} (Rs. ${product.price.toLocaleString("en-US")}) ${siteUrl}${product.href}`
    : `Hi ${business.name}, I found your page on SLMarket.lk`;
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function isOpenNow(business: StorefrontBusiness, at = new Date()) {
  return business.hoursSet ? isOpenAt(at, business.openingHours) : null;
}

const COLOMBO_OFFSET_MS = 330 * 60 * 1000;

function formatMinute(minute: number) {
  const h24 = Math.floor(minute / 60);
  const m = minute % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// "Closes 7:00 PM" while open, "Opens 9:00 AM" (or tomorrow) while closed.
export function nextChange(
  business: Pick<StorefrontBusiness, "hoursSet" | "openingHours">,
  at = new Date(),
): {
  open: boolean;
  time: string;
  tomorrow: boolean;
  // minutes until closing, while open
  remainingMinutes?: number;
} | null {
  if (!business.hoursSet) return null;
  const hours = business.openingHours ?? DEFAULT_HOURS;
  const local = new Date(at.getTime() + COLOMBO_OFFSET_MS);
  const minute = local.getUTCHours() * 60 + local.getUTCMinutes();
  const today = windowFor(hours, local.getUTCDay());

  if (today && minute >= today.openMinute && minute < today.closeMinute) {
    return {
      open: true,
      time: formatMinute(today.closeMinute),
      tomorrow: false,
      remainingMinutes: today.closeMinute - minute,
    };
  }
  if (today && minute < today.openMinute) {
    return {
      open: false,
      time: formatMinute(today.openMinute),
      tomorrow: false,
    };
  }
  for (let d = 1; d <= 7; d++) {
    const w = windowFor(hours, (local.getUTCDay() + d) % 7);
    if (w)
      return { open: false, time: formatMinute(w.openMinute), tomorrow: true };
  }
  return null;
}

export function todayHoursLabel(business: StorefrontBusiness, at = new Date()) {
  if (!business.hoursSet) return null;
  const local = new Date(at.getTime() + COLOMBO_OFFSET_MS);
  const w = windowFor(business.openingHours, local.getUTCDay());
  return w
    ? `${formatMinute(w.openMinute)} to ${formatMinute(w.closeMinute)}`
    : null;
}

// An offer whose end time has passed disappears on its own.
export function activeOffers(offers: StorefrontOffer[], now = new Date()) {
  return offers.filter((o) => new Date(o.endsAt).getTime() > now.getTime());
}

export function directionsHref(branch: { address: string; district: string }) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.address}, ${branch.district}, Sri Lanka`)}`;
}

export function toInternationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return digits;
}

export function itemsKindFor(
  categoryId: string,
  businessType?: string | null,
): ItemsKind {
  if (categoryId === "vehicles" || businessType === "DEALER") return "vehicles";
  if (categoryId === "property" || businessType === "AGENCY")
    return "properties";
  if (categoryId === "education" || businessType === "INSTITUTE")
    return "courses";
  if (categoryId === "services" || businessType === "SERVICE_PROVIDER")
    return "services";
  return "products";
}
