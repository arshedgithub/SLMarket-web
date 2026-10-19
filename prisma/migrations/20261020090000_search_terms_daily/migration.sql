-- CreateTable
CREATE TABLE "search_terms_daily" (
    "term" VARCHAR(60) NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "search_terms_daily_pkey" PRIMARY KEY ("term","day")
);

-- CreateIndex
CREATE INDEX "search_terms_daily_day_idx" ON "search_terms_daily"("day");
