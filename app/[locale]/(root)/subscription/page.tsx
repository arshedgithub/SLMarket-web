export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  calculateDiscount,
  getAnnualPrice,
  isCouponApplicable,
  type CouponForDiscount,
} from "@/lib/utils/coupon";
import {
  SubscriptionPlans,
  type PlanPricing,
  type PlanData,
  type CouponInfo,
} from "@/components/subscription/SubscriptionPlans";

export const metadata: Metadata = {
  title: "Subscription Plans",
  description:
    "Compare business subscription plans and pricing on SLMarket.lk.",
};

interface Props {
  searchParams: Promise<{ couponCode?: string; price?: string }>;
}

export default async function SubscriptionPage({ searchParams }: Props) {
  const { couponCode, price } = await searchParams;

  const session = await auth();
  let isFromSriLanka = false;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { district: true },
    });
    isFromSriLanka = !!user?.district;
  }
  const currency: "usd" | "lkr" =
    price === "lkr" && isFromSriLanka ? "lkr" : "usd";

  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Plans now attach to a BusinessProfile, not a bare account, so there's no
  // single "current plan" to read here without knowing which business.
  const currentPlanId: string | null = null;

  let couponInfo: CouponInfo | null = null;
  let couponForDiscount: CouponForDiscount | null = null;

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
      couponInfo = {
        code: couponCode,
        valid: false,
        errorMessage: "Invalid or expired coupon code",
      };
    } else if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      couponInfo = {
        code: couponCode,
        valid: false,
        errorMessage: "This coupon has reached its usage limit",
      };
    } else {
      couponForDiscount = {
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        applicablePlanIds: coupon.applicablePlanIds,
        billingCycle: coupon.billingCycle,
      };
      couponInfo = {
        code: coupon.code,
        valid: true,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        billingCycle: coupon.billingCycle,
      };
    }
  }

  const planData: PlanData[] = plans.map((plan) => {
    const priceUsd = Number(plan.priceUsd);
    const priceLkr = Number(plan.priceLkr);
    const annual = getAnnualPrice({
      priceUsd,
      priceLkr,
      priceUsdAnnual: plan.priceUsdAnnual ? Number(plan.priceUsdAnnual) : null,
      priceLkrAnnual: plan.priceLkrAnnual ? Number(plan.priceLkrAnnual) : null,
    });

    const pricing: Record<"MONTHLY" | "ANNUAL", PlanPricing> = {
      MONTHLY: { usd: priceUsd, lkr: priceLkr, couponApplies: false },
      ANNUAL: { usd: annual.usd, lkr: annual.lkr, couponApplies: false },
    };

    if (couponForDiscount) {
      for (const cycle of ["MONTHLY", "ANNUAL"] as const) {
        const applicability = isCouponApplicable(couponForDiscount, {
          planId: plan.id,
          cycle,
        });
        if (!applicability.ok) continue;

        const base = pricing[cycle];
        const discount = calculateDiscount(
          couponForDiscount,
          base.usd,
          base.lkr,
        );
        pricing[cycle] = {
          ...base,
          couponApplies: true,
          discountedUsd: discount.finalPriceUsd,
          discountedLkr: discount.finalPriceLkr,
          freeMonths: discount.freeMonths,
        };
      }
    }

    return {
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      maxListings: plan.maxListings,
      maxReelsPerMonth: plan.maxReelsPerMonth,
      listingDurationDays: plan.listingDurationDays,
      hasShopProfile: plan.hasShopProfile,
      hasAnalytics: plan.hasAnalytics,
      hasRealtimeAlerts: plan.hasRealtimeAlerts,
      hasDigitalMarketing: plan.hasDigitalMarketing,
      hasWhatsappBroadcast: plan.hasWhatsappBroadcast,
      hasPrioritySearch: plan.hasPrioritySearch,
      hasApiAccess: plan.hasApiAccess,
      hasWholesaleListings: plan.hasWholesaleListings,
      monthlyFreeBoosts: plan.monthlyFreeBoosts,
      supportLevel: plan.supportLevel,
      badgeFastTrack: plan.badgeFastTrack,
      homepageFeatureWeekly: plan.homepageFeatureWeekly,
      pricing,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Subscription <span className="text-blue-600">Plans</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade, downgrade, or
            cancel anytime.
          </p>
        </div>

        <SubscriptionPlans
          plans={planData}
          couponInfo={couponInfo}
          currency={currency}
          isSriLankanSeller={isSriLankanSeller}
          isLoggedIn={!!session}
          currentPlanId={currentPlanId}
        />
      </div>
    </div>
  );
}
