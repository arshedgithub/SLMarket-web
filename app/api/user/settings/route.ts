import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";

const DISTRICTS = SRI_LANKA_DISTRICTS.map((d) => d.name);

// Email and phone are not changed here: both are verified identities with
// their own flows. Business details live on each business page.
const settingsSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  district: z
    .string()
    .trim()
    .refine((d) => d === "" || DISTRICTS.includes(d), "Choose a district")
    .transform((d) => (d === "" ? null : d)),
});

// PATCH { name, district }: the signed-in user's own account details.
export async function PATCH(req: NextRequest) {
  const session = await auth().catch(() => null);
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });

  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const user = await db.user.update({
    where: { id: uid },
    data: parsed.data,
    select: { name: true, district: true },
  });
  return NextResponse.json(user);
}
