import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { upgradeSchema } from "@/lib/validations/subscription";
import { calculateDiscount, isCouponApplicable } from "@/lib/utils/coupon";
import {
  activateBusinessPlan,
  BUSINESS_CHOICE_MESSAGE,
  planPrice,
  resolveOwnedBusiness,
} from "@/lib/billing/subscription";
import {
  planPaymentMessage,
  supportWhatsappUrl,
} from "@/lib/billing/manualPayment";

/*
 * POST { planId, cycle?, couponCode?, businessProfileId? }
 * Puts one of the owner's business pages on a plan. Free (or fully
 * discounted) plans start at once; paid ones return a WhatsApp link to
 * arrange payment, and an admin starts the plan once it is paid.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = upgradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { planId, couponCode, cycle, businessProfileId } = parsed.data;

  const choice = await resolveOwnedBusiness(session.user.id, businessProfileId);
  if (!choice.ok) {
    return NextResponse.json(
      { code: choice.code, message: BUSINESS_CHOICE_MESSAGE[choice.code] },
      { status: choice.code === "not_found" ? 404 : 400 },
    );
  }
  const business = choice.business;

  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  }

  const price = planPrice(plan, cycle);
  let finalPriceLkr = price.lkr;
  let finalPriceUsd = price.usd;
  let freeMonths = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await db.couponCode.findFirst({
      where: {
        code: { equals: couponCode, mode: "insensitive" },
        isActive: true,
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
          { OR: [{ validFrom: null }, { validFrom: { lte: new Date() } }] },
        ],
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Invalid or expired coupon code" },
        { status: 400 },
      );
    }

    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      return NextResponse.json(
        { message: "Coupon has reached its usage limit" },
        { status: 400 },
      );
    }

    const userRedemptions = await db.couponRedemption.count({
      where: { couponId: coupon.id, userId: session.user.id },
    });
    if (userRedemptions >= coupon.maxUsesPerUser) {
      return NextResponse.json(
        { message: "You have already used this coupon" },
        { status: 400 },
      );
    }

    const couponForDiscount = {
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      applicablePlanIds: coupon.applicablePlanIds,
      billingCycle: coupon.billingCycle,
    };

    const applicability = isCouponApplicable(couponForDiscount, {
      planId,
      cycle,
    });
    if (!applicability.ok) {
      return NextResponse.json(
        { message: applicability.reason },
        { status: 400 },
      );
    }

    const discount = calculateDiscount(
      couponForDiscount,
      finalPriceUsd,
      finalPriceLkr,
    );
    finalPriceUsd = discount.finalPriceUsd;
    finalPriceLkr = discount.finalPriceLkr;
    freeMonths = discount.freeMonths;
  }

  // Free or fully discounted: start now, no payment step.
  if (finalPriceLkr <= 0 || freeMonths > 0) {
    await db.$transaction(async (tx) => {
      let couponRedemptionId: string | undefined;
      if (coupon) {
        const redemption = await tx.couponRedemption.create({
          data: {
            couponId: coupon.id,
            userId: session.user.id,
            discountAppliedUsd: price.usd - finalPriceUsd,
            discountAppliedLkr: price.lkr - finalPriceLkr,
          },
        });
        await tx.couponCode.update({
          where: { id: coupon.id },
          data: { usesCount: { increment: 1 } },
        });
        couponRedemptionId = redemption.id;
      }
      await activateBusinessPlan(tx, {
        businessProfileId: business.id,
        plan,
        months: price.months + freeMonths,
        couponRedemptionId,
      });
    });

    return NextResponse.json({
      activated: true,
      message: `${plan.displayName} plan activated for ${business.name}${freeMonths > 0 ? ` for ${price.months + freeMonths} months` : ""}.`,
    });
  }

  return NextResponse.json({
    whatsappUrl: supportWhatsappUrl(
      planPaymentMessage({
        planName: plan.displayName,
        cycle,
        businessName: business.name,
        amountLkr: finalPriceLkr,
        couponCode: coupon ? couponCode : undefined,
      }),
    ),
    amountLkr: finalPriceLkr,
  });
}
