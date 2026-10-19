import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";
import { listingToDraft } from "@/lib/listings/editDraft";
import { getUserShops } from "@/lib/business/userShops";

export const metadata: Metadata = { title: "Edit ad" };

// Editing reuses the post-ad flow, filled in from the listing; saving goes
// to PUT /api/listings/ad/<id> (same checks as posting).
export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const [listing, seller, shops] = await Promise.all([
    db.listing.findFirst({ where: { id, sellerId: session.user.id } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    }),
    getUserShops(session.user.id),
  ]);
  if (!listing) notFound();

  return (
    <PostAdFlow
      sellerPhone={seller?.phone ?? ""}
      sellerName={session.user.name ?? "Your account"}
      shops={shops}
      closeHref={`/ad/${listing.slug}`}
      edit={{ listingId: listing.id, draft: listingToDraft(listing) }}
    />
  );
}
