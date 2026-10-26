-- CreateEnum
CREATE TYPE "SpotlightKind" AS ENUM ('IMAGE', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SpotlightStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "SpotlightDestination" AS ENUM ('STORE', 'LIST', 'AD', 'EXTERNAL');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "photoFocus" JSONB;

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "alerts" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spotlight_campaigns" (
    "id" TEXT NOT NULL,
    "kind" "SpotlightKind" NOT NULL DEFAULT 'IMAGE',
    "status" "SpotlightStatus" NOT NULL DEFAULT 'DRAFT',
    "businessProfileId" TEXT,
    "advertiser" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 3,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "headline" VARCHAR(60),
    "subline" VARCHAR(80),
    "ctaLabel" VARCHAR(24) NOT NULL DEFAULT 'View',
    "destType" "SpotlightDestination" NOT NULL,
    "destValue" TEXT NOT NULL,
    "imageId" TEXT,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "altText" TEXT,
    "imageOnly" BOOLEAN NOT NULL DEFAULT false,
    "logoId" TEXT,
    "cropOverrides" JSONB,
    "targetCategory" TEXT,
    "targetDistrict" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spotlight_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spotlight_stats_daily" (
    "spotId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "spotlight_stats_daily_pkey" PRIMARY KEY ("spotId","day")
);

-- CreateIndex
CREATE INDEX "saved_searches_alerts_idx" ON "saved_searches"("alerts");

-- CreateIndex
CREATE UNIQUE INDEX "saved_searches_userId_query_key" ON "saved_searches"("userId", "query");

-- CreateIndex
CREATE INDEX "spotlight_campaigns_status_tier_pinned_idx" ON "spotlight_campaigns"("status", "tier", "pinned");

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotlight_campaigns" ADD CONSTRAINT "spotlight_campaigns_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

