import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, redis } from "@/lib/redis";
import { cleanEventData } from "@/lib/listings/eventData";

/*
 * Ad page analytics, same rules as /api/businesses/events: no personal data
 * (no user id, no raw IP), bots dropped, and a lead (WhatsApp, call, number
 * reveal, chat) from the same visitor to the same ad within 24 hours counts
 * once. What it measures:
 *   contact rate        whatsapp_click, call_click, contact_reveal, chat_open
 *   similar ads         similar_click with the fallback level (1-4)
 *   business clicks     view_business_click
 *   gallery             gallery_photos_viewed (distinct photos per visit)
 *   trust and safety    report_click, safety_tips_click
 */

const EVENTS = new Set([
  "ad_view",
  "whatsapp_click",
  "call_click",
  "contact_reveal",
  "chat_open",
  "save",
  "share",
  "similar_click",
  "more_from_seller_click",
  "business_suggestion_click",
  "view_business_click",
  "gallery_photos_viewed",
  "report_click",
  "safety_tips_click",
]);
const LEAD_EVENTS = new Set([
  "whatsapp_click",
  "call_click",
  "contact_reveal",
  "chat_open",
]);
const BOT =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget/i;

const KEY = "ad-events";
const KEEP = 50_000;

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new NextResponse(null, { status: 204 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimit(`ad-events:${ip}`, 240, 60).catch(() => ({
    allowed: true,
  }));
  if (!limit.allowed) return new NextResponse(null, { status: 429 });

  // sendBeacon posts text/plain, so parse the body by hand.
  const body = (await req
    .text()
    .then((t) => JSON.parse(t))
    .catch(() => null)) as { event?: string; data?: unknown } | null;
  if (!body?.event || !EVENTS.has(body.event)) {
    return NextResponse.json({ message: "Unknown event" }, { status: 400 });
  }

  const data = cleanEventData(body.data);
  const visitor = createHash("sha256")
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 16);
  let counted = true;
  if (LEAD_EVENTS.has(body.event) && typeof data.slug === "string") {
    const first = await redis
      .set(`ad-lead:${visitor}:${data.slug}`, 1, { nx: true, ex: 86_400 })
      .catch(() => "OK");
    counted = first !== null;
  }

  // The view count on the ad (ListingView), once per visitor per day, for
  // database ads. Stores the hashed visitor, never the IP.
  if (body.event === "ad_view" && typeof data.listingId === "string") {
    const first = await redis
      .set(`ad-view:${visitor}:${data.listingId}`, 1, { nx: true, ex: 86_400 })
      .catch(() => "OK");
    if (first !== null) {
      await db.listingView
        .create({ data: { listingId: data.listingId, viewerIp: visitor } })
        .catch(() => {});
    }
  }

  try {
    await redis.lpush(
      KEY,
      JSON.stringify({ event: body.event, data, counted, ts: Date.now() }),
    );
    await redis.ltrim(KEY, 0, KEEP - 1);
  } catch {
    // Analytics must never break a page: drop the event.
  }
  return new NextResponse(null, { status: 204 });
}
