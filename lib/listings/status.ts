import { db } from "@/lib/db";
import { withTimeout } from "@/lib/business/dbGuard";

/*
 * "Is /ad/<slug> a live ad?" asked by the proxy before rendering, so a
 * missing, unpublished or hidden ad gets a real 404 status (the app-wide
 * loading boundary would otherwise send the page's own not-found as 200).
 * Not cached: an ad approved a moment ago must show at once. Fails open: if
 * the database cannot answer, the page renders and decides for itself.
 */
export async function isLiveListing(slug: string): Promise<boolean> {
  try {
    const row = await withTimeout(
      db.listing.findFirst({
        where: { slug, status: "ACTIVE" },
        select: { businessProfile: { select: { status: true } } },
      }),
    );
    if (!row) return false;
    return !row.businessProfile || row.businessProfile.status === "ACTIVE";
  } catch {
    return true;
  }
}
