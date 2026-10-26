import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Merchant-facing coupons/offers shown in the homepage deals panel. Only
// verified business profiles may create them, and every offer needs its
// own expiry — see lib/deals/offers.ts for how "active" is read back.

interface OfferPayload {
  businessProfileId?: string;
  title?: string;
  code?: string;
  expiresAt?: string;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const businessProfileId = req.nextUrl.searchParams.get("businessProfileId");
  if (!businessProfileId) {
    return NextResponse.json(
      { message: "businessProfileId is required." },
      { status: 400 },
    );
  }

  const business = await db.businessProfile.findFirst({
    where: { id: businessProfileId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json(
      { message: "Business not found." },
      { status: 404 },
    );
  }

  const offers = await db.businessOffer.findMany({
    where: { businessProfileId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: OfferPayload;
  try {
    body = (await req.json()) as OfferPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (!body.businessProfileId) {
    return NextResponse.json(
      { message: "businessProfileId is required." },
      { status: 400 },
    );
  }
  if (!body.title || body.title.trim().length < 3) {
    return NextResponse.json(
      { message: "Add a short title for the offer." },
      { status: 400 },
    );
  }
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (
    !expiresAt ||
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt <= new Date()
  ) {
    return NextResponse.json(
      { message: "Add a valid expiry date in the future." },
      { status: 400 },
    );
  }

  const business = await db.businessProfile.findFirst({
    where: { id: body.businessProfileId, ownerId: session.user.id },
    select: { id: true, isVerified: true, status: true },
  });
  if (!business) {
    return NextResponse.json(
      { message: "Business not found." },
      { status: 404 },
    );
  }
  if (!business.isVerified || business.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "Only verified businesses can create offers." },
      { status: 403 },
    );
  }

  const offer = await db.businessOffer.create({
    data: {
      businessProfileId: business.id,
      title: body.title.trim(),
      code: body.code?.trim() || null,
      expiresAt,
    },
  });

  return NextResponse.json({ offer }, { status: 201 });
}
