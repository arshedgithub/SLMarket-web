-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('STORE', 'DEALER', 'AGENCY', 'INSTITUTE', 'SERVICE_PROVIDER', 'FARM', 'OTHER');

-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "businessType" "BusinessType";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "originalPrice";

-- CreateTable
CREATE TABLE "business_offers" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_offers_businessProfileId_idx" ON "business_offers"("businessProfileId");

-- CreateIndex
CREATE INDEX "business_offers_expiresAt_idx" ON "business_offers"("expiresAt");

-- CreateIndex
CREATE INDEX "price_history_listingId_endedAt_idx" ON "price_history"("listingId", "endedAt");

-- AddForeignKey
ALTER TABLE "business_offers" ADD CONSTRAINT "business_offers_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

