import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/redis";
import { colomboDay } from "@/lib/listings/feed";

/*
 * POST { id, type: "impression" | "click" } (sent with sendBeacon).
 * Counts per placement per day (Asia/Colombo); advertisers see these
 * numbers, so each visitor is rate limited.
 */
const ID = /^[cb]:[a-z0-9]{10,40}$/;

export async function POST(req: NextRequest) {
  let body: { id?: unknown; type?: unknown };
  try {
    body = JSON.parse((await req.text()) || "{}");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { id, type } = body;
  if (
    typeof id !== "string" ||
    !ID.test(id) ||
    (type !== "impression" && type !== "click")
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const { allowed } = await rateLimit(
    `spot:${type}:${ip}:${id}`,
    type === "impression" ? 20 : 10,
    3600,
  ).catch(() => ({ allowed: true }));
  if (!allowed) return NextResponse.json({ ok: true });

  const day = new Date(`${colomboDay()}T00:00:00Z`);
  const inc =
    type === "impression"
      ? { impressions: { increment: 1 } }
      : { clicks: { increment: 1 } };
  await db.spotlightStatDaily
    .upsert({
      where: { spotId_day: { spotId: id, day } },
      update: inc,
      create: {
        spotId: id,
        day,
        impressions: type === "impression" ? 1 : 0,
        clicks: type === "click" ? 1 : 0,
      },
    })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
