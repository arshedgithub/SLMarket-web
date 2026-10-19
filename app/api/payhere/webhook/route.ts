import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayhereWebhook } from "@/lib/payhere";
import { sendSubscriptionConfirmation } from "@/lib/email";
import { invalidateListingsCache } from "@/lib/listings-cache";
import {
  activateBusinessPlan,
  parseSubscriptionOrderId,
  planPrice,
} from "@/lib/billing/subscription";

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
    // sub_<businessProfileId>_<planId>_<M|A>_<timestamp>
    const order = parseSubscriptionOrderId(orderId);
    const [plan, business] = order
      ? await Promise.all([
          db.subscriptionPlan.findUnique({ where: { id: order.planId } }),
          db.businessProfile.findUnique({
            where: { id: order.businessProfileId },
            include: {
              owner: { select: { id: true, name: true, email: true } },
            },
          }),
        ])
      : [null, null];

    if (!order || !plan || !business) {
      return NextResponse.json(
        { message: "Plan or business not found" },
        { status: 404 },
      );
    }

    const { months } = planPrice(plan, order.cycle);
    const sub = await db.$transaction(async (tx) => {
      const activated = await activateBusinessPlan(tx, {
        businessProfileId: business.id,
        plan,
        months,
        payhereOrderId: params.payment_id,
      });
      await tx.paymentTransaction.create({
        data: {
          userId: business.ownerId,
          type: "SUBSCRIPTION",
          amountUsd: Number(params.payhere_amount) / 330,
          amountLkr: Number(params.payhere_amount),
          currency: params.payhere_currency,
          gateway: "PAYHERE",
          gatewayRef: params.payment_id,
          status: "COMPLETED",
          metadata: {
            orderId,
            planId: plan.id,
            businessProfileId: business.id,
            cycle: order.cycle,
          },
        },
      });
      return activated;
    });

    await sendSubscriptionConfirmation(
      business.owner.email,
      business.owner.name,
      `${plan.displayName} (${business.name})`,
      sub.currentPeriodEnd,
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
