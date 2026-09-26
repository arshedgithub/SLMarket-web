import { db } from "@/lib/db";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_DROP_RATIO = 0.05;

// Opens the first PriceHistory row for a newly created listing. Every
// later price change should close this row (set endedAt) and open a new
// one — see the PriceHistory model comment in schema.prisma for why a
// single "previous price" field can't express the drop rules below.
export async function recordInitialPrice(listingId: string, price: number) {
  await db.priceHistory.create({ data: { listingId, price } });
}

// A listing counts as a genuine price drop only if the price it replaced
// was live for at least 7 days, the new price is at least 5% lower, and
// the drop happened within the last 7 days (otherwise "N price drops this
// week" would include drops from months ago that just never changed
// again). Comparing only to the immediately preceding entry means a
// seller can't re-trigger the badge by raising the price and dropping it
// straight back down, since the raised price would itself need to dwell
// 7 days first.
export async function getPriceDropListingIds(): Promise<string[]> {
  const oneWeekAgo = new Date(Date.now() - SEVEN_DAYS_MS);
  const currentRows = await db.priceHistory.findMany({
    where: {
      endedAt: null,
      startedAt: { gte: oneWeekAgo },
      listing: { status: "ACTIVE" },
    },
    select: { listingId: true, price: true },
  });
  if (currentRows.length === 0) return [];

  const prevRows = await db.priceHistory.findMany({
    where: {
      listingId: { in: currentRows.map((r) => r.listingId) },
      endedAt: { not: null },
    },
    orderBy: { endedAt: "desc" },
    select: { listingId: true, price: true, startedAt: true, endedAt: true },
  });

  const latestPrevByListing = new Map<string, (typeof prevRows)[number]>();
  for (const row of prevRows) {
    if (!latestPrevByListing.has(row.listingId)) {
      latestPrevByListing.set(row.listingId, row);
    }
  }

  const droppedIds: string[] = [];
  for (const cur of currentRows) {
    const prev = latestPrevByListing.get(cur.listingId);
    if (!prev || !prev.endedAt) continue;

    const heldMs = prev.endedAt.getTime() - prev.startedAt.getTime();
    if (heldMs < SEVEN_DAYS_MS) continue;

    const prevPrice = Number(prev.price);
    const curPrice = Number(cur.price);
    if (prevPrice <= 0) continue;

    const dropRatio = (prevPrice - curPrice) / prevPrice;
    if (dropRatio >= MIN_DROP_RATIO) droppedIds.push(cur.listingId);
  }
  return droppedIds;
}

export async function getPriceDropCount(): Promise<number> {
  const ids = await getPriceDropListingIds();
  return ids.length;
}
