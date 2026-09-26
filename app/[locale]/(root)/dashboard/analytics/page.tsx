import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, MessageSquare, Package, TrendingUp, Lock } from "lucide-react";
import type { Metadata } from "next";
import { getSellerPlanName } from "@/lib/getSellerPlanName";

export const metadata: Metadata = { title: "Analytics" };

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div
        className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
        {label}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/dashboard");

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  );

  const sellerId = session.user.id;
  const planName = await getSellerPlanName(sellerId);
  const hasAnalytics = planName === "pro" || planName === "dealer";

  const [
    listingGroups,
    totalEnquiries,
    thisMonthEnquiries,
    lastMonthEnquiries,
    topListings,
    dailyData,
  ] = await Promise.all([
    db.listing.groupBy({
      by: ["status"],
      where: { sellerId },
      _count: { id: true },
    }),
    db.enquiry.count({ where: { sellerId } }),
    db.enquiry.count({ where: { sellerId, createdAt: { gte: startOfMonth } } }),
    db.enquiry.count({
      where: {
        sellerId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    db.listing.findMany({
      where: { sellerId },
      select: {
        id: true,
        title: true,
        category: true,
        images: true,
        status: true,
        slug: true,
        _count: { select: { enquiries: true } },
      },
      orderBy: { enquiries: { _count: "desc" } },
      take: 5,
    }),
    hasAnalytics
      ? db.sellerAnalyticsDaily.findMany({
          where: { sellerId, date: { gte: thirtyDaysAgo } },
          orderBy: { date: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const listingMap: Record<string, number> = {};
  for (const g of listingGroups) {
    listingMap[g.status] = g._count.id;
  }
  const activeListings = listingMap["ACTIVE"] ?? 0;
  const pendingListings = listingMap["PENDING_REVIEW"] ?? 0;
  const totalListings = Object.values(listingMap).reduce((a, b) => a + b, 0);

  const enquiryTrend =
    lastMonthEnquiries > 0
      ? Math.round(
          ((thisMonthEnquiries - lastMonthEnquiries) / lastMonthEnquiries) *
            100,
        )
      : thisMonthEnquiries > 0
        ? 100
        : 0;

  // Build 30-day date array for the chart
  const days: { label: string; views: number; enquiries: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const entry = dailyData.find(
      (r) => r.date.toISOString().slice(0, 10) === iso,
    );
    days.push({
      label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      views: entry?.listingViews ?? 0,
      enquiries: entry?.enquiriesReceived ?? 0,
    });
  }

  const maxViews = Math.max(...days.map((d) => d.views), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Performance overview for your ads and enquiries.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Active Ads"
          value={activeListings}
          sub={`${totalListings} total`}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={MessageSquare}
          label="This Month Enquiries"
          value={thisMonthEnquiries}
          sub={
            enquiryTrend === 0
              ? "Same as last month"
              : `${enquiryTrend > 0 ? "+" : ""}${enquiryTrend}% vs last month`
          }
          color="text-green-600"
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Enquiries"
          value={totalEnquiries}
          sub="all time"
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          icon={Package}
          label="Pending Review"
          value={pendingListings}
          sub="awaiting admin approval"
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
      </div>

      {/* Views chart — Pro/Dealer only */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Ad Views: Last 30 Days
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Daily ad views tracked by the platform
            </p>
          </div>
          {!hasAnalytics && (
            <Link
              href="/dashboard/upgrade"
              className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <Lock className="w-3 h-3" />
              Pro / Dealer
            </Link>
          )}
        </div>

        {hasAnalytics ? (
          days.some((d) => d.views > 0) ? (
            <div className="flex items-end gap-1 h-32">
              {days.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <div
                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-sm transition-all group-hover:bg-blue-400"
                    style={{
                      height: `${Math.max(4, (d.views / maxViews) * 112)}px`,
                    }}
                  />
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    {d.label}: {d.views} views
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-gray-400">
              No view data yet. Views are recorded as buyers browse your ads.
            </div>
          )
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-center">
            <Lock className="w-6 h-6 text-gray-300" />
            <p className="text-sm text-gray-500">
              Detailed view analytics is available on Pro and Dealer plans.
            </p>
            <Link
              href="/dashboard/upgrade"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Upgrade to unlock →
            </Link>
          </div>
        )}
      </div>

      {/* Top listings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Top Ads by Enquiries
        </h2>
        {topListings.length === 0 ? (
          <p className="text-sm text-gray-400">
            No ads yet.{" "}
            <Link
              href="/dashboard/ads/new"
              className="text-blue-600 hover:underline"
            >
              Create your first ad
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {topListings.map((listing, i) => {
              const enquiryCount = listing._count.enquiries;
              const maxCount = topListings[0]._count.enquiries || 1;
              return (
                <div key={listing.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 shrink-0">
                    {i + 1}
                  </span>
                  {listing.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/ad/${listing.slug}`}
                      className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 block"
                    >
                      {listing.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{
                            width: `${(enquiryCount / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {enquiryCount}{" "}
                        {enquiryCount === 1 ? "enquiry" : "enquiries"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      listing.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : listing.status === "PENDING_REVIEW"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {listing.status === "PENDING_REVIEW"
                      ? "Pending"
                      : listing.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Listing status breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Ads by Status
        </h2>
        {totalListings === 0 ? (
          <p className="text-sm text-gray-400">No ads yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                status: "ACTIVE",
                label: "Active",
                color: "bg-green-500",
                text: "text-green-700 dark:text-green-400",
              },
              {
                status: "PENDING_REVIEW",
                label: "Pending Review",
                color: "bg-amber-500",
                text: "text-amber-700 dark:text-amber-400",
              },
              {
                status: "SOLD",
                label: "Sold",
                color: "bg-blue-500",
                text: "text-blue-700 dark:text-blue-400",
              },
              {
                status: "PAUSED",
                label: "Paused",
                color: "bg-gray-400",
                text: "text-gray-600 dark:text-gray-400",
              },
              {
                status: "EXPIRED",
                label: "Expired",
                color: "bg-red-400",
                text: "text-red-600 dark:text-red-400",
              },
              {
                status: "REJECTED",
                label: "Rejected",
                color: "bg-red-600",
                text: "text-red-700 dark:text-red-400",
              },
            ]
              .filter((s) => (listingMap[s.status] ?? 0) > 0)
              .map(({ status, label, color, text }) => (
                <div
                  key={status}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <div>
                    <p className={`text-lg font-bold ${text}`}>
                      {listingMap[status]}
                    </p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Enquiry trend */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
          Enquiry Trend
        </h2>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              This Month
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {thisMonthEnquiries}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Last Month
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {lastMonthEnquiries}
            </p>
          </div>
        </div>
        {enquiryTrend !== 0 && (
          <p
            className={`text-sm mt-3 font-medium ${enquiryTrend > 0 ? "text-green-600" : "text-red-500"}`}
          >
            {enquiryTrend > 0 ? "▲" : "▼"} {Math.abs(enquiryTrend)}% compared to
            last month
          </p>
        )}
      </div>

      {!hasAnalytics && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              Unlock Full Analytics
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Get per-ad view tracking, buyer demographics, and daily charts
              with Pro or Dealer.
            </p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}
    </div>
  );
}
