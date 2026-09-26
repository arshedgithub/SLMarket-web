export interface ReelQuotaStatus {
  allowed: boolean;
  remaining: number | null; // null = unlimited
  maxPerMonth: number | null; // null = unlimited
}

// Reels/short videos are a paid-plan feature, and business-profile plans
// don't exist yet (see BusinessSubscription) — so every seller is disabled
// for now, regardless of account. Once plans launch, this should look up
// the seller's active BusinessSubscription and its plan's reel allowance
// the same way ReelUpload usage used to be counted here.
export async function getReelQuotaStatus(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sellerId: string,
): Promise<ReelQuotaStatus> {
  return { allowed: false, remaining: 0, maxPerMonth: 0 };
}
