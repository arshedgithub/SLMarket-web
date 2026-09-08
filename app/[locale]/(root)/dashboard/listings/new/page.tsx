import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";

export const metadata: Metadata = { title: "New Listing" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/dashboard/listings/new");
  }

  const seller = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, whatsappNumber: true },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-market-text)]">
          Post your ad
        </h1>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          A short, guided flow. Your progress saves as you go.
        </p>
      </div>

      <div className="market-section-card p-5 sm:p-8">
        <PostAdFlow
          sellerPhone={seller?.phone ?? seller?.whatsappNumber ?? ""}
        />
      </div>
    </div>
  );
}
