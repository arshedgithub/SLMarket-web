import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { saveCampaign } from "@/lib/spotlight/admin";

async function isAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN";
}

type Ctx = { params: Promise<{ id: string }> };

// PUT: save the whole campaign. PATCH { status }: pause, resume or end it.
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const result = await saveCampaign(body, id);
  return result.ok
    ? NextResponse.json({ id: result.id })
    : NextResponse.json(
        { message: result.message, field: result.field },
        { status: 400 },
      );
}

const STATUSES = ["DRAFT", "SCHEDULED", "LIVE", "PAUSED"] as const;

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    status?: string;
  } | null;
  const status = STATUSES.find((s) => s === body?.status);
  if (!status)
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  const { count } = await db.spotlightCampaign.updateMany({
    where: { id },
    data: { status },
  });
  return count
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "Not found." }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.spotlightCampaign.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
