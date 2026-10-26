import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Layout } from "@/components";
import { AdNotFound, PageNotFound } from "@/components/not-found/NotFoundViews";

// The proxy marks misses under /ads and /ad (see notFound in proxy.ts) so
// they get the ad-specific page; everything else gets the general one.
export async function generateMetadata() {
  const t = await getTranslations("notFound");
  const isAd = (await headers()).get("x-not-found") === "ad";
  return {
    title: isAd ? t("ad.eyebrow") : t("page.title"),
    robots: { index: false },
  };
}

export default async function NotFound() {
  const isAd = (await headers()).get("x-not-found") === "ad";
  return <Layout>{isAd ? <AdNotFound /> : <PageNotFound />}</Layout>;
}
