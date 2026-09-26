import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostAdFlow } from "@/components/post-ad/PostAdFlow";

export const metadata: Metadata = {
  title: "Post your ad",
  description:
    "List anything on SLMarket.lk in a few guided steps: vehicles, property, electronics, services and more.",
};

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/post-ad`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  return (
    <PostAdFlow
      sellerPhone={user?.phone ?? ""}
      sellerName={session.user.name ?? "Your account"}
      closeHref="/"
    />
  );
}
