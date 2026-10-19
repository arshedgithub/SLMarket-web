import type { Metadata } from "next";
import {
  StorefrontPage,
  buildStorefrontMetadata,
} from "./_components/storefrontPage";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildStorefrontMetadata(locale, slug, "main");
}

export default async function BusinessPage({ params }: Props) {
  const { locale, slug } = await params;
  return <StorefrontPage locale={locale} slug={slug} view="main" />;
}
