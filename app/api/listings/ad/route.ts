import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import slugify from "@/lib/utils/slugify";
import { recordInitialPrice } from "@/lib/deals/priceDrops";
import { parseAdPayload, type AdPayload } from "@/lib/listings/adPayload";

// Ad-posting endpoint for the general marketplace flow (/sell). Every
// submission is created straight into `listings` with status
// PENDING_REVIEW — admin review happens afterwards, not here. Validation
// is shared with editing (lib/listings/adPayload.ts).

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

  // A business-mode ad only attaches to a BusinessProfile this user actually
  // owns — a stale shop id (or one from another account) quietly
  // falls back to posting under the personal account instead of erroring.
  let businessProfileId: string | null = null;
  if (body.sellerMode === "shop" && body.shopId) {
    const business = await db.businessProfile.findFirst({
      where: { id: body.shopId, ownerId: session.user.id },
      select: { id: true },
    });
    businessProfileId = business?.id ?? null;
  }

  const slug = `${slugify(parsed.fields.title) || "listing"}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const listing = await db.listing.create({
    data: {
      ...parsed.fields,
      sellerId: session.user.id,
      businessProfileId,
      slug,
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
