import type { Metadata } from "next";
import {
  StorefrontPage,
  buildStorefrontMetadata,
} from "../_components/storefrontPage";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildStorefrontMetadata(locale, slug, "questions");
}

export default async function BusinessQuestionsPage({ params }: Props) {
  const { locale, slug } = await params;
  return <StorefrontPage locale={locale} slug={slug} view="questions" />;
}
