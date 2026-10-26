import { db } from "@/lib/db";

// Active = not expired. There's no cleanup job for expired offers — every
// read filters expiresAt directly, so an expired offer just stops showing
// up instead of needing to be deleted.
export async function getActiveOfferCount(): Promise<number> {
  return db.businessOffer.count({
    where: {
      expiresAt: { gt: new Date() },
      businessProfile: { isVerified: true, status: "ACTIVE" },
    },
  });
}
