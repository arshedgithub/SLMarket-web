export type PricingType = "fixed" | "startingFrom" | "contact" | "free";

export type LocationType = "single" | "branches" | "islandwide";

export type PromotionType = "none" | "discount" | "coupon";

export type SellerMode = "personal" | "shop";

export type AdDraft = {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  /** Dynamic per-category answers, keyed by field.key */
  attributes: Record<string, string | number | boolean>;
  images: string[];
  videoUrl: string;

  // Price & deal
  pricingType: PricingType;
  price: string;
  negotiable: boolean;
  promotionType: PromotionType;
  promotionDetail: string;

  // Location & availability
  locationType: LocationType;
  district: string;
  city: string;
  area: string;
  selectedBranchIds: string[];
  deliveryAvailable: boolean;
  islandwideDelivery: boolean;

  // Seller
  sellerMode: SellerMode;
  shopId: string;

  // Contact (folded into the Seller step)
  contactPhone: string;
  showPhone: boolean;
  whatsapp: boolean;

  // Publish
  policyAccepted: boolean;
};

export const EMPTY_DRAFT: AdDraft = {
  categoryId: "",
  subcategoryId: "",
  title: "",
  description: "",
  attributes: {},
  images: [],
  videoUrl: "",

  pricingType: "fixed",
  price: "",
  negotiable: false,
  promotionType: "none",
  promotionDetail: "",

  locationType: "single",
  district: "",
  city: "",
  area: "",
  selectedBranchIds: [],
  deliveryAvailable: false,
  islandwideDelivery: false,

  sellerMode: "personal",
  shopId: "",

  contactPhone: "",
  showPhone: true,
  whatsapp: true,

  policyAccepted: false,
};

// Job and service listings are intangible (a role, a service offered) so a
// photo doesn't carry the same weight it does for a physical item — it's
// optional there and capped low. Everything else needs at least one photo,
// up to a more generous cap.
export function getImageLimits(categoryId: string): {
  min: number;
  max: number;
} {
  if (categoryId === "jobs" || categoryId === "services") {
    return { min: 0, max: 2 };
  }
  return { min: 1, max: 5 };
}

// Job listings can skip photos entirely (see getImageLimits), so previews
// fall back to a generic vacancy graphic rather than a blank image slot.
export const DEFAULT_JOB_THUMBNAIL =
  "/images/marketplace/defaults/job-vacancy-thumbnail.webp";

export function getCoverImage(draft: AdDraft): string | null {
  if (draft.images[0]) return draft.images[0];
  if (draft.categoryId === "jobs") return DEFAULT_JOB_THUMBNAIL;
  return null;
}

export const STEPS = [
  { id: "details", label: "Details" },
  { id: "photos", label: "Photos" },
  { id: "price", label: "Price & Deal" },
  { id: "location", label: "Location" },
  { id: "seller", label: "Seller" },
  { id: "preview", label: "Preview" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];
