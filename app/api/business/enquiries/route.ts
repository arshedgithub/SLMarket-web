import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStorefront } from "@/lib/business/getStorefront";
import { rateLimit, redis } from "@/lib/redis";

// A buyer's enquiry to a whole business (not to one ad). The current
// Enquiry table is per-listing, so until it gains a businessProfileId these
// are kept in Redis per business (newest first, capped) for the owner's
// leads inbox to read. Spam protection: a honeypot field and a per-IP rate
// limit. Consent is implied by sending; the form says so above the button.

const SL_MOBILE = /^(?:\+?94|0)7\d{8}$/;

const enquirySchema = z
  .object({
    slug: z.string().min(1).max(60),
    what: z.string().trim().min(2).max(300),
    budget: z.string().trim().max(60).optional(),
    method: z.enum(["whatsapp", "call", "chat"]),
    phone: z.string().trim().max(20).optional(),
    message: z.string().trim().max(1000).optional(),
    website: z.string().max(0).optional(), // honeypot: real people leave it empty
  })
  .refine(
    (v) =>
      v.method === "chat" ||
      (v.phone !== undefined && SL_MOBILE.test(v.phone.replace(/[\s-]/g, ""))),
    { message: "A valid mobile number is required.", path: ["phone"] },
  );

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = await rateLimit(`business-enquiry:${ip}`, 5, 3600);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many enquiries. Please try again later." },
      { status: 429 },
    );
  }

  const parsed = enquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid enquiry.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const business = await getStorefront(data.slug);
  if (!business) {
    return NextResponse.json(
      { message: "Business not found." },
      { status: 404 },
    );
  }

  const session = await auth();
  const record = {
    slug: business.slug,
    what: data.what,
    budget: data.budget || null,
    method: data.method,
    phone: data.phone?.replace(/[\s-]/g, "") || null,
    message: data.message || null,
    buyerId: session?.user?.id ?? null,
    createdAt: new Date().toISOString(),
  };

  const key = `business-enquiries:${business.slug}`;
  await redis.lpush(key, JSON.stringify(record));
  await redis.ltrim(key, 0, 499);

  return NextResponse.json({ ok: true }, { status: 201 });
}
