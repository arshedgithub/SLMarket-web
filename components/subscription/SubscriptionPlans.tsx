"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, X, Zap, Crown, Building2, Gift } from "lucide-react";

export interface PlanPricing {
  usd: number;
  lkr: number;
  couponApplies: boolean;
  discountedUsd?: number;
  discountedLkr?: number;
  freeMonths?: number;
}

export interface PlanData {
  id: string;
  name: string;
  displayName: string;
  maxListings: number | null;
  maxReelsPerMonth: number | null;
  listingDurationDays: number | null;
  hasShopProfile: boolean;
  hasAnalytics: boolean;
  hasRealtimeAlerts: boolean;
  hasDigitalMarketing: boolean;
  hasWhatsappBroadcast: boolean;
  hasPrioritySearch: boolean;
  hasApiAccess: boolean;
  hasWholesaleListings: boolean;
  monthlyFreeBoosts: number;
  supportLevel: string;
  badgeFastTrack: boolean;
  homepageFeatureWeekly: boolean;
  pricing: Record<"MONTHLY" | "ANNUAL", PlanPricing>;
}

export interface CouponInfo {
  code: string;
  valid: boolean;
  errorMessage?: string;
  description?: string | null;
  discountType?: "PERCENTAGE" | "FIXED_USD" | "FREE_MONTHS";
  discountValue?: number;
  billingCycle?: "MONTHLY" | "ANNUAL" | null;
}

const PLAN_ICONS: Record<string, React.ElementType | null> = {
  free: null,
  basic: Zap,
  pro: Crown,
  dealer: Building2,
};

const SUPPORT_LABELS: Record<string, string> = {
  community: "Community",
  email: "Email",
  priority: "Priority",
  dedicated: "Dedicated",
};

function formatPrice(amount: number, currency: "usd" | "lkr"): string {
  return currency === "lkr"
    ? `LKR ${amount.toLocaleString()}`
    : `$${amount.toFixed(2)}`;
}

function getFeatureRows(
  plan: PlanData,
): { label: string; included: boolean }[] {
  const reelsIncluded =
    plan.maxReelsPerMonth === null || plan.maxReelsPerMonth > 0;
  const boostsIncluded = plan.monthlyFreeBoosts > 0;

  return [
    {
      label: plan.maxListings
        ? `${plan.maxListings} active listing${plan.maxListings === 1 ? "" : "s"}`
        : "Unlimited listings",
      included: true,
    },
    {
      label: plan.listingDurationDays
        ? `Listings stay live for ${plan.listingDurationDays} days`
        : "Listings never expire",
      included: true,
    },
    { label: "shop profile page", included: plan.hasShopProfile },
    { label: "analytics dashboard", included: plan.hasAnalytics },
    { label: "real-time price alerts", included: plan.hasRealtimeAlerts },
    {
      label: "automated social media sharing",
      included: plan.hasDigitalMarketing,
    },
    {
      label: "WhatsApp broadcast to buyers",
      included: plan.hasWhatsappBroadcast,
    },
    { label: "priority placement in search", included: plan.hasPrioritySearch },
    { label: "API access for integrations", included: plan.hasApiAccess },
    { label: "wholesale / bulk listings", included: plan.hasWholesaleListings },
    {
      label: reelsIncluded
        ? plan.maxReelsPerMonth === null
          ? "Unlimited reels"
          : `${plan.maxReelsPerMonth} reel${plan.maxReelsPerMonth === 1 ? "" : "s"}/month`
        : "reel uploads",
      included: reelsIncluded,
    },
    {
      label: boostsIncluded
        ? `${plan.monthlyFreeBoosts} free boost${plan.monthlyFreeBoosts === 1 ? "" : "s"}/month`
        : "free monthly boosts",
      included: boostsIncluded,
    },
    {
      label: `${SUPPORT_LABELS[plan.supportLevel] ?? plan.supportLevel} support`,
      included: true,
    },
    { label: "fast-track listing approval", included: plan.badgeFastTrack },
    { label: "weekly homepage feature", included: plan.homepageFeatureWeekly },
  ];
}

export function SubscriptionPlans({
  plans,
  couponInfo,
  currency,
  isSriLankanSeller,
  isLoggedIn,
  currentPlanId,
}: {
  plans: PlanData[];
  couponInfo: CouponInfo | null;
  currency: "usd" | "lkr";
  isSriLankanSeller: boolean;
  isLoggedIn: boolean;
  currentPlanId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [cycle, setCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [couponInput, setCouponInput] = useState(couponInfo?.code ?? "");

  useEffect(() => {
    setCouponInput(couponInfo?.code ?? "");
  }, [couponInfo?.code]);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const applyCoupon = () => {
    const code = couponInput.trim();
    setParam("couponCode", code ? code.toUpperCase() : null);
  };

  const recommendedPlanId = plans.find((p) => p.name === "pro")?.id;

  return (
    <div className="space-y-8">
      {/* Coupon code input */}
      <div className="max-w-md mx-auto w-full">
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
            placeholder="Have a coupon code?"
            className="flex-1 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyCoupon}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
          >
            Apply Coupon
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1">
          <button
            onClick={() => setCycle("MONTHLY")}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              cycle === "MONTHLY"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("ANNUAL")}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              cycle === "ANNUAL"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Annual
          </button>
        </div>

        {isSriLankanSeller && (
          <div className="inline-flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1">
            <button
              onClick={() => setParam("price", null)}
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                currency === "usd"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setParam("price", "lkr")}
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                currency === "lkr"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              LKR
            </button>
          </div>
        )}
      </div>

      {/* Coupon banner */}
      {couponInfo && (
        <div
          className={`max-w-2xl mx-auto rounded-lg px-4 py-3 text-sm text-center border ${
            couponInfo.valid
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          <Gift className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          {couponInfo.valid ? (
            <>
              Coupon{" "}
              <span className="font-mono font-semibold">{couponInfo.code}</span>{" "}
              applied
              {couponInfo.description ? `: ${couponInfo.description}` : ""}.
              {couponInfo.billingCycle === "ANNUAL" && cycle === "MONTHLY" && (
                <span className="block mt-1">
                  Switch to Annual billing to use this coupon.
                </span>
              )}
              {couponInfo.billingCycle !== "ANNUAL" && cycle === "ANNUAL" && (
                <span className="block mt-1">
                  Switch to Monthly billing to use this coupon.
                </span>
              )}
            </>
          ) : (
            <>
              Coupon{" "}
              <span className="font-mono font-semibold">{couponInfo.code}</span>
              : {couponInfo.errorMessage}
            </>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.name];
          const pricing = plan.pricing[cycle];
          const showDiscount =
            pricing.couponApplies &&
            pricing.discountedLkr !== undefined &&
            pricing.discountedLkr !== pricing.lkr;
          const displayLkr = showDiscount
            ? pricing.discountedLkr!
            : pricing.lkr;
          const displayUsd = showDiscount
            ? pricing.discountedUsd!
            : pricing.usd;
          const displayPrice = currency === "lkr" ? displayLkr : displayUsd;
          const originalPrice = currency === "lkr" ? pricing.lkr : pricing.usd;
          const isFree = displayPrice === 0 && pricing.usd > 0;
          const isRecommended = plan.id === recommendedPlanId;
          const isCurrent = !!currentPlanId && plan.id === currentPlanId;

          // Coupon usable on the (monthly-only) checkout flow regardless of which cycle is being previewed
          const couponUsableAtCheckout =
            plan.pricing.MONTHLY.couponApplies && couponInfo?.valid;
          const upgradeParams = new URLSearchParams();
          upgradeParams.set("planId", plan.id);
          if (couponUsableAtCheckout)
            upgradeParams.set("couponCode", couponInfo!.code);
          if (currency === "lkr") upgradeParams.set("price", "lkr");
          const upgradeHref = `/dashboard/upgrade?${upgradeParams.toString()}`;

          const handleSelect = () => {
            if (plan.name === "free" || isCurrent) return;
            router.push(upgradeHref);
          };

          return (
            <div
              key={plan.id}
              onClick={handleSelect}
              className={`relative rounded-xl p-5 bg-white dark:bg-gray-900 border transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg ${
                plan.name !== "free" && !isCurrent ? "cursor-pointer" : ""
              } ${
                isCurrent
                  ? "border-green-600 dark:border-green-500 ring-2 ring-green-600/20"
                  : isRecommended
                    ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20"
                    : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                  Current Plan
                </div>
              ) : (
                isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    Recommended
                  </div>
                )
              )}

              <div className="flex items-center gap-2 mb-3">
                {Icon && <Icon className="w-4 h-4" />}
                <span className="font-bold text-gray-900 dark:text-white">
                  {plan.displayName}
                </span>
              </div>

              <div className="mb-4 min-h-[64px]">
                {pricing.usd === 0 ? (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    Free
                  </span>
                ) : isFree ? (
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      Free
                    </span>
                    <span className="text-xs text-gray-400 line-through ml-2">
                      {formatPrice(originalPrice, currency)}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(displayPrice, currency)}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{cycle === "MONTHLY" ? "mo" : "yr"}
                    </span>
                    {showDiscount && (
                      <span className="text-xs text-gray-400 line-through ml-2">
                        {formatPrice(originalPrice, currency)}
                      </span>
                    )}
                    {pricing.couponApplies && pricing.freeMonths ? (
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        + {pricing.freeMonths} free month
                        {pricing.freeMonths === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              <ul className="space-y-1.5 text-sm">
                {getFeatureRows(plan).map((row, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {row.included ? (
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 dark:text-gray-700 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        row.included
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-400 dark:text-gray-600"
                      }
                    >
                      {row.included
                        ? row.label.charAt(0).toUpperCase() + row.label.slice(1)
                        : `No ${row.label}`}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold rounded-lg cursor-default"
                  >
                    <Check className="w-4 h-4" />
                    Current Plan
                  </button>
                ) : plan.name === "free" ? (
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Start Free
                  </Link>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(upgradeHref);
                    }}
                    className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Choose Plan
                  </button>
                )}
                {cycle === "ANNUAL" &&
                  pricing.couponApplies &&
                  !couponUsableAtCheckout && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Annual checkout coming soon
                    </p>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
