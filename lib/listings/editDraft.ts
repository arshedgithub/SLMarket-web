import type { Listing } from "@prisma/client";
import { EMPTY_DRAFT, type AdDraft } from "@/components/post-ad/types";

/*
 * A saved listing as a post-ad flow draft, so editing reuses the same
 * steps and validation as posting (the reverse of lib/listings/adPayload).
 */

type EditableListing = Pick<
  Listing,
  | "title"
  | "description"
  | "categoryId"
  | "subcategoryId"
  | "attributes"
  | "images"
  | "videoUrl"
  | "pricingType"
  | "price"
  | "negotiable"
  | "promotionType"
  | "promotionDetail"
  | "locationType"
  | "district"
  | "city"
  | "area"
  | "deliveryAvailable"
  | "islandwideDelivery"
  | "businessProfileId"
  | "contactPhone"
  | "showContactPhone"
  | "allowWhatsapp"
>;

const PRICING: Record<Listing["pricingType"], AdDraft["pricingType"]> = {
  FIXED: "fixed",
  STARTING_FROM: "startingFrom",
  CONTACT: "contact",
  FREE: "free",
};
const PROMOTION: Record<Listing["promotionType"], AdDraft["promotionType"]> = {
  NONE: "none",
  DISCOUNT: "discount",
  COUPON: "coupon",
};
const LOCATION: Record<Listing["locationType"], AdDraft["locationType"]> = {
  SINGLE: "single",
  BRANCHES: "branches",
  ISLANDWIDE: "islandwide",
};

export function listingToDraft(l: EditableListing): AdDraft {
  // Card highlights are kept on the listing separately; the flow edits
  // only the structured fields.
  const attributes: AdDraft["attributes"] = {};
  for (const [k, v] of Object.entries(
    (l.attributes ?? {}) as Record<string, unknown>,
  )) {
    if (k === "highlights") continue;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    )
      attributes[k] = v;
  }
  return {
    ...EMPTY_DRAFT,
    categoryId: l.categoryId,
    subcategoryId: l.subcategoryId,
    title: l.title,
    description: l.description,
    attributes,
    images: l.images,
    videoUrl: l.videoUrl ?? "",
    pricingType: PRICING[l.pricingType],
    price: l.price === null ? "" : String(Number(l.price)),
    negotiable: l.negotiable,
    promotionType: PROMOTION[l.promotionType],
    promotionDetail: l.promotionDetail ?? "",
    locationType: LOCATION[l.locationType],
    district: l.district ?? "",
    city: l.city ?? "",
    area: l.area ?? "",
    deliveryAvailable: l.deliveryAvailable,
    islandwideDelivery: l.islandwideDelivery,
    sellerMode: l.businessProfileId ? "shop" : "personal",
    shopId: l.businessProfileId ?? "",
    contactPhone: l.contactPhone ?? "",
    showPhone: l.showContactPhone,
    whatsapp: l.allowWhatsapp,
    // Already accepted when the ad was first posted.
    policyAccepted: true,
  };
}
