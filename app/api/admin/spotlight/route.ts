import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveCampaign } from "@/lib/spotlight/admin";

async function isAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN";
}

// POST: create a spotlight campaign.
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const result = await saveCampaign(body);
  return result.ok
    ? NextResponse.json({ id: result.id }, { status: 201 })
    : NextResponse.json(
        { message: result.message, field: result.field },
        { status: 400 },
      );
}
