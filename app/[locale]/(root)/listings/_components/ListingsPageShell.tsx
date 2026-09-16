import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories as categoryConfig } from "@/config/const/navLinks";
import { localeAlternates } from "@/lib/seo/hreflang";
import { ListingsExperience, type CategoryOption } from "./ListingsExperience";

// Shared between the /listings index route and the /listings/<category>
// routes (the latter is branched out of the legacy listing-detail route,
// see app/[locale]/(root)/(marketplace)/listings/[slug]/page.tsx) so both
// build the same metadata + page shell from one place.

export async function buildListingsMetadata(
  locale: string,
  categoryId: string | null,
): Promise<Metadata> {
  setRequestLocale(locale);

  if (!categoryId) {
    return {
      title: "All Listings: Browse Every Category | SLMarket.lk",
      description:
        "Browse vehicles, property, electronics, fashion, jobs and more across Sri Lanka. Filter by location, price, condition and deals to find exactly what you need.",
      alternates: { languages: localeAlternates("/listings") },
    };
  }

  const category = categoryConfig.find((c) => c.id === categoryId);
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const name = category ? tCat(`${category.id}.name`) : categoryId;

  return {
    title: `${name} Listings in Sri Lanka | SLMarket.lk`,
    description: `Browse ${name} listings across Sri Lanka on SLMarket.lk. Filter by location, price, condition and deals to find exactly what you need.`,
    alternates: { languages: localeAlternates(`/listings/${categoryId}`) },
  };
}

export async function ListingsPageShell({
  locale,
  categoryId,
}: {
  locale: string;
  categoryId: string | null;
}) {
  setRequestLocale(locale);

  const tCat = await getTranslations({ locale, namespace: "categories" });

  const categories: CategoryOption[] = categoryConfig.map((category) => ({
    id: category.id,
    name: tCat(`${category.id}.name`),
    iconName: category.icon,
  }));

  return (
    <Suspense fallback={<div className="marketplace-page min-h-[60vh]" />}>
      <ListingsExperience
        categories={categories}
        initialCategoryId={categoryId}
      />
    </Suspense>
  );
}
