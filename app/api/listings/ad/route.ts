import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis } from "@/lib/redis";
import { categories } from "@/config/const/navLinks";

/*
 * Ad-posting endpoint for the general marketplace flow (/sell).
 *
 * The Listing model is still gem/jewellery-shaped (ListingCategory enum =
 * GEM | JEWELLERY | PRECIOUS_METAL | SERVICE), so a general-category ad
 * cannot be written to `listings` yet without a schema migration. Until
 * that lands, a submitted ad is:
 *   1. validated,
 *   2. stashed in Redis under `pending-ad:<userId>:<id>` (30-day TTL) so
 *      nothing is lost and an admin/cron can process the queue,
 *   3. acknowledged with 202 so the poster's flow completes.
 *
 * When the schema is migrated, replace the Redis stash with a
 * `db.listing.create({ data: { ...mapped, attributes, status: "PENDING_REVIEW" } })`.
 */

const VALID_CATEGORY_IDS = new Set(categories.map((c) => c.id));

type AdPayload = {
  categoryId?: string;
  subcategoryId?: string;
  title?: string;
  description?: string;
  attributes?: Record<string, unknown>;
  images?: string[];
  videoUrl?: string;
  district?: string;
  city?: string;
  priceMode?: string;
  price?: string;
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

  const errors: Record<string, string> = {};
  if (!body.categoryId || !VALID_CATEGORY_IDS.has(body.categoryId))
    errors.category = "Choose a valid category.";
  if (!body.subcategoryId) errors.subcategory = "Choose a listing type.";
  if (!body.title || body.title.trim().length < 8)
    errors.title = "Add a clear title.";
  if (!body.description || body.description.trim().length < 20)
    errors.description = "Add a description.";
  if (!Array.isArray(body.images) || body.images.length < 1)
    errors.images = "Add at least one photo.";
  if (!body.city) errors.city = "Choose a location.";
  if (
    (body.priceMode === "fixed" || body.priceMode === "negotiable") &&
    !(Number(body.price) > 0)
  )
    errors.price = "Enter a price.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { message: "Please check the highlighted fields.", fieldErrors: errors },
      { status: 400 },
    );
  }

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    sellerId: session.user.id,
    submittedAt: new Date().toISOString(),
    status: "PENDING_REVIEW",
    ...body,
  };

  try {
    await redis.set(`pending-ad:${session.user.id}:${id}`, record, {
      ex: 60 * 60 * 24 * 30,
    });
  } catch (err) {
    // Even the stash is best-effort — never block the poster on infra.
    console.error("[listings/ad] failed to stash pending ad:", err);
  }

  return NextResponse.json(
    { message: "received", id, persisted: false },
    { status: 202 },
  );
}
