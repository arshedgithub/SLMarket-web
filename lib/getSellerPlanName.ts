// Plans now attach to a BusinessProfile (BusinessSubscription), not a User
// directly — a seller can own several businesses on different tiers, so
// there's no longer one "the seller's plan" to read for a bare userId.
// Business-profile paid plans aren't live yet either (see
// BusinessSubscription), so this is a stub until both land: pass a
// businessProfileId and look up its BusinessSubscription once that exists.
export async function getSellerPlanName(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sellerId: string,
): Promise<string> {
  return "free";
}
