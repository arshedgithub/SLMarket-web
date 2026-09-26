import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSellerPlanName } from "@/lib/getSellerPlanName";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only PRO and DEALER plans get analytics
  const planName = await getSellerPlanName(session.user.id);
  if (!["pro", "dealer"].includes(planName)) {
    return NextResponse.json(
      { message: "Analytics is available on Pro and Dealer plans" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");

  const from = new Date();
  from.setDate(from.getDate() - days);

  const [dailyAnalytics, listingViews, topListings, enquiries] =
    await Promise.all([
      db.sellerAnalyticsDaily.findMany({
        where: { sellerId: session.user.id, date: { gte: from } },
        orderBy: { date: "asc" },
      }),
      db.listingView.count({
        where: {
          listing: { sellerId: session.user.id },
          viewedAt: { gte: from },
        },
      }),
      db.listing.findMany({
        where: { sellerId: session.user.id },
        include: { _count: { select: { analytics: true, enquiries: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      db.enquiry.count({
        where: { sellerId: session.user.id, createdAt: { gte: from } },
      }),
    ]);

  const totalProfileViews = dailyAnalytics.reduce(
    (s, d) => s + d.profileViews,
    0,
  );

  return NextResponse.json({
    summary: {
      listingViews,
      profileViews: totalProfileViews,
      enquiries,
      days,
    },
    daily: dailyAnalytics,
    topListings: topListings.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      views: l._count.analytics,
      enquiries: l._count.enquiries,
    })),
  });
}
