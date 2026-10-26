import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";
import { getUserShops } from "@/lib/business/userShops";

export const metadata: Metadata = { title: "New Listing" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/dashboard/ads/new");
  }

  const [seller, shops] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    }),
    getUserShops(session.user.id),
  ]);

  return (
    <PostAdFlow
      sellerPhone={seller?.phone ?? ""}
      sellerName={session.user.name ?? "Your account"}
      shops={shops}
      closeHref="/dashboard/ads"
    />
  );
}
