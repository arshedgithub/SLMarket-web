import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";

export const metadata: Metadata = {
  title: "Post your ad",
  description:
    "List anything on SLMarket.lk in a few guided steps — vehicles, property, electronics, services and more.",
};

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  let sellerPhone = "";
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true, whatsappNumber: true },
    });
    sellerPhone = user?.phone ?? user?.whatsappNumber ?? "";
  }

  return (
    <div className="marketplace-page">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Post your ad
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
            Sell it on SLMarket.lk
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-market-text-muted)]">
            A short, guided flow — pick a category, add the details that matter
            for it, and reach buyers across Sri Lanka. Your progress saves as
            you go.
          </p>
        </div>

        <div className="market-section-card p-5 sm:p-8 lg:p-10">
          <PostAdFlow sellerPhone={sellerPhone} />
        </div>
      </div>
    </div>
  );
}
