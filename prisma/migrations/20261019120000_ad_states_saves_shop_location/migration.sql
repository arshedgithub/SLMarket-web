-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "saved_ads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed_ads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adSlug" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_ads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_ads_userId_adSlug_key" ON "saved_ads"("userId", "adSlug");

-- CreateIndex
CREATE INDEX "recently_viewed_ads_userId_viewedAt_idx" ON "recently_viewed_ads"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_ads_userId_adSlug_key" ON "recently_viewed_ads"("userId", "adSlug");

-- AddForeignKey
ALTER TABLE "saved_ads" ADD CONSTRAINT "saved_ads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_ads" ADD CONSTRAINT "recently_viewed_ads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

