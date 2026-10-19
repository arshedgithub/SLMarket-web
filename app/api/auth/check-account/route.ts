import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^0\d{9}$/;

// Numbers are stored as typed (0771234567) or in international form
// (94771234567); either one counts as taken.
const phoneForms = (local: string) => [local, `94${local.slice(1)}`];

/*
 * POST { email?, phone? } -> { emailTaken, phoneTaken }
 * Lets the sign-up form say "an account with this email already exists"
 * while the person is still typing, with a way straight to sign-in.
 * Rate limited per visitor, since it does reveal whether an account exists.
 */
export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit(
    `check-account:${getClientIp(req)}`,
    30,
    600,
  ).catch(() => ({ allowed: true }));
  if (!allowed)
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  const body = (await req.json().catch(() => null)) as {
    email?: unknown;
    phone?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  const [emailUser, phoneUser] = await Promise.all([
    EMAIL.test(email)
      ? db.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: { id: true },
        })
      : null,
    PHONE.test(phone)
      ? db.user.findFirst({
          where: { phone: { in: phoneForms(phone) } },
          select: { id: true },
        })
      : null,
  ]);
  return NextResponse.json({
    emailTaken: !!emailUser,
    phoneTaken: !!phoneUser,
  });
}
