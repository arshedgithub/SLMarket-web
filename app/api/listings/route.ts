import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";

// Listing creation lives at POST /api/listings/ad (the /sell flow's
// endpoint) — this route is read-only.

const SORTS = {
  newest: [{ isBoosted: "desc" }, { createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
} satisfies Record<string, Prisma.ListingOrderByWithRelationInput[]>;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  const subcategoryId = searchParams.get("subcategory");
  const search = searchParams.get("q");
  const district = searchParams.get("district");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const sort = (searchParams.get("sort") ?? "newest") as keyof typeof SORTS;
  const businessProfileId = searchParams.get("businessProfileId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    48,
    Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10) || 24),
  );

  const cacheKey = `listings:${categoryId}:${subcategoryId}:${search}:${district}:${priceMin}:${priceMax}:${sort}:${businessProfileId}:${page}:${limit}`;
  const cached = await getCached<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };
  if (categoryId) where.categoryId = categoryId;
  if (subcategoryId) where.subcategoryId = subcategoryId;
  if (district) where.district = district;
  if (businessProfileId) where.businessProfileId = businessProfileId;
  if (priceMin || priceMax) {
    where.price = {
      ...(priceMin ? { gte: Number(priceMin) } : {}),
      ...(priceMax ? { lte: Number(priceMax) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.listing.findMany({
      where,
      include: {
        businessProfile: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
            tier: true,
          },
        },
      },
      orderBy: SORTS[sort] ?? SORTS.newest,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.listing.count({ where }),
  ]);

  const response = {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };

  await setCached(cacheKey, response, 1800); // 30 minutes
  return NextResponse.json(response);
}
