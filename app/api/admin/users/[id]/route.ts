import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { adminPlanUpdateSchema } from "@/lib/validations/subscription";
import {
  activateBusinessPlan,
  BUSINESS_CHOICE_MESSAGE,
  resolveOwnedBusiness,
} from "@/lib/billing/subscription";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = adminPlanUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const [user, plan] = await Promise.all([
    db.user.findUnique({ where: { id } }),
    db.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } }),
  ]);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  if (!plan) {
    return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  }

  // Plans belong to business pages: the one named, or the user's only one.
  const choice = await resolveOwnedBusiness(id, parsed.data.businessProfileId);
  if (!choice.ok) {
    return NextResponse.json(
      { code: choice.code, message: BUSINESS_CHOICE_MESSAGE[choice.code] },
      { status: choice.code === "not_found" ? 404 : 400 },
    );
  }

  const subscription = await activateBusinessPlan(db, {
    businessProfileId: choice.business.id,
    plan,
    months: 1,
  });

  return NextResponse.json(subscription);
}
