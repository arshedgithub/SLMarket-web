import { NextRequest, NextResponse } from "next/server";
import type { ListingStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  needsReview,
  parseAdPayload,
  type AdPayload,
} from "@/lib/listings/adPayload";

type Params = { params: Promise<{ id: string }> };

const LISTING_FIELDS = {
  id: true,
  sellerId: true,
  slug: true,
  status: true,
  price: true,
  title: true,
  description: true,
  categoryId: true,
  subcategoryId: true,
  images: true,
} as const;

// The owner's own ad; an admin may edit any ad (moderation).
async function editableListing(id: string, userId: string, isAdmin: boolean) {
  return db.listing.findFirst({
    where: isAdmin ? { id } : { id, sellerId: userId },
    select: LISTING_FIELDS,
  });
}

/*
 * Edit an ad (the post-ad flow in edit mode). A price change closes the
 * current PriceHistory row and opens a new one, so "Was" prices stay
 * genuine. Changing what the ad is (title, description, category, photos)
 * sends a live ad back through review; price and contact changes do not.
 * An admin's edit keeps the ad's status: the admin is the reviewer.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  }
  const isAdmin = session.user.role === "ADMIN";
  const { id } = await params;
  const existing = await editableListing(id, session.user.id, isAdmin);
  if (!existing)
    return NextResponse.json({ message: "Ad not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as AdPayload | null;
  if (!body)
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  const parsed = parseAdPayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        message: "Please check the highlighted fields.",
        fieldErrors: parsed.errors,
      },
      { status: 400 },
    );
  }

  // The business must belong to the ad's seller (not to an editing admin).
  let businessProfileId: string | null | undefined;
  if (body.sellerMode === "shop" && body.shopId) {
    const business = await db.businessProfile.findFirst({
      where: { id: body.shopId, ownerId: existing.sellerId },
      select: { id: true },
    });
    businessProfileId = business?.id ?? null;
  } else if (body.sellerMode === "personal") {
    businessProfileId = null;
  }

  const live = existing.status === "ACTIVE" || existing.status === "RESERVED";
  const status: ListingStatus =
    !isAdmin && live && needsReview(existing, parsed.fields)
      ? "PENDING_REVIEW"
      : existing.status;

  const oldPrice = existing.price === null ? null : Number(existing.price);
  const newPrice = parsed.fields.price;

  const updated = await db.$transaction(async (tx) => {
    if (oldPrice !== newPrice) {
      await tx.priceHistory.updateMany({
        where: { listingId: id, endedAt: null },
        data: { endedAt: new Date() },
      });
      if (newPrice !== null) {
        await tx.priceHistory.create({
          data: { listingId: id, price: newPrice },
        });
      }
    }
    return tx.listing.update({
      where: { id },
      data: {
        ...parsed.fields,
        ...(businessProfileId !== undefined ? { businessProfileId } : {}),
        status,
      },
      select: { id: true, slug: true, status: true },
    });
  });

  return NextResponse.json({
    ...updated,
    reviewing: updated.status === "PENDING_REVIEW",
  });
}

// What an owner can switch between from the ad page.
const OWNER_STATUSES = new Set<ListingStatus>(["ACTIVE", "RESERVED", "SOLD"]);

// Mark as sold / reserved / available again.
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await editableListing(id, session.user.id, false);
  if (!existing)
    return NextResponse.json({ message: "Ad not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as {
    status?: ListingStatus;
  } | null;
  const next = body?.status;
  if (
    !next ||
    !OWNER_STATUSES.has(next) ||
    !OWNER_STATUSES.has(existing.status)
  ) {
    return NextResponse.json(
      { message: "That change isn't possible for this ad." },
      { status: 400 },
    );
  }

  const updated = await db.listing.update({
    where: { id },
    data: { status: next },
    select: { id: true, slug: true, status: true },
  });
  return NextResponse.json(updated);
}
