import type { Metadata } from "next";
import {
  DirectoryPage,
  buildDirectoryMetadata,
} from "../_components/directoryPage";
import { DIRECTORY_CATEGORY_ORDER } from "@/lib/business/directory/seo";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; category: string }> };

export function generateStaticParams() {
  return DIRECTORY_CATEGORY_ORDER.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  return buildDirectoryMetadata(locale, { kind: "category", category });
}

export default async function BusinessCategoryPage({ params }: Props) {
  const { locale, category } = await params;
  return (
    <DirectoryPage locale={locale} route={{ kind: "category", category }} />
  );
}
