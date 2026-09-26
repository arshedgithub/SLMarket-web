import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";

export const metadata: Metadata = { title: "New Listing" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/dashboard/ads/new");
  }

  const seller = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  return (
    <PostAdFlow
      sellerPhone={seller?.phone ?? ""}
      sellerName={session.user.name ?? "Your account"}
      closeHref="/dashboard/ads"
    />
  );
}
