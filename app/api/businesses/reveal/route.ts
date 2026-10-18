import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStorefront } from "@/lib/business/getStorefront";
import { rateLimit, redis } from "@/lib/redis";

/*
 * "Show number". Anti-scraping: a guest can reveal only a handful of numbers
 * an hour, then has to sign in; a signed-in user gets a higher limit. Every
 * reveal is logged as a lead (source = where the button was), de-duplicated
 * per visitor and business by the events endpoint's 24-hour rule.
 *
 * Honest limit: the number is also in the page data (WhatsApp and call links
 * need it), so this stops casual harvesting and measures interest, not a
 * determined scraper.
 */

const GUEST_PER_HOUR = 5;
const USER_PER_HOUR = 30;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    slug?: string;
    source?: string;
  } | null;
  if (!body?.slug)
    return NextResponse.json({ message: "slug is required" }, { status: 400 });

  const session = await auth();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = session?.user?.id
    ? await rateLimit(
        `reveal:user:${session.user.id}`,
        USER_PER_HOUR,
        3600,
      ).catch(() => ({ allowed: true }))
    : await rateLimit(`reveal:ip:${ip}`, GUEST_PER_HOUR, 3600).catch(() => ({
        allowed: true,
      }));

  if (!limit.allowed) {
    return NextResponse.json(
      {
        message: "Too many numbers revealed.",
        requiresSignIn: !session?.user?.id,
      },
      { status: 429 },
    );
  }

  const business = await getStorefront(body.slug);
  if (!business)
    return NextResponse.json(
      { message: "Business not found" },
      { status: 404 },
    );

  try {
    await redis.lpush(
      "business-events",
      JSON.stringify({
        event: "contact_reveal",
        data: {
          slug: business.slug,
          source: (body.source ?? "business-page").slice(0, 40),
        },
        counted: true,
        ts: Date.now(),
      }),
    );
  } catch {
    /* logging never blocks the reveal */
  }
  return NextResponse.json({ phone: business.phone });
}
