export interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  priceUsd: number;
  priceLkr: number;
  priceUsdAnnual: number | null;
  priceLkrAnnual: number | null;
  maxListings: number | null;
  maxBranches: number | null;
  hasBusinessProfile: boolean;
  hasAnalytics: boolean;
  hasRealtimeAlerts: boolean;
  hasDigitalMarketing: boolean;
  hasWhatsappBroadcast: boolean;
  hasPrioritySearch: boolean;
  hasApiAccess: boolean;
  monthlyFreeBoosts: number;
  supportLevel: string;
  badgeFastTrack: boolean;
  badgeFree: boolean;
  homepageFeatureWeekly: boolean;
  sortOrder: number;
}

export interface ISellerSubscription {
  id: string;
  planId: string;
  plan: ISubscriptionPlan;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "TRIALING";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  freeBoostsRemaining: number;
}

export interface ICouponCode {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_USD" | "FREE_MONTHS";
  discountValue: number;
  applicablePlanIds: string[];
  billingCycle: "MONTHLY" | "ANNUAL" | null;
  maxUses?: number | null;
  usesCount: number;
  maxUsesPerUser: number;
  validFrom?: Date | string | null;
  validUntil?: Date | string | null;
  isActive: boolean;
}

export interface ICouponValidationResult {
  valid: boolean;
  coupon?: ICouponCode;
  discountUsd?: number;
  discountLkr?: number;
  finalPriceUsd?: number;
  finalPriceLkr?: number;
  freeMonths?: number;
  errorMessage?: string;
}
