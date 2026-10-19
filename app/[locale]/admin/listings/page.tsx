import { db } from "@/lib/db";
import { ListingApprovalList } from "@/components/admin/ListingApprovalList";
import type { ListingStatus } from "@prisma/client";

export const metadata = { title: "Admin · Listings" };

const VALID_STATUSES: ListingStatus[] = [
  "PENDING_REVIEW",
  "CHANGES_REQUESTED",
  "ACTIVE",
  "SOLD",
  "PAUSED",
  "EXPIRED",
  "REJECTED",
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus: ListingStatus | "ALL" =
    status === "ALL"
      ? "ALL"
      : status && VALID_STATUSES.includes(status as ListingStatus)
        ? (status as ListingStatus)
        : "PENDING_REVIEW";

  const listings = await db.listing.findMany({
    where: activeStatus === "ALL" ? {} : { status: activeStatus },
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true, email: true } },
      businessProfile: {
        select: {
          name: true,
          subscription: {
            select: { status: true, plan: { select: { displayName: true } } },
          },
        },
      },
    },
  });

  const serialized = listings.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    image: l.images[0] ?? null,
    price: Number(l.price),
    currency: l.currency,
    status: l.status,
    rejectionReason: l.rejectionReason,
    createdAt: l.createdAt.toISOString(),
    sellerName: l.seller.name,
    sellerEmail: l.seller.email,
    // Personal ads have no plan; business ads show the business's plan.
    sellerPlan: l.businessProfile
      ? `${l.businessProfile.name}: ${
          l.businessProfile.subscription?.status === "ACTIVE"
            ? l.businessProfile.subscription.plan.displayName
            : "Free"
        } plan`
      : "Personal ad",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review pending listings, or browse by status.
        </p>
      </div>

      <ListingApprovalList listings={serialized} activeStatus={activeStatus} />
    </div>
  );
}
