import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, MessageSquare, Store, Plus } from "lucide-react";

export const metadata = { title: "Seller Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { welcome } = await searchParams;

  const [activeListings, totalEnquiries, unreadEnquiries, businessCount] =
    await Promise.all([
      db.listing.count({
        where: { sellerId: session.user.id, status: "ACTIVE" },
      }),
      db.enquiry.count({ where: { sellerId: session.user.id } }),
      db.enquiry.count({ where: { sellerId: session.user.id, isRead: false } }),
      db.businessProfile.count({ where: { ownerId: session.user.id } }),
    ]);

  const stats = [
    {
      label: "Active Ads",
      value: activeListings,
      sub: "Unlimited",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/dashboard/ads",
    },
    {
      label: "Total Enquiries",
      value: totalEnquiries,
      sub: `${unreadEnquiries} unread`,
      icon: MessageSquare,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      href: "/dashboard/enquiries",
    },
    {
      label: "Businesses",
      value: businessCount,
      sub: businessCount > 0 ? "Manage your businesses" : "Create one to grow",
      icon: Store,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      href: "/dashboard",
    },
  ];

  return (
    <div className="space-y-8">
      {welcome === "1" && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-1">
            Welcome to your Seller Dashboard! 🎉
          </h2>
          <p className="text-blue-100 text-sm">
            Your seller account is live. Start by creating your first ad. It
            only takes a couple of minutes.
          </p>
          <Link
            href="/dashboard/ads/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first ad
          </Link>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your shop
          </p>
        </div>
        <Link
          href="/dashboard/ads/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ad
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <div
              className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {s.value}
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
              {s.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {s.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      {unreadEnquiries > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Unread Enquiries
            </h2>
            <Link
              href="/dashboard/enquiries"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You have{" "}
            <span className="font-semibold text-green-600">
              {unreadEnquiries} new enquiries
            </span>{" "}
            waiting for your response.
          </p>
          <Link
            href="/dashboard/enquiries"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Respond now
          </Link>
        </div>
      )}
    </div>
  );
}
