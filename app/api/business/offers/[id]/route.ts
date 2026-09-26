import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const offer = await db.businessOffer.findFirst({
    where: { id, businessProfile: { ownerId: session.user.id } },
    select: { id: true },
  });
  if (!offer) {
    return NextResponse.json({ message: "Offer not found." }, { status: 404 });
  }

  await db.businessOffer.delete({ where: { id } });
  return NextResponse.json({ message: "Offer deleted." });
}
