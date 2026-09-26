import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { upgradeSchema } from "@/lib/validations/subscription";
import { buildPayhereFormData, PAYHERE_CHECKOUT_URL } from "@/lib/payhere";
import { calculateDiscount, isCouponApplicable } from "@/lib/utils/coupon";

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

  const { planId, couponCode, cycle } = parsed.data;

  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  }

  let finalPriceLkr = Number(plan.priceLkr);
  let finalPriceUsd = Number(plan.priceUsd);
  let freeMonths = 0;
  let couponRedemption = null;

  if (couponCode) {
    const coupon = await db.couponCode.findFirst({
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

    couponRedemption = coupon;
  }

  const orderId = `sub_${session.user.id}_${planId}_${Date.now()}`;

  // Free or 100% coupon — activate immediately
  if (finalPriceLkr <= 0 || freeMonths > 0) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1 + freeMonths);

    await db.$transaction(async (tx) => {
      const sub = await tx.sellerSubscription.upsert({
        where: { sellerId: session.user.id },
        create: {
          sellerId: session.user.id,
          planId,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          freeBoostsRemaining: plan.monthlyFreeBoosts,
        },
        update: {
          planId,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          freeBoostsRemaining: plan.monthlyFreeBoosts,
          cancelAtPeriodEnd: false,
        },
      });

      if (couponRedemption) {
        const redemption = await tx.couponRedemption.create({
          data: {
            couponId: couponRedemption.id,
            userId: session.user.id,
            discountAppliedUsd: Number(plan.priceUsd) - finalPriceUsd,
            discountAppliedLkr: Number(plan.priceLkr) - finalPriceLkr,
          },
        });
        await tx.couponCode.update({
          where: { id: couponRedemption.id },
          data: { usesCount: { increment: 1 } },
        });
        await tx.sellerSubscription.update({
          where: { id: sub.id },
          data: { couponRedemptionId: redemption.id },
        });
      }
    });

    return NextResponse.json({
      activated: true,
      message: `${plan.displayName} plan activated${freeMonths > 0 ? ` for ${freeMonths + 1} months` : ""}. Enjoy!`,
    });
  }

  const seller = await db.user.findUnique({ where: { id: session.user.id } });
  if (!seller)
    return NextResponse.json({ message: "Seller not found" }, { status: 404 });

  const [firstName, ...rest] = seller.name.split(" ");
  const formData = buildPayhereFormData({
    orderId,
    items: `SLMarket.lk ${plan.displayName} Plan`,
    amountLkr: finalPriceLkr,
    firstName,
    lastName: rest.join(" ") || "-",
    email: seller.email,
    phone: seller.phone ?? "",
  });

  return NextResponse.json({
    gateway: "payhere",
    checkoutUrl: PAYHERE_CHECKOUT_URL,
    formData,
    orderId,
  });
}
