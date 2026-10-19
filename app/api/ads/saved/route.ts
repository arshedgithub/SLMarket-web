import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/*
 * Saved ads for signed-in users, across devices. Guests keep saves on the
 * device; on sign-in the page sends them here to merge (`merge`).
 *   GET  ?slug=<slug>   { saved }       one ad
 *   GET                 { slugs }       all, newest first
 *   POST { slug, saved }                save / unsave one
 *   POST { merge: [slug, ...] }         add many (from the device)
 */

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;
const MAX = 500;

async function userId() {
  const session = await auth().catch(() => null);
  return session?.user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const row = await db.savedAd.findUnique({
      where: { userId_adSlug: { userId: uid, adSlug: slug } },
    });
    return NextResponse.json({ saved: !!row });
  }
  const rows = await db.savedAd.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    take: MAX,
    select: { adSlug: true },
  });
  return NextResponse.json({ slugs: rows.map((r) => r.adSlug) });
}

export async function POST(req: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    slug?: string;
    saved?: boolean;
    merge?: unknown;
  } | null;

  if (Array.isArray(body?.merge)) {
    const slugs = [
      ...new Set(
        body.merge.filter(
          (s): s is string => typeof s === "string" && SLUG.test(s),
        ),
      ),
    ].slice(0, MAX);
    if (slugs.length) {
      await db.savedAd.createMany({
        data: slugs.map((adSlug) => ({ userId: uid, adSlug })),
        skipDuplicates: true,
      });
    }
    return NextResponse.json({ merged: slugs.length });
  }

  if (!body?.slug || !SLUG.test(body.slug) || typeof body.saved !== "boolean") {
    return NextResponse.json(
      { message: "slug and saved are required" },
      { status: 400 },
    );
  }
  const key = { userId_adSlug: { userId: uid, adSlug: body.slug } };
  if (body.saved) {
    await db.savedAd.upsert({
      where: key,
      create: { userId: uid, adSlug: body.slug },
      update: {},
    });
  } else {
    await db.savedAd.deleteMany({ where: { userId: uid, adSlug: body.slug } });
  }
  return NextResponse.json({ saved: body.saved });
}
