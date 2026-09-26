import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories as categoryConfig } from "@/config/const/navLinks";
import { localeAlternates } from "@/lib/seo/hreflang";
import { ListingsExperience, type CategoryOption } from "./ListingsExperience";
import { DEAL_ROUTE_TYPES, type DealRouteType } from "./dealRoutes";
import { DEAL_VALUES } from "./data";

// Shared between the /ads index route, /ads/<category> and
// /ads/<category>/<sub> routes, and /ads/deals[/<type>] — all build the
// same metadata + page shell from one place.

export async function buildListingsMetadata(
  locale: string,
  categoryId: string | null,
  subcategoryId: string | null = null,
): Promise<Metadata> {
  setRequestLocale(locale);

  if (!categoryId) {
    return {
      // absolute: this title already ends in the brand name, so it must
      // skip the root layout's "%s | SLMarket.lk" template rather than
      // have it appended a second time.
      title: { absolute: "All Ads: Browse Every Category | SLMarket.lk" },
      description:
        "Browse vehicles, property, electronics, fashion, jobs and more across Sri Lanka. Filter by location, price, condition and deals to find exactly what you need.",
      alternates: { languages: localeAlternates("/ads") },
    };
  }

  const category = categoryConfig.find((c) => c.id === categoryId);
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const name = category ? tCat(`${category.id}.name`) : categoryId;

  const subcategory = category?.subcategories.find(
    (s) => s.id === subcategoryId,
  );
  if (category && subcategory) {
    const subName = tCat(`${category.id}.subcategories.${subcategory.id}`);
    return {
      title: {
        absolute: `${subName} for Sale in Sri Lanka | ${name} | SLMarket.lk`,
      },
      description: `Browse ${subName} ads in ${name} across Sri Lanka on SLMarket.lk. Filter by location, price, condition and deals to find exactly what you need.`,
      alternates: {
        languages: localeAlternates(`/ads/${category.id}/${subcategory.id}`),
      },
    };
  }

  return {
    title: { absolute: `${name} Ads in Sri Lanka | SLMarket.lk` },
    description: `Browse ${name} ads across Sri Lanka on SLMarket.lk. Filter by location, price, condition and deals to find exactly what you need.`,
    alternates: { languages: localeAlternates(`/ads/${categoryId}`) },
  };
}

export function buildDealsMetadata(
  locale: string,
  dealType: DealRouteType | null,
): Metadata {
  setRequestLocale(locale);

  const label = dealType ? DEAL_ROUTE_TYPES[dealType].label : "Deals & Offers";
  const path = dealType ? `/ads/deals/${dealType}` : "/ads/deals";
  return {
    title: { absolute: `${label} in Sri Lanka | SLMarket.lk` },
    description:
      "Coupons and price drops from sellers across Sri Lanka. Find great deals near you on SLMarket.lk.",
    alternates: { languages: localeAlternates(path) },
  };
}

export async function ListingsPageShell({
  locale,
  categoryId,
  subcategoryId = null,
  dealType = null,
  isDeals = false,
}: {
  locale: string;
  categoryId: string | null;
  subcategoryId?: string | null;
  // isDeals marks /ads/deals; dealType narrows it to one deal type.
  dealType?: DealRouteType | null;
  isDeals?: boolean;
}) {
  setRequestLocale(locale);

  const tCat = await getTranslations({ locale, namespace: "categories" });

  const categories: CategoryOption[] = categoryConfig.map((category) => ({
    id: category.id,
    name: tCat(`${category.id}.name`),
    iconName: category.icon,
    subcategories: category.subcategories.map((sub) => ({
      id: sub.id,
      name: tCat(`${category.id}.subcategories.${sub.id}`),
    })),
  }));

  const dealScope = isDeals
    ? dealType
      ? [DEAL_ROUTE_TYPES[dealType].tag]
      : DEAL_VALUES
    : null;

  return (
    <Suspense fallback={<div className="marketplace-page min-h-[60vh]" />}>
      {/* key: the same page component serves every deal/category/subcategory
          URL, and filter state is seeded from the URL once on mount. */}
      <ListingsExperience
        key={`${categoryId}|${subcategoryId}|${dealType}|${isDeals}`}
        categories={categories}
        initialCategoryId={categoryId}
        initialSubcategoryId={subcategoryId}
        dealScope={dealScope}
      />
    </Suspense>
  );
}
