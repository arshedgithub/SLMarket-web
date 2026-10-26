import type { Prisma, SubscriptionPlan } from "@prisma/client";
import { db } from "@/lib/db";

/*
 * Paid plans belong to a business page (BusinessSubscription), not to a
 * person: one owner can run several businesses, each on its own plan.
 * Every billing path (upgrade, admin override, boosts,
 * the expiry job) goes through these helpers so they agree on which
 * business is meant and how a period is counted.
 */

export type BillingCycle = "MONTHLY" | "ANNUAL";

export type BusinessChoice =
  | { ok: true; business: { id: string; name: string; ownerId: string } }
  | { ok: false; code: "no_business" | "choose_business" | "not_found" };

// The business a request is about: the one named (if the user owns it), or
// the user's only business. Several and none named: the caller must ask.
export async function resolveOwnedBusiness(
  userId: string,
  businessProfileId?: string | null,
): Promise<BusinessChoice> {
  const owned = await db.businessProfile.findMany({
    where: { ownerId: userId, status: { not: "DISABLED" } },
    select: { id: true, name: true, ownerId: true },
    orderBy: { createdAt: "asc" },
  });
  if (businessProfileId) {
    const business = owned.find((b) => b.id === businessProfileId);
    return business ? { ok: true, business } : { ok: false, code: "not_found" };
  }
  if (owned.length === 1) return { ok: true, business: owned[0] };
  return {
    ok: false,
    code: owned.length === 0 ? "no_business" : "choose_business",
  };
}

export const BUSINESS_CHOICE_MESSAGE: Record<
  Exclude<BusinessChoice, { ok: true }>["code"],
  string
> = {
  no_business:
    "Plans are for business pages. Create your business page first, then choose a plan for it.",
  choose_business:
    "You have more than one business page. Choose which one this plan is for.",
  not_found: "That business page was not found on your account.",
};

// What a plan costs for a cycle. Annual falls back to 12 x monthly when the
// plan has no annual price.
export function planPrice(plan: SubscriptionPlan, cycle: BillingCycle) {
  if (cycle === "ANNUAL") {
    return {
      usd: Number(plan.priceUsdAnnual ?? Number(plan.priceUsd) * 12),
      lkr: Number(plan.priceLkrAnnual ?? Number(plan.priceLkr) * 12),
      months: 12,
    };
  }
  return { usd: Number(plan.priceUsd), lkr: Number(plan.priceLkr), months: 1 };
}

export function addMonths(from: Date, months: number): Date {
  const end = new Date(from);
  end.setMonth(end.getMonth() + months);
  return end;
}

/*
 * Starts (or replaces) a business's plan from now for `months`. Used by free
 * and fully discounted upgrades, and by the admin override (which is how a
 * plan paid on WhatsApp is switched on). Returns the subscription row.
 */
export async function activateBusinessPlan(
  tx: Prisma.TransactionClient | typeof db,
  args: {
    businessProfileId: string;
    plan: SubscriptionPlan;
    months: number;
    couponRedemptionId?: string;
  },
) {
  const now = new Date();
  const data = {
    planId: args.plan.id,
    status: "ACTIVE" as const,
    currentPeriodStart: now,
    currentPeriodEnd: addMonths(now, args.months),
    freeBoostsRemaining: args.plan.monthlyFreeBoosts,
    cancelAtPeriodEnd: false,
    ...(args.couponRedemptionId
      ? { couponRedemptionId: args.couponRedemptionId }
      : {}),
  };
  return tx.businessSubscription.upsert({
    where: { businessProfileId: args.businessProfileId },
    create: { businessProfileId: args.businessProfileId, ...data },
    update: data,
    include: { plan: true },
  });
}
