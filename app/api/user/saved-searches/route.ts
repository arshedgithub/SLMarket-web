import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeSearchQuery } from "@/lib/listings/savedSearch";

const MAX_SAVED = 50;

async function userId() {
  const session = await auth().catch(() => null);
  return session?.user?.id ?? null;
}

// GET: the signed-in user's saved searches. With ?query=, only that one
// (to show whether the current /ads page is saved).
export async function GET(req: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  const raw = req.nextUrl.searchParams.get("query");
  const query = raw ? normalizeSearchQuery(raw) : null;
  const searches = await db.savedSearch.findMany({
    where: { userId: uid, ...(query ? { query } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      query: true,
      alerts: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ searches });
}

// POST { query, label }: save the search (alerts on).
export async function POST(req: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    query?: unknown;
    label?: unknown;
  } | null;
  const query =
    typeof body?.query === "string" ? normalizeSearchQuery(body.query) : null;
  const label =
    typeof body?.label === "string" ? body.label.trim().slice(0, 120) : "";
  if (!query || !label)
    return NextResponse.json({ message: "Invalid search." }, { status: 400 });

  const count = await db.savedSearch.count({ where: { userId: uid } });
  if (count >= MAX_SAVED) {
    return NextResponse.json(
      { message: "You have saved the maximum number of searches." },
      { status: 409 },
    );
  }
  const search = await db.savedSearch.upsert({
    where: { userId_query: { userId: uid, query } },
    create: { userId: uid, query, label, lastNotifiedAt: new Date() },
    update: { label },
    select: {
      id: true,
      label: true,
      query: true,
      alerts: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ search }, { status: 201 });
}

// PATCH { id, alerts }: turn email alerts on or off.
export async function PATCH(req: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    alerts?: unknown;
  } | null;
  if (typeof body?.id !== "string" || typeof body.alerts !== "boolean") {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const { count } = await db.savedSearch.updateMany({
    where: { id: body.id, userId: uid },
    data: { alerts: body.alerts },
  });
  return count
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "Not found." }, { status: 404 });
}

// DELETE ?id=: remove one saved search.
export async function DELETE(req: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ message: "Sign in" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  await db.savedSearch.deleteMany({ where: { id, userId: uid } });
  return NextResponse.json({ ok: true });
}
