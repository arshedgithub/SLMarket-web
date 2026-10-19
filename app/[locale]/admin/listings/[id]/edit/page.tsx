import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";
import { listingToDraft } from "@/lib/listings/editDraft";
import { getUserShops } from "@/lib/business/userShops";

export const metadata = { title: "Admin · Edit Listing" };

// The same editor sellers use (the post-ad flow in edit mode), filled in
// from the ad and its seller's details; saving goes to PUT
// /api/listings/ad/<id>, which lets admins edit any ad without re-queuing it.
export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await db.listing.findUnique({
    where: { id },
    include: { seller: { select: { name: true, phone: true } } },
  });
  if (!listing) notFound();

  const shops = await getUserShops(listing.sellerId);

  return (
    <PostAdFlow
      sellerPhone={listing.seller.phone ?? ""}
      sellerName={listing.seller.name}
      shops={shops}
      closeHref="/admin/listings"
      edit={{ listingId: listing.id, draft: listingToDraft(listing) }}
    />
  );
}
