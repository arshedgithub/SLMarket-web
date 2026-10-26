import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories as categoryConfig } from "@/config/const/navLinks";
import {
  buildListingsMetadata,
  ListingsPageShell,
} from "../_components/ListingsPageShell";

interface Props {
  params: Promise<{ category: string; locale: string }>;
}

function matchedCategoryId(id: string): string | null {
  return categoryConfig.find((c) => c.id === id)?.id ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, locale } = await params;
  const categoryId = matchedCategoryId(category);
  if (!categoryId) return { title: "Not Found" };
  return buildListingsMetadata(locale, categoryId);
}

export default async function CategoryAdsPage({ params }: Props) {
  const { category, locale } = await params;
  const categoryId = matchedCategoryId(category);
  if (!categoryId) notFound();

  return <ListingsPageShell locale={locale} categoryId={categoryId} />;
}
