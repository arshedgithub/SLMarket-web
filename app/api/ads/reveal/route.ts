import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdView } from "@/lib/listings/adView";
import { rateLimit, redis } from "@/lib/redis";
import {
  CONTACT_PASS_COOKIE,
  verifyContactPass,
} from "@/lib/listings/contactPass";

/*
 * "Show number" on an ad, logged as a lead. Rules:
 *   business ads   anyone, rate limited like /api/businesses/reveal
 *   private ads    the number is never in the page; it is revealed to a
 *                  signed-in user, or to a guest who checked their email
 *                  with a one-time code (/api/ads/contact-verify).
 */

const GUEST_PER_HOUR = 5;
const USER_PER_HOUR = 30;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { slug?: string } | null;
  if (!body?.slug) {
    return NextResponse.json({ message: "slug is required" }, { status: 400 });
  }

  const ad = await getAdView(body.slug);
  if (
    !ad ||
    (ad.status !== "live" && ad.status !== "reserved") ||
    !ad.contact.phone
  ) {
    return NextResponse.json({ message: "No number to show" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const verifiedGuest = verifyContactPass(
    req.cookies.get(CONTACT_PASS_COOKIE)?.value,
  );
  if (!ad.seller.business && !userId && !verifiedGuest) {
    return NextResponse.json(
      {
        message: "Confirm your email to see this seller's number.",
        requiresVerification: true,
      },
      { status: 401 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = userId
    ? await rateLimit(`ad-reveal:user:${userId}`, USER_PER_HOUR, 3600).catch(
        () => ({ allowed: true }),
      )
    : await rateLimit(`ad-reveal:ip:${ip}`, GUEST_PER_HOUR, 3600).catch(() => ({
        allowed: true,
      }));
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many numbers revealed.", requiresSignIn: !userId },
      { status: 429 },
    );
  }

  try {
    await redis.lpush(
      "ad-events",
      JSON.stringify({
        event: "contact_reveal",
        data: { slug: ad.slug, source: "ad-page" },
        counted: true,
        ts: Date.now(),
      }),
    );
  } catch {
    /* logging never blocks the reveal */
  }
  return NextResponse.json({ phone: ad.contact.phone });
}
