/*
  Warnings:

  - The values [SPONSORED_POST] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `caratWeight` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `certificationBody` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `certificationImages` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `certificationNumber` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocation` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionH` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionL` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionW` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `gemOrigin` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `gemType` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `hideContactPhone` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `isLotSale` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `isWholesale` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `jewelleryType` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `lotSize` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `metalPurity` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `metalType` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `reelUrl` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `ringSize` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `serviceArea` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `treatmentStatus` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `turnaroundTime` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `weightGrams` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `weightSovereigns` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappEnabled` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappNumber` on the `listings` table. All the data in the column will be lost.
  - The `pricingType` column on the `listings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `freeBoostsRemaining` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `hasShopProfile` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `hasWholesaleListings` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `maxCertificationImages` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `maxReelsPerMonth` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locationCity` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shopBannerUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shopBio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shopMetaDescription` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shopMetaTitle` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `shopSlug` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gemCertUrl` on the `verification_requests` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `verification_requests` table. All the data in the column will be lost.
  - You are about to drop the `blog_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metal_price_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metal_prices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reel_uploads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seller_subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[businessProfileId]` on the table `verification_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryId` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessProfileId` to the `verification_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PhoneOwnerType" AS ENUM ('USER', 'BUSINESS_PROFILE');

-- CreateEnum
CREATE TYPE "BusinessProfileTier" AS ENUM ('STANDARD', 'VERIFIED', 'PREMIUM', 'TOP_RATED');

-- CreateEnum
CREATE TYPE "BusinessProfileStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'STARTING_FROM', 'CONTACT', 'FREE');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('NONE', 'DISCOUNT', 'COUPON');

-- CreateEnum
CREATE TYPE "ListingLocationType" AS ENUM ('SINGLE', 'BRANCHES', 'ISLANDWIDE');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('SUBSCRIPTION', 'BOOST', 'VERIFICATION_BADGE');
ALTER TABLE "payment_transactions" ALTER COLUMN "type" TYPE "PaymentType_new" USING ("type"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "PaymentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_sponsorSellerId_fkey";

-- DropForeignKey
ALTER TABLE "metal_price_alerts" DROP CONSTRAINT "metal_price_alerts_userId_fkey";

-- DropForeignKey
ALTER TABLE "reel_uploads" DROP CONSTRAINT "reel_uploads_listingId_fkey";

-- DropForeignKey
ALTER TABLE "reel_uploads" DROP CONSTRAINT "reel_uploads_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "seller_subscriptions" DROP CONSTRAINT "seller_subscriptions_couponRedemptionId_fkey";

-- DropForeignKey
ALTER TABLE "seller_subscriptions" DROP CONSTRAINT "seller_subscriptions_planId_fkey";

-- DropForeignKey
ALTER TABLE "seller_subscriptions" DROP CONSTRAINT "seller_subscriptions_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_sellerId_fkey";

-- DropIndex
DROP INDEX "listings_status_category_createdAt_idx";

-- DropIndex
DROP INDEX "users_shopSlug_key";

-- DropIndex
DROP INDEX "verification_requests_sellerId_key";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "caratWeight",
DROP COLUMN "category",
DROP COLUMN "certificationBody",
DROP COLUMN "certificationImages",
DROP COLUMN "certificationNumber",
DROP COLUMN "currentLocation",
DROP COLUMN "dimensionH",
DROP COLUMN "dimensionL",
DROP COLUMN "dimensionW",
DROP COLUMN "gemOrigin",
DROP COLUMN "gemType",
DROP COLUMN "hideContactPhone",
DROP COLUMN "isLotSale",
DROP COLUMN "isWholesale",
DROP COLUMN "jewelleryType",
DROP COLUMN "lotSize",
DROP COLUMN "metalPurity",
DROP COLUMN "metalType",
DROP COLUMN "reelUrl",
DROP COLUMN "ringSize",
DROP COLUMN "serviceArea",
DROP COLUMN "serviceType",
DROP COLUMN "treatmentStatus",
DROP COLUMN "turnaroundTime",
DROP COLUMN "weightGrams",
DROP COLUMN "weightSovereigns",
DROP COLUMN "whatsappEnabled",
DROP COLUMN "whatsappNumber",
ADD COLUMN     "allowWhatsapp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "attributes" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "businessProfileId" TEXT,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "islandwideDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationType" "ListingLocationType" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "negotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalPrice" DECIMAL(12,2),
ADD COLUMN     "promotionDetail" TEXT,
ADD COLUMN     "promotionType" "PromotionType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showContactPhone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subcategoryId" TEXT NOT NULL,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'LKR',
DROP COLUMN "pricingType",
ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'FIXED',
ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "freeBoostsRemaining",
DROP COLUMN "hasShopProfile",
DROP COLUMN "hasWholesaleListings",
DROP COLUMN "maxCertificationImages",
DROP COLUMN "maxReelsPerMonth",
ADD COLUMN     "hasBusinessProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxBranches" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "country",
DROP COLUMN "isVerified",
DROP COLUMN "locationCity",
DROP COLUMN "shopBannerUrl",
DROP COLUMN "shopBio",
DROP COLUMN "shopMetaDescription",
DROP COLUMN "shopMetaTitle",
DROP COLUMN "shopSlug",
DROP COLUMN "specialties",
DROP COLUMN "verifiedAt",
DROP COLUMN "whatsappNumber",
ADD COLUMN     "district" TEXT;

-- AlterTable
ALTER TABLE "verification_requests" DROP COLUMN "gemCertUrl",
DROP COLUMN "sellerId",
ADD COLUMN     "businessProfileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "blog_posts";

-- DropTable
DROP TABLE "metal_price_alerts";

-- DropTable
DROP TABLE "metal_prices";

-- DropTable
DROP TABLE "reel_uploads";

-- DropTable
DROP TABLE "seller_subscriptions";

-- DropEnum
DROP TYPE "AlertType";

-- DropEnum
DROP TYPE "ListingCategory";

-- DropEnum
DROP TYPE "Metal";

-- DropEnum
DROP TYPE "PostStatus";

-- CreateTable
CREATE TABLE "phone_registry" (
    "phone" TEXT NOT NULL,
    "ownerType" "PhoneOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_registry_pkey" PRIMARY KEY ("phone")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "bio" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "contactPhone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "district" TEXT,
    "city" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "tier" "BusinessProfileTier" NOT NULL DEFAULT 'STANDARD',
    "status" "BusinessProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "gracePeriodEndsAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_subscriptions" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
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

    CONSTRAINT "business_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_branches" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "listing_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phone_registry_ownerId_idx" ON "phone_registry"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_slug_key" ON "business_profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_contactPhone_key" ON "business_profiles"("contactPhone");

-- CreateIndex
CREATE INDEX "business_profiles_ownerId_idx" ON "business_profiles"("ownerId");

-- CreateIndex
CREATE INDEX "business_profiles_status_idx" ON "business_profiles"("status");

-- CreateIndex
CREATE INDEX "branches_businessProfileId_idx" ON "branches"("businessProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "business_subscriptions_businessProfileId_key" ON "business_subscriptions"("businessProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "business_subscriptions_couponRedemptionId_key" ON "business_subscriptions"("couponRedemptionId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_branches_listingId_branchId_key" ON "listing_branches"("listingId", "branchId");

-- CreateIndex
CREATE INDEX "listings_businessProfileId_idx" ON "listings"("businessProfileId");

-- CreateIndex
CREATE INDEX "listings_status_categoryId_createdAt_idx" ON "listings"("status", "categoryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests_businessProfileId_key" ON "verification_requests"("businessProfileId");

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_couponRedemptionId_fkey" FOREIGN KEY ("couponRedemptionId") REFERENCES "coupon_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_branches" ADD CONSTRAINT "listing_branches_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_branches" ADD CONSTRAINT "listing_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
