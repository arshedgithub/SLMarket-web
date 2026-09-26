import { NextRequest, NextResponse } from "next/server";
import { BoostType } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { boostSchema } from "@/lib/validations/subscription";
import { buildPayhereFormData } from "@/lib/payhere";
import { invalidateListingsCache } from "@/lib/listings-cache";

const BOOST_PRICES_USD: Record<string, number> = {
  TOP_SEARCH_1D: 3.5,
  TOP_SEARCH_3D: 9,
  TOP_SEARCH_7D: 18,
  CATEGORY_BANNER: 25,
};

const BOOST_DAYS: Record<string, number> = {
  TOP_SEARCH_1D: 1,
  TOP_SEARCH_3D: 3,
  TOP_SEARCH_7D: 7,
  CATEGORY_BANNER: 7,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await params;
  const body = await req.json();
  const parsed = boostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { boostType, useFreeBoost } = parsed.data;

  const listing = await db.listing.findFirst({
    where: { id: listingId, sellerId: session.user.id },
  });
  if (!listing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  // Use free boost if requested
  if (useFreeBoost) {
    const subscription = await db.sellerSubscription.findUnique({
      where: { sellerId: session.user.id },
    });
    if (!subscription || subscription.freeBoostsRemaining < 1) {
      return NextResponse.json(
        { message: "No free boosts remaining this month" },
        { status: 400 },
      );
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + BOOST_DAYS[boostType]);

    await db.$transaction([
      db.listingBoost.create({
        data: {
          listingId,
          sellerId: session.user.id,
          boostType: boostType as BoostType,
          startDate: now,
          endDate,
          isFreeBoost: true,
        },
      }),
      db.listing.update({
        where: { id: listingId },
        data: { isBoosted: true, boostEndAt: endDate },
      }),
      db.sellerSubscription.update({
        where: { sellerId: session.user.id },
        data: { freeBoostsRemaining: { decrement: 1 } },
      }),
    ]);

    await invalidateListingsCache();

    return NextResponse.json({ message: "Boost applied successfully" });
  }

  // Paid boost via PayHere
  const amountLkr = (BOOST_PRICES_USD[boostType] ?? 3.5) * 330;
  const orderId = `boost_${listingId}_${Date.now()}`;

  const seller = await db.user.findUnique({ where: { id: session.user.id } });
  if (!seller)
    return NextResponse.json({ message: "Seller not found" }, { status: 404 });

  const [firstName, ...rest] = seller.name.split(" ");
  const formData = buildPayhereFormData({
    orderId,
    items: `Listing Boost: ${boostType}`,
    amountLkr,
    firstName,
    lastName: rest.join(" ") || "-",
    email: seller.email,
    phone: seller.phone ?? "",
  });

  return NextResponse.json({
    gateway: "payhere",
    formData,
    checkoutUrl: process.env.PAYHERE_CHECKOUT_URL,
  });
}
