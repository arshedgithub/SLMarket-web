"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Zap, Crown, Building2, Gift, Loader2 } from "lucide-react";
import { ISubscriptionPlan } from "@/types";

const PLAN_ICONS: Record<string, React.ElementType | null> = {
  free: null,
  basic: Zap,
  pro: Crown,
  dealer: Building2,
};

const PLAN_COLORS: Record<string, string> = {
  free: "border-gray-200",
  basic: "border-blue-400",
  pro: "border-purple-500",
  dealer: "border-amber-500",
};

const PLAN_BADGE: Record<string, string> = {
  basic: "bg-blue-600 text-white",
  pro: "bg-purple-600 text-white",
  dealer: "bg-amber-500 text-white",
};

function UpgradePageContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ISubscriptionPlan | null>(
    null,
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    finalPriceUsd?: number;
    finalPriceLkr?: number;
    freeMonths?: number;
    errorMessage?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [autoRedirected, setAutoRedirected] = useState(false);
  // Plans belong to business pages: which of the owner's pages this is for.
  const [businesses, setBusinesses] = useState<
    { id: string; name: string; planId: string | null }[] | null
  >(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/subscriptions/plans")
      .then((r) => r.json())
      .then(setPlans);
  }, []);

  // Always read fresh from the DB — session.user.planName is cached at
  // sign-in and goes stale if the plan changes server-side (e.g. an admin
  // override), so it can't be trusted here.
  useEffect(() => {
    const wanted = searchParams.get("business");
    fetch(
      `/api/subscriptions${wanted ? `?business=${encodeURIComponent(wanted)}` : ""}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setBusinesses(data?.businesses ?? []);
        setBusinessId(data?.businessProfileId ?? null);
        setCurrentPlanId(data?.subscription?.planId ?? null);
      })
      .catch(() => {
        setBusinesses([]);
        setCurrentPlanId(null);
      });
  }, [searchParams]);

  const resolvedCurrentPlanId =
    currentPlanId ?? plans.find((p) => p.name === "free")?.id ?? null;

  const validateCoupon = useCallback(
    async (planOverride?: ISubscriptionPlan, codeOverride?: string) => {
      const plan = planOverride ?? selectedPlan;
      const code = codeOverride ?? couponCode;
      if (!plan || !code.trim()) return;
      setCouponLoading(true);
      try {
        const res = await fetch("/api/subscriptions/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, planId: plan.id }),
        });
        const data = await res.json();
        setCouponResult(data);
      } finally {
        setCouponLoading(false);
      }
    },
    [selectedPlan, couponCode],
  );

  // Pre-select plan/coupon from ?planId=&couponCode= (linked from /subscription)
  useEffect(() => {
    if (prefilled || plans.length === 0) return;
    setPrefilled(true);

    const planId = searchParams.get("planId");
    const coupon = searchParams.get("couponCode");

    const plan = planId
      ? plans.find(
          (p) => p.id === planId && p.name !== "free" && p.id !== currentPlanId,
        )
      : undefined;
    if (plan) setSelectedPlan(plan);

    if (coupon) {
      const code = coupon.toUpperCase();
      setCouponCode(code);
      if (plan) validateCoupon(plan, code);
    }
  }, [plans, prefilled, searchParams, validateCoupon, currentPlanId]);

  const handleUpgrade = useCallback(async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          gateway: "PAYHERE",
          couponCode: couponCode || undefined,
          businessProfileId: businessId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.message ??
            "We couldn't start the upgrade. Please try again in a moment.",
        );
        return;
      }

      if (data.activated) {
        window.location.href = "/dashboard?payment=success";
        return;
      }

      if (data.gateway === "payhere" && data.formData) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.checkoutUrl;
        Object.entries(data.formData).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v as string;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPlan, couponCode, businessId]);

  // Coming from /subscription with a plan (and optionally a coupon) pre-selected —
  // skip the extra click and go straight to the PayHere checkout.
  useEffect(() => {
    if (!prefilled || autoRedirected || !selectedPlan) return;
    if (businesses === null || businesses.length !== 1) return;
    if (couponCode && !couponResult) return;
    setAutoRedirected(true);
    handleUpgrade();
  }, [
    prefilled,
    autoRedirected,
    selectedPlan,
    businesses,
    couponCode,
    couponResult,
    handleUpgrade,
  ]);

  const getDisplayPrice = (plan: ISubscriptionPlan) => {
    if (!couponResult?.valid || selectedPlan?.id !== plan.id) {
      return { usd: plan.priceUsd, lkr: plan.priceLkr };
    }
    return {
      usd: couponResult.finalPriceUsd,
      lkr: couponResult.finalPriceLkr,
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plans & Billing
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose the plan that fits your business. Cancel anytime.
          </p>
        </div>
        <Link
          href="/subscription"
          className="shrink-0 text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
        >
          Compare all plans →
        </Link>
      </div>

      {businesses?.length === 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Plans are for business pages</p>
          <p className="mt-0.5">
            Create your business page first, then choose a plan for it. Personal
            ads stay free.
          </p>
          <Link
            href="/business/new"
            className="mt-2 inline-flex font-semibold text-amber-900 underline"
          >
            Create a business page
          </Link>
        </div>
      )}

      {businesses && businesses.length > 1 && (
        <label className="block text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Business page this plan is for
          </span>
          <select
            value={businessId ?? ""}
            onChange={(e) => {
              const b = businesses.find((x) => x.id === e.target.value);
              setBusinessId(b?.id ?? null);
              setCurrentPlanId(b?.planId ?? null);
            }}
            className="mt-1 block h-11 w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {prefilled &&
        selectedPlan &&
        !autoRedirected &&
        businesses?.length === 1 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting you to secure payment for {selectedPlan.displayName}...
          </div>
        )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.name];
          const isSelected = selectedPlan?.id === plan.id;
          const isCurrent = plan.id === resolvedCurrentPlanId;
          const { usd, lkr } = getDisplayPrice(plan);

          return (
            <div
              key={plan.id}
              onClick={() =>
                plan.name !== "free" && !isCurrent && setSelectedPlan(plan)
              }
              className={`relative border-2 rounded-xl p-5 transition-all ${
                isCurrent
                  ? "cursor-default border-green-500 bg-white dark:bg-gray-900"
                  : plan.name === "free"
                    ? "cursor-default opacity-60 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    : `cursor-pointer ${
                        isSelected
                          ? `${PLAN_COLORS[plan.name]} bg-white dark:bg-gray-900 shadow-lg scale-[1.01]`
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                      }`
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                  Current Plan
                </div>
              ) : (
                plan.name === "pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )
              )}

              <div className="flex items-center gap-2 mb-3">
                {Icon && <Icon className="w-4 h-4" />}
                <span className="font-bold text-gray-900 dark:text-white">
                  {plan.displayName}
                </span>
                {PLAN_BADGE[plan.name] && (
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${PLAN_BADGE[plan.name]}`}
                  >
                    {plan.name}
                  </span>
                )}
              </div>

              <div className="mb-4">
                {plan.priceUsd === 0 ? (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    Free
                  </span>
                ) : (
                  <>
                    {couponResult?.valid &&
                    isSelected &&
                    couponResult.finalPriceUsd === 0 ? (
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          Free
                        </span>
                        <span className="text-xs text-gray-400 line-through ml-2">
                          ${plan.priceUsd}/mo
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          LKR {lkr?.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/mo</span>
                        {couponResult?.valid &&
                          isSelected &&
                          lkr !== plan.priceLkr && (
                            <span className="text-xs text-gray-400 line-through ml-2">
                              LKR {plan.priceLkr?.toLocaleString()}
                            </span>
                          )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          ≈ USD ${usd?.toFixed(2)}/mo
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-1.5 text-sm">
                {[
                  {
                    show: true,
                    text: plan.maxListings
                      ? `${plan.maxListings} active listings`
                      : "Unlimited listings",
                  },
                  { show: !!plan.hasBusinessProfile, text: "Business page" },
                  {
                    show: !!plan.hasBusinessProfile && plan.maxBranches !== 0,
                    text:
                      plan.maxBranches == null
                        ? "Unlimited branches"
                        : `${plan.maxBranches} branch${plan.maxBranches === 1 ? "" : "es"}`,
                  },
                  { show: !!plan.hasAnalytics, text: "Analytics dashboard" },
                  {
                    show: !!plan.hasDigitalMarketing,
                    text: "Auto social sharing",
                  },
                  {
                    show: plan.monthlyFreeBoosts > 0,
                    text: `${plan.monthlyFreeBoosts} free boosts/month`,
                  },
                  {
                    show: !!plan.hasPrioritySearch,
                    text: "Priority search placement",
                  },
                  {
                    show: !!plan.hasRealtimeAlerts,
                    text: "Real-time price alerts",
                  },
                  {
                    show: !!plan.hasWhatsappBroadcast,
                    text: "WhatsApp broadcast",
                  },
                  { show: !!plan.hasApiAccess, text: "API access" },
                  {
                    show: !!plan.badgeFastTrack,
                    text: "Fast-track verification",
                  },
                  { show: !!plan.badgeFree, text: "Free seller badge" },
                  {
                    show: !!plan.homepageFeatureWeekly,
                    text: "Weekly homepage feature",
                  },
                  {
                    show: plan.supportLevel !== "community",
                    text: `${(plan.supportLevel ?? "community").charAt(0).toUpperCase() + (plan.supportLevel ?? "").slice(1)} support`,
                  },
                ]
                  .filter((f) => f.show && f.text)
                  .map((f) => (
                    <li key={f.text} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {f.text}
                      </span>
                    </li>
                  ))}
              </ul>

              {isCurrent ? (
                <div className="mt-4 text-center">
                  <span className="text-xs font-semibold text-green-600">
                    Your current plan
                  </span>
                </div>
              ) : (
                isSelected && (
                  <div className="mt-4 text-center">
                    <span className="text-xs font-semibold text-blue-600">
                      Selected ✓
                    </span>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Coupon + checkout */}
      {selectedPlan && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Complete your upgrade to {selectedPlan.displayName}
          </h2>

          {/* Coupon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Gift className="w-4 h-4 inline mr-1" />
              Coupon code (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponResult(null);
                }}
                placeholder="Enter code e.g. LAUNCH50"
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => validateCoupon()}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {couponLoading ? "Checking..." : "Apply"}
              </button>
            </div>
            {couponResult && (
              <p
                className={`text-xs mt-1.5 ${couponResult.valid ? "text-green-600" : "text-red-500"}`}
              >
                {couponResult.valid
                  ? couponResult.freeMonths && couponResult.freeMonths > 0
                    ? `${couponResult.freeMonths} free months applied!`
                    : couponResult.finalPriceUsd === 0
                      ? "100% off, this plan is now FREE!"
                      : `Saved LKR ${(selectedPlan.priceLkr - (couponResult.finalPriceLkr ?? 0)).toLocaleString()}`
                  : couponResult.errorMessage}
              </p>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              PayHere: Secure Payment
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              Visa · Mastercard · FriMi · genie · Ezcash · mCash
            </p>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading || businesses?.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
          >
            {loading
              ? "Processing..."
              : couponResult?.valid && couponResult.finalPriceLkr === 0
                ? "Activate Free Plan"
                : `Pay LKR ${getDisplayPrice(selectedPlan).lkr?.toLocaleString()}`}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Cancel anytime. No refunds on used months.
          </p>
        </div>
      )}
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradePageContent />
    </Suspense>
  );
}
