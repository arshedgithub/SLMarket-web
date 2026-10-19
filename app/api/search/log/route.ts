import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/redis";
import { recordSearch } from "@/lib/search/terms";

/*
 * POST { q } (sent with sendBeacon when someone runs a search). Counts the
 * normalised words only; each visitor is rate limited so one person cannot
 * push a term into "Popular searches".
 */
export async function POST(req: NextRequest) {
  let q: unknown;
  try {
    q = JSON.parse((await req.text()) || "{}").q;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof q !== "string" || q.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const term = q.trim().toLowerCase();
  const [perVisitor, perTerm] = await Promise.all([
    rateLimit(`search:${ip}`, 30, 3600).catch(() => ({ allowed: true })),
    // The same visitor counts once per term per day.
    rateLimit(`search:${ip}:${term}`, 1, 86400).catch(() => ({
      allowed: true,
    })),
  ]);
  if (perVisitor.allowed && perTerm.allowed) {
    await recordSearch(q).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
