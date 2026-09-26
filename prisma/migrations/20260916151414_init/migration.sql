-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SELLER', 'BUYER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_USD', 'FREE_MONTHS');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('GEM', 'JEWELLERY', 'PRECIOUS_METAL', 'SERVICE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'PAUSED', 'EXPIRED', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BoostType" AS ENUM ('TOP_SEARCH_1D', 'TOP_SEARCH_3D', 'TOP_SEARCH_7D', 'CATEGORY_BANNER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Metal" AS ENUM ('GOLD_24K', 'GOLD_22K', 'SILVER', 'PLATINUM');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('ABOVE', 'BELOW', 'DAILY_DIGEST');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'CONVERTED', 'REWARDED');

-- CreateEnum
CREATE TYPE "SocialShareStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'BOOST', 'VERIFICATION_BADGE', 'SPONSORED_POST');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('PAYHERE', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "country" TEXT,
    "locationCity" TEXT,
    "shopSlug" TEXT,
    "shopBio" TEXT,
    "shopBannerUrl" TEXT,
    "whatsappNumber" TEXT,
    "specialties" TEXT[],
    "shopMetaTitle" TEXT,
    "shopMetaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" TEXT,
    "ip" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "priceUsd" DECIMAL(8,2) NOT NULL,
    "priceLkr" DECIMAL(10,2) NOT NULL,
    "priceUsdAnnual" DECIMAL(8,2),
    "priceLkrAnnual" DECIMAL(10,2),
    "maxListings" INTEGER,
    "maxReelsPerMonth" INTEGER,
    "maxImagesPerListing" INTEGER,
    "maxCertificationImages" INTEGER,
    "hasShopProfile" BOOLEAN NOT NULL DEFAULT false,
    "hasAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "hasRealtimeAlerts" BOOLEAN NOT NULL DEFAULT false,
    "hasDigitalMarketing" BOOLEAN NOT NULL DEFAULT false,
    "hasWhatsappBroadcast" BOOLEAN NOT NULL DEFAULT false,
    "hasPrioritySearch" BOOLEAN NOT NULL DEFAULT false,
    "hasApiAccess" BOOLEAN NOT NULL DEFAULT false,
    "hasWholesaleListings" BOOLEAN NOT NULL DEFAULT false,
    "listingDurationDays" INTEGER,
    "monthlyFreeBoosts" INTEGER NOT NULL DEFAULT 0,
    "freeBoostsRemaining" INTEGER NOT NULL DEFAULT 0,
    "supportLevel" TEXT NOT NULL DEFAULT 'community',
    "badgeFastTrack" BOOLEAN NOT NULL DEFAULT false,
    "badgeFree" BOOLEAN NOT NULL DEFAULT false,
    "homepageFeatureWeekly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_subscriptions" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "freeBoostsRemaining" INTEGER NOT NULL DEFAULT 0,
    "stripeSubscriptionId" TEXT,
    "payhereOrderId" TEXT,
    "couponRedemptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(8,2) NOT NULL,
    "applicablePlanIds" TEXT[],
    "billingCycle" "BillingCycle",
    "maxUses" INTEGER,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discountAppliedUsd" DECIMAL(8,2) NOT NULL,
    "discountAppliedLkr" DECIMAL(10,2) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "images" TEXT[],
    "reelUrl" TEXT,
    "category" "ListingCategory" NOT NULL,
    "gemType" TEXT,
    "gemOrigin" TEXT DEFAULT 'Sri Lanka',
    "caratWeight" DECIMAL(8,3),
    "treatmentStatus" TEXT,
    "certificationBody" TEXT,
    "certificationNumber" TEXT,
    "metalType" TEXT,
    "metalPurity" TEXT,
    "weightGrams" DECIMAL(8,3),
    "weightSovereigns" DECIMAL(8,4),
    "currentLocation" TEXT,
    "certificationImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dimensionL" DECIMAL(6,2),
    "dimensionW" DECIMAL(6,2),
    "dimensionH" DECIMAL(6,2),
    "isLotSale" BOOLEAN NOT NULL DEFAULT false,
    "lotSize" INTEGER,
    "contactPhone" TEXT,
    "hideContactPhone" BOOLEAN NOT NULL DEFAULT false,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappNumber" TEXT,
    "jewelleryType" TEXT,
    "ringSize" TEXT,
    "serviceType" TEXT,
    "pricingType" TEXT,
    "serviceArea" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "turnaroundTime" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "rejectionReason" TEXT,
    "isWholesale" BOOLEAN NOT NULL DEFAULT false,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "boostEndAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "schemaMarkup" JSONB,
    "isFeaturedHomepage" BOOLEAN NOT NULL DEFAULT false,
    "homepageFeatureEnd" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reel_uploads" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reel_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT,
    "buyerPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "buyerEmail" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fcm_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fcm_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_boosts" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "boostType" "BoostType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isFreeBoost" BOOLEAN NOT NULL DEFAULT false,
    "amountPaidUsd" DECIMAL(8,2),
    "amountPaidLkr" DECIMAL(10,2),
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "nicOrPassportUrl" TEXT,
    "businessRegUrl" TEXT,
    "gemCertUrl" TEXT,
    "adminNotes" TEXT,
    "amountPaidUsd" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "paymentRef" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metal_prices" (
    "id" TEXT NOT NULL,
    "metal" "Metal" NOT NULL,
    "priceUsdPerGram" DECIMAL(12,4) NOT NULL,
    "priceLkrPerGram" DECIMAL(12,2) NOT NULL,
    "changePercent24h" DECIMAL(6,3),
    "source" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metal_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metal_price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metal" "Metal" NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "thresholdUsd" DECIMAL(12,4),
    "notifyVia" TEXT NOT NULL DEFAULT 'push',
    "fcmToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metal_price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "authorId" TEXT NOT NULL,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsorSellerId" TEXT,
    "sponsorAmountUsd" DECIMAL(8,2),
    "featuredImageUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "schemaMarkup" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_analytics_daily" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "listingViews" INTEGER NOT NULL DEFAULT 0,
    "enquiriesReceived" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "seller_analytics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_views" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "viewerIp" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerSellerId" TEXT NOT NULL,
    "referredSellerId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "rewardType" TEXT,
    "convertedAt" TIMESTAMP(3),
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_share_queue" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT,
    "platform" TEXT NOT NULL,
    "status" "SocialShareStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "postUrl" TEXT,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_share_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_broadcast_opt_ins" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "optedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_broadcast_opt_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amountUsd" DECIMAL(8,2) NOT NULL,
    "amountLkr" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "gateway" "PaymentGateway" NOT NULL,
    "gatewayRef" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlanCoupons" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_shopSlug_key" ON "users"("shopSlug");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionId_key" ON "user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seller_subscriptions_sellerId_key" ON "seller_subscriptions"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_subscriptions_couponRedemptionId_key" ON "seller_subscriptions"("couponRedemptionId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_codes_code_key" ON "coupon_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_redemptions_couponId_userId_key" ON "coupon_redemptions"("couponId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_sellerId_idx" ON "listings"("sellerId");

-- CreateIndex
CREATE INDEX "listings_status_category_createdAt_idx" ON "listings"("status", "category", "createdAt");

-- CreateIndex
CREATE INDEX "listings_status_isFeaturedHomepage_isBoosted_createdAt_idx" ON "listings"("status", "isFeaturedHomepage", "isBoosted", "createdAt");

-- CreateIndex
CREATE INDEX "listings_status_createdAt_idx" ON "listings"("status", "createdAt");

-- CreateIndex
CREATE INDEX "enquiries_sellerId_isRead_idx" ON "enquiries"("sellerId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "fcm_tokens_token_key" ON "fcm_tokens"("token");

-- CreateIndex
CREATE INDEX "fcm_tokens_userId_idx" ON "fcm_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests_sellerId_key" ON "verification_requests"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "seller_analytics_daily_sellerId_date_key" ON "seller_analytics_daily"("sellerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referredSellerId_key" ON "referrals"("referredSellerId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referralCode_key" ON "referrals"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_broadcast_opt_ins_buyerId_sellerId_key" ON "whatsapp_broadcast_opt_ins"("buyerId", "sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "_PlanCoupons_AB_unique" ON "_PlanCoupons"("A", "B");

-- CreateIndex
CREATE INDEX "_PlanCoupons_B_index" ON "_PlanCoupons"("B");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_subscriptions" ADD CONSTRAINT "seller_subscriptions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_subscriptions" ADD CONSTRAINT "seller_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_subscriptions" ADD CONSTRAINT "seller_subscriptions_couponRedemptionId_fkey" FOREIGN KEY ("couponRedemptionId") REFERENCES "coupon_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reel_uploads" ADD CONSTRAINT "reel_uploads_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reel_uploads" ADD CONSTRAINT "reel_uploads_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_boosts" ADD CONSTRAINT "listing_boosts_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_boosts" ADD CONSTRAINT "listing_boosts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metal_price_alerts" ADD CONSTRAINT "metal_price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_sponsorSellerId_fkey" FOREIGN KEY ("sponsorSellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_analytics_daily" ADD CONSTRAINT "seller_analytics_daily_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerSellerId_fkey" FOREIGN KEY ("referrerSellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredSellerId_fkey" FOREIGN KEY ("referredSellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_share_queue" ADD CONSTRAINT "social_share_queue_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_broadcast_opt_ins" ADD CONSTRAINT "whatsapp_broadcast_opt_ins_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_broadcast_opt_ins" ADD CONSTRAINT "whatsapp_broadcast_opt_ins_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanCoupons" ADD CONSTRAINT "_PlanCoupons_A_fkey" FOREIGN KEY ("A") REFERENCES "coupon_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanCoupons" ADD CONSTRAINT "_PlanCoupons_B_fkey" FOREIGN KEY ("B") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
