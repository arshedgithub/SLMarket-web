import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { adminPlanUpdateSchema } from "@/lib/validations/subscription";

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

  const now = new Date();
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

  const subscription = await db.sellerSubscription.upsert({
    where: { sellerId: id },
    create: {
      sellerId: id,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
      freeBoostsRemaining: plan.monthlyFreeBoosts,
    },
    update: {
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodEnd,
      freeBoostsRemaining: plan.monthlyFreeBoosts,
    },
    include: { plan: true },
  });

  return NextResponse.json(subscription);
}
