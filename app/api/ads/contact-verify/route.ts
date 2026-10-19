import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOtpSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";
import { consumeOtp } from "@/lib/otp";
import {
  CONTACT_PASS_COOKIE,
  CONTACT_PASS_DAYS,
  createContactPass,
} from "@/lib/listings/contactPass";

/*
 * A guest proves an email address with the one-time code sent by
 * /api/auth/send-email-otp, and gets a 30-day pass to see private sellers'
 * numbers (see lib/listings/contactPass.ts). No account is created.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`contact-verify:${ip}`, 10, 600).catch(
    () => ({ allowed: true }),
  );
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  const parsed = verifyEmailOtpSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { email, code } = parsed.data;
  if (!(await consumeOtp(`email:${email}`, code))) {
    return NextResponse.json(
      { message: "Incorrect or expired code" },
      { status: 400 },
    );
  }

  const res = NextResponse.json({ verified: true });
  res.cookies.set(CONTACT_PASS_COOKIE, createContactPass(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CONTACT_PASS_DAYS * 24 * 60 * 60,
  });
  return res;
}
