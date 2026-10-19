import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/*
 * "Recently viewed" for signed-in users, across devices.
 *   GET                       { items }   newest first, up to 12
 *   POST { slug, title, priceText, photo, place }   record a view
 * Each row keeps a small snapshot of the card so the list needs no lookup.
 */

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;
const KEEP = 12;

async function userId() {
  const session = await auth().catch(() => null);
  return session?.user?.id ?? null;
}

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.slice(0, max) : "";

export async function GET() {
  const uid = await userId();
  if (!uid) return NextResponse.json({ items: [] });
  const rows = await db.recentlyViewedAd.findMany({
    where: { userId: uid },
    orderBy: { viewedAt: "desc" },
    take: KEEP,
    select: { adSlug: true, snapshot: true },
  });
  return NextResponse.json({
    items: rows.map((r) => ({
      ...(r.snapshot as Record<string, unknown>),
      slug: r.adSlug,
    })),
  });
}

export async function POST(req: NextRequest) {
  const uid = await userId();
  if (!uid) return new NextResponse(null, { status: 204 });
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!SLUG.test(slug))
    return NextResponse.json({ message: "slug is required" }, { status: 400 });

  const snapshot = {
    title: text(body?.title, 160),
    priceText: text(body?.priceText, 60),
    photo: text(body?.photo, 400) || null,
    place: text(body?.place, 80),
  };
  await db.recentlyViewedAd.upsert({
    where: { userId_adSlug: { userId: uid, adSlug: slug } },
    create: { userId: uid, adSlug: slug, snapshot },
    update: { snapshot, viewedAt: new Date() },
  });

  // Keep the list short.
  const old = await db.recentlyViewedAd.findMany({
    where: { userId: uid },
    orderBy: { viewedAt: "desc" },
    skip: KEEP * 2,
    select: { id: true },
  });
  if (old.length)
    await db.recentlyViewedAd.deleteMany({
      where: { id: { in: old.map((o) => o.id) } },
    });
  return new NextResponse(null, { status: 204 });
}
