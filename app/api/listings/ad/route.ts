import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categories } from "@/config/const/navLinks";
import { getImageLimits } from "@/components/post-ad/types";
import slugify from "@/lib/utils/slugify";
import { recordInitialPrice } from "@/lib/deals/priceDrops";
import type { Prisma } from "@prisma/client";

// Ad-posting endpoint for the general marketplace flow (/sell). Every
// submission is created straight into `listings` with status
// PENDING_REVIEW — admin review happens afterwards, not here.

const VALID_CATEGORY_IDS = new Set(categories.map((c) => c.id));

const PRICING_TYPE_MAP = {
  fixed: "FIXED",
  startingFrom: "STARTING_FROM",
  contact: "CONTACT",
  free: "FREE",
} as const;

const PROMOTION_TYPE_MAP = {
  none: "NONE",
  discount: "DISCOUNT",
  coupon: "COUPON",
} as const;

const LOCATION_TYPE_MAP = {
  single: "SINGLE",
  branches: "BRANCHES",
  islandwide: "ISLANDWIDE",
} as const;

type AdPayload = {
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Please sign in to publish your ad." },
      { status: 401 },
    );
  }

  let body: AdPayload;
  try {
    body = (await req.json()) as AdPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const images = Array.isArray(body.images) ? body.images : [];
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

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { message: "Please check the highlighted fields.", fieldErrors: errors },
      { status: 400 },
    );
  }

  // A business-mode ad only attaches to a BusinessProfile this user actually
  // owns — a stale/sample shop id (or one from another account) quietly
  // falls back to posting under the personal account instead of erroring.
  let businessProfileId: string | null = null;
  if (body.sellerMode === "shop" && body.shopId) {
    const business = await db.businessProfile.findFirst({
      where: { id: body.shopId, ownerId: session.user.id },
      select: { id: true },
    });
    businessProfileId = business?.id ?? null;
  }

  const slug = `${slugify(body.title!) || "listing"}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const listing = await db.listing.create({
    data: {
      sellerId: session.user.id,
      businessProfileId,
      title: body.title!.trim(),
      slug,
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
      status: "PENDING_REVIEW",
    },
    select: { id: true, slug: true, price: true },
  });

  if (listing.price != null) {
    await recordInitialPrice(listing.id, Number(listing.price));
  }

  return NextResponse.json(
    {
      message: "submitted",
      id: listing.id,
      slug: listing.slug,
      persisted: true,
    },
    { status: 201 },
  );
}
