import type { Prisma } from "@prisma/client";
import { categories } from "@/config/const/navLinks";
import { getImageLimits } from "@/components/post-ad/types";

/*
 * The post-ad flow's payload (components/post-ad/types.ts AdDraft), checked
 * and turned into Listing columns. Shared by create (POST /api/listings/ad)
 * and edit (PUT /api/listings/ad/<id>) so both accept exactly the same.
 */

const VALID_CATEGORY_IDS = new Set(categories.map((c) => c.id));

export const PRICING_TYPE_MAP = {
  fixed: "FIXED",
  startingFrom: "STARTING_FROM",
  contact: "CONTACT",
  free: "FREE",
} as const;

export const PROMOTION_TYPE_MAP = {
  none: "NONE",
  discount: "DISCOUNT",
  coupon: "COUPON",
} as const;

export const LOCATION_TYPE_MAP = {
  single: "SINGLE",
  branches: "BRANCHES",
  islandwide: "ISLANDWIDE",
} as const;

export type AdPayload = {
  categoryId?: string;
  subcategoryId?: string;
  title?: string;
  description?: string;
  attributes?: Record<string, unknown>;
  images?: string[];
  videoUrl?: string;
  pricingType?: keyof typeof PRICING_TYPE_MAP;
  price?: string;
  negotiable?: boolean;
  promotionType?: keyof typeof PROMOTION_TYPE_MAP;
  promotionDetail?: string;
  locationType?: keyof typeof LOCATION_TYPE_MAP;
  district?: string;
  city?: string;
  area?: string;
  deliveryAvailable?: boolean;
  islandwideDelivery?: boolean;
  sellerMode?: "personal" | "shop";
  shopId?: string;
  contactPhone?: string;
  showPhone?: boolean;
  whatsapp?: boolean;
};

// The listing columns the seller controls (not seller, slug or status).
export type AdFields = {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  attributes: Prisma.InputJsonValue;
  images: string[];
  videoUrl: string | null;
  pricingType: (typeof PRICING_TYPE_MAP)[keyof typeof PRICING_TYPE_MAP];
  price: number | null;
  negotiable: boolean;
  promotionType: (typeof PROMOTION_TYPE_MAP)[keyof typeof PROMOTION_TYPE_MAP];
  promotionDetail: string | null;
  locationType: (typeof LOCATION_TYPE_MAP)[keyof typeof LOCATION_TYPE_MAP];
  district: string | null;
  city: string | null;
  area: string | null;
  deliveryAvailable: boolean;
  islandwideDelivery: boolean;
  contactPhone: string | null;
  showContactPhone: boolean;
  allowWhatsapp: boolean;
};

export function parseAdPayload(
  body: AdPayload,
):
  | { ok: true; fields: AdFields }
  | { ok: false; errors: Record<string, string> } {
  const images = Array.isArray(body.images)
    ? body.images.filter((i) => typeof i === "string")
    : [];
  const minImages = body.categoryId ? getImageLimits(body.categoryId).min : 1;

  const errors: Record<string, string> = {};
  if (!body.categoryId || !VALID_CATEGORY_IDS.has(body.categoryId))
    errors.category = "Choose a valid category.";
  if (!body.subcategoryId) errors.subcategory = "Choose a listing type.";
  if (!body.title || body.title.trim().length < 8)
    errors.title = "Add a clear title.";
  if (!body.description || body.description.trim().length < 20)
    errors.description = "Add a description.";
  if (images.length < minImages) errors.images = "Add at least one photo.";
  if (!body.city) errors.city = "Choose a location.";

  const pricingType = PRICING_TYPE_MAP[body.pricingType ?? "fixed"] ?? "FIXED";
  if (
    (pricingType === "FIXED" || pricingType === "STARTING_FROM") &&
    !(Number(body.price) > 0)
  )
    errors.price = "Enter a price.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    fields: {
      title: body.title!.trim(),
      description: body.description!.trim(),
      categoryId: body.categoryId!,
      subcategoryId: body.subcategoryId!,
      attributes: (body.attributes ?? {}) as Prisma.InputJsonValue,
      images,
      videoUrl: body.videoUrl || null,
      pricingType,
      price:
        pricingType === "CONTACT" || pricingType === "FREE"
          ? null
          : Number(body.price),
      negotiable: Boolean(body.negotiable),
      promotionType: PROMOTION_TYPE_MAP[body.promotionType ?? "none"] ?? "NONE",
      promotionDetail: body.promotionDetail || null,
      locationType:
        LOCATION_TYPE_MAP[body.locationType ?? "single"] ?? "SINGLE",
      district: body.district || null,
      city: body.city || null,
      area: body.area || null,
      deliveryAvailable: Boolean(body.deliveryAvailable),
      islandwideDelivery: Boolean(body.islandwideDelivery),
      contactPhone: body.contactPhone || null,
      showContactPhone: body.showPhone ?? true,
      allowWhatsapp: body.whatsapp ?? true,
    },
  };
}

// Edits that change what the ad is (not just its price or contact
// settings) go back through review before buyers see them.
export function needsReview(
  before: Pick<
    AdFields,
    "title" | "description" | "categoryId" | "subcategoryId" | "images"
  >,
  after: AdFields,
): boolean {
  return (
    before.title !== after.title ||
    before.description !== after.description ||
    before.categoryId !== after.categoryId ||
    before.subcategoryId !== after.subcategoryId ||
    before.images.join("|") !== after.images.join("|")
  );
}
