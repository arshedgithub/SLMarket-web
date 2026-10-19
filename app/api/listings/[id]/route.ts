import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { invalidateListingsCache } from "@/lib/listings-cache";
import { deleteAsset } from "@/lib/cloudinary";

/*
 * DELETE /api/listings/<id>: the owner, or an admin, deletes an ad and its
 * uploaded photos and video. Editing is PUT /api/listings/ad/<id>.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const where =
    session.user.role === "ADMIN" ? { id } : { id, sellerId: session.user.id };

  const existing = await db.listing.findFirst({
    where,
    select: { id: true, images: true, videoUrl: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  await db.listing.delete({ where: { id } });

  await Promise.all(
    existing.images.map((url) => deleteAsset(url).catch(() => {})),
  );
  if (existing.videoUrl) {
    await deleteAsset(existing.videoUrl, "video").catch(() => {});
  }

  // Without this a deleted ad keeps showing on marketplace pages (and the
  // homepage) until the cache's time window passes.
  await invalidateListingsCache();

  return NextResponse.json({ message: "Listing deleted" });
}
