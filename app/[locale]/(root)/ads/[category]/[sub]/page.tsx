import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories as categoryConfig } from "@/config/const/navLinks";
import {
  buildListingsMetadata,
  ListingsPageShell,
} from "../../_components/ListingsPageShell";

interface Props {
  params: Promise<{ category: string; sub: string; locale: string }>;
}

// /ads/<category>/<subcategory>, e.g. /ads/vehicles/cars. Both segments
// come from the fixed taxonomy in config/const/navLinks.ts.
function matchedIds(category: string, sub: string) {
  const cat = categoryConfig.find((c) => c.id === category);
  const subcategory = cat?.subcategories.find((s) => s.id === sub);
  return cat && subcategory
    ? { categoryId: cat.id, subcategoryId: subcategory.id }
    : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, sub, locale } = await params;
  const ids = matchedIds(category, sub);
  if (!ids) return { title: "Not Found" };
  return buildListingsMetadata(locale, ids.categoryId, ids.subcategoryId);
}

export default async function SubcategoryAdsPage({ params }: Props) {
  const { category, sub, locale } = await params;
  const ids = matchedIds(category, sub);
  if (!ids) notFound();

  return (
    <ListingsPageShell
      locale={locale}
      categoryId={ids.categoryId}
      subcategoryId={ids.subcategoryId}
    />
  );
}
