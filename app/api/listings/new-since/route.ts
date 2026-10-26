import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Returns how many ACTIVE listings were created after `since`, grouped by
// category — used to show "what's new" when a visitor returns after a while.
export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  if (!sinceDate || Number.isNaN(sinceDate.getTime())) {
    return NextResponse.json(
      { message: "Invalid 'since' timestamp" },
      { status: 400 },
    );
  }

  let counts;
  try {
    counts = await db.listing.groupBy({
      by: ["categoryId"],
      where: { status: "ACTIVE", createdAt: { gt: sinceDate } },
      _count: true,
    });
  } catch {
    // "What's new" is optional; a database outage shouldn't be a 500.
    return NextResponse.json(
      { message: "Temporarily unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    categories: counts.map((c) => ({
      category: c.categoryId,
      count: c._count,
    })),
  });
}
