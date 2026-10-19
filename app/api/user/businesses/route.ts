import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserShops } from "@/lib/business/userShops";

// GET: the signed-in user's business profiles (the account menu).
export async function GET() {
  const session = await auth().catch(() => null);
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  return NextResponse.json({ shops: await getUserShops(uid) });
}
