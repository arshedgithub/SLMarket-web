import { NextRequest, NextResponse } from "next/server";
import { getSpotlightPool } from "@/lib/spotlight/pool";
import { rankSpotlights } from "@/lib/spotlight/rank";

export const dynamic = "force-dynamic";

/*
 * GET /api/spotlight?count=2&category=&district=&seed=&seen=a,b&capped=x&exclude=y
 * The spotlights for one page of ads. Fetched after the page loads (the
 * ad grid itself stays cached), with a fresh seed per page view. An empty
 * list means no slot is shown.
 */
const list = (v: string | null) =>
  new Set(
    (v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 200),
  );

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const count = Math.min(Math.max(Number(p.get("count")) || 1, 1), 2);
  try {
    const pool = await getSpotlightPool();
    const spots = rankSpotlights(pool, {
      count,
      seed: (p.get("seed") ?? "").slice(0, 64) || crypto.randomUUID(),
      ctx: { category: p.get("category"), district: p.get("district") },
      seen: list(p.get("seen")),
      capped: list(p.get("capped")),
      exclude: list(p.get("exclude")),
    });
    return NextResponse.json(
      { spots },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // No slot rather than an error on the page.
    return NextResponse.json(
      { spots: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
