import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayhereWebhook } from "@/lib/payhere";
import { sendSubscriptionConfirmation } from "@/lib/email";
import { invalidateListingsCache } from "@/lib/listings-cache";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const params = Object.fromEntries(body.entries()) as Record<string, string>;

  const isValid = verifyPayhereWebhook({
    merchant_id: params.merchant_id,
    order_id: params.order_id,
    payment_id: params.payment_id,
    payhere_amount: params.payhere_amount,
    payhere_currency: params.payhere_currency,
    status_code: params.status_code,
    md5sig: params.md5sig,
  });

  if (!isValid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  // status_code 2 = success
  if (params.status_code !== "2") {
    return NextResponse.json({ message: "Payment not successful" });
  }

  // PayHere may redeliver the same notification on retry — make processing
  // idempotent on payment_id so we never double-activate a subscription/boost.
  const alreadyProcessed = await db.paymentTransaction.findFirst({
    where: { gatewayRef: params.payment_id },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ message: "Already processed" });
  }

  const orderId = params.order_id;

  // Parse order type from orderId prefix
  if (orderId.startsWith("sub_")) {
    // sub_<sellerId>_<planId>_<timestamp>
    const parts = orderId.split("_");
    const sellerId = parts[1];
    const planId = parts[2];

    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    const seller = await db.user.findUnique({ where: { id: sellerId } });

    if (!plan || !seller) {
      return NextResponse.json(
        { message: "Plan or seller not found" },
        { status: 404 },
      );
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db.$transaction([
      db.sellerSubscription.upsert({
        where: { sellerId },
        create: {
          sellerId,
          planId,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          payhereOrderId: params.payment_id,
          freeBoostsRemaining: plan.monthlyFreeBoosts,
        },
        update: {
          planId,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          payhereOrderId: params.payment_id,
          freeBoostsRemaining: plan.monthlyFreeBoosts,
          cancelAtPeriodEnd: false,
        },
      }),
      db.paymentTransaction.create({
        data: {
          userId: sellerId,
          type: "SUBSCRIPTION",
          amountUsd: Number(params.payhere_amount) / 330,
          amountLkr: Number(params.payhere_amount),
          currency: params.payhere_currency,
          gateway: "PAYHERE",
          gatewayRef: params.payment_id,
          status: "COMPLETED",
          metadata: { orderId, planId },
        },
      }),
    ]);

    await sendSubscriptionConfirmation(
      seller.email,
      seller.name,
      plan.displayName,
      periodEnd,
    ).catch(() => {});
  }

  if (orderId.startsWith("boost_")) {
    // boost_<listingId>_<timestamp>
    const parts = orderId.split("_");
    const listingId = parts[1];

    const alreadyBoosted = await db.listingBoost.findFirst({
      where: { paymentRef: params.payment_id },
    });

    const listing = alreadyBoosted
      ? null
      : await db.listing.findUnique({ where: { id: listingId } });
    if (listing) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1); // default 1 day for webhook-confirmed boosts

      await db.$transaction([
        db.listingBoost.create({
          data: {
            listingId,
            sellerId: listing.sellerId,
            boostType: "TOP_SEARCH_1D",
            startDate: new Date(),
            endDate,
            isFreeBoost: false,
            amountPaidLkr: Number(params.payhere_amount),
            paymentRef: params.payment_id,
          },
        }),
        db.listing.update({
          where: { id: listingId },
          data: { isBoosted: true, boostEndAt: endDate },
        }),
      ]);

      await invalidateListingsCache();
    }
  }

  return NextResponse.json({ message: "OK" });
}
