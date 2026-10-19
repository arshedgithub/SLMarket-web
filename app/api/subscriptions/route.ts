import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/*
 * GET /api/subscriptions[?business=<id>]
 * The signed-in owner's business pages, each with its plan (null = no paid
 * plan yet), and usage for the one asked about (or the first).
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const businesses = await db.businessProfile.findMany({
    where: { ownerId: session.user.id, status: { not: "DISABLED" } },
    select: {
      id: true,
      name: true,
      slug: true,
      subscription: { include: { plan: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const wanted = req.nextUrl.searchParams.get("business");
  const current = businesses.find((b) => b.id === wanted) ?? businesses[0];

  const activeListings = current
    ? await db.listing.count({
        where: { businessProfileId: current.id, status: "ACTIVE" },
      })
    : 0;

  const sub = current?.subscription;
  return NextResponse.json({
    businesses: businesses.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      planId: b.subscription?.planId ?? null,
      planName: b.subscription?.plan.name ?? null,
    })),
    businessProfileId: current?.id ?? null,
    subscription: sub
      ? {
          ...sub,
          priceUsd: Number(sub.plan.priceUsd),
          priceLkr: Number(sub.plan.priceLkr),
        }
      : null,
    usage: { activeListings },
  });
}
