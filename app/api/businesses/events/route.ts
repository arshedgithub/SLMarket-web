import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, redis } from "@/lib/redis";

/*
 * Directory and business-page analytics (section 1.11 of the plan). Events
 * carry no personal data: no user id, no raw IP. Bots are dropped. A lead
 * (call, WhatsApp, number reveal) from the same visitor to the same
 * business inside 24 hours counts once; the repeat is stored but flagged so
 * a dashboard can ignore it.
 */

const EVENTS = new Set([
  "directory_view",
  "directory_search",
  "business_card_impression",
  "business_card_click",
  "contact_reveal",
  "whatsapp_click",
  "call_click",
  "follow",
  "filter_change",
  "map_search_area",
  "short_link_hit",
]);
const LEAD_EVENTS = new Set(["contact_reveal", "whatsapp_click", "call_click"]);
const BOT =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget/i;

const KEY = "business-events";
const KEEP = 50_000;

type Primitive = string | number | boolean | null;

function clean(data: unknown): Record<string, Primitive> {
  const out: Record<string, Primitive> = {};
  if (!data || typeof data !== "object") return out;
  for (const [k, v] of Object.entries(data as Record<string, unknown>).slice(
    0,
    20,
  )) {
    if (typeof v === "string") out[k.slice(0, 40)] = v.slice(0, 200);
    else if (typeof v === "number" || typeof v === "boolean" || v === null)
      out[k.slice(0, 40)] = v;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new NextResponse(null, { status: 204 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimit(`business-events:${ip}`, 240, 60).catch(() => ({
    allowed: true,
  }));
  if (!limit.allowed) return new NextResponse(null, { status: 429 });

  const body = (await req.json().catch(() => null)) as {
    event?: string;
    data?: unknown;
  } | null;
  if (!body?.event || !EVENTS.has(body.event)) {
    return NextResponse.json({ message: "Unknown event" }, { status: 400 });
  }

  const data = clean(body.data);
  let counted = true;
  if (LEAD_EVENTS.has(body.event) && typeof data.slug === "string") {
    const visitor = createHash("sha256")
      .update(`${ip}|${ua}`)
      .digest("hex")
      .slice(0, 16);
    const first = await redis
      .set(`lead:${visitor}:${data.slug}`, 1, { nx: true, ex: 86_400 })
      .catch(() => "OK");
    counted = first !== null;
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
