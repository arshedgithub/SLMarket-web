import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories as categoryConfig } from "@/config/const/navLinks";
import { localeAlternates } from "@/lib/seo/hreflang";
import { ListingsExperience, type CategoryOption } from "./ListingsExperience";
import { DEAL_ROUTE_TYPES, type DealRouteType } from "./dealRoutes";
import { DEAL_VALUES } from "./data";
import {
  featuredStripShops,
  feedStats,
  getAdFeed,
  getShopFeed,
} from "@/lib/listings/feed";
import {
  GPS_COOKIE,
  PLACE_COOKIE,
  resolveOrigin,
} from "@/lib/listings/nearYou";
import { getPopularSearches } from "@/lib/search/popular";
import { VIEWPORT_COOKIE, type Bucket } from "./adQuery";

const BUCKET_NAMES: Bucket[] = ["mobile", "tablet", "laptop", "desktop"];

// The server's guess at the screen size, for ads per page: the size saved
// on the last visit, else the browser's mobile hint or user agent.
function guessBucket(saved: string | undefined, h: Headers): Bucket {
  if (saved && (BUCKET_NAMES as string[]).includes(saved))
    return saved as Bucket;
  if (h.get("sec-ch-ua-mobile") === "?1") return "mobile";
  const ua = h.get("user-agent") ?? "";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android/i.test(ua)) return "mobile";
  return "desktop";
}

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

  const [ads, shops, jar, h] = await Promise.all([
    getAdFeed(),
    getShopFeed(),
    cookies(),
    headers(),
  ]);
  const stats = feedStats(ads);
  const origin = resolveOrigin({
    gps: decodeURIComponent(jar.get(GPS_COOKIE)?.value ?? ""),
    chosen: decodeURIComponent(jar.get(PLACE_COOKIE)?.value ?? ""),
  }).district;

  const dealScope = isDeals
    ? dealType
      ? [DEAL_ROUTE_TYPES[dealType].tag]
      : DEAL_VALUES
    : null;

  return (
    <Suspense
      fallback={<div className="marketplace-page ads-page min-h-[60vh]" />}
    >
      {/* key: the same page component serves every deal/category/subcategory
          URL, and filter state is seeded from the URL once on mount. */}
      <ListingsExperience
        key={`${categoryId}|${subcategoryId}|${dealType}|${isDeals}`}
        categories={categories}
        initialCategoryId={categoryId}
        initialSubcategoryId={subcategoryId}
        dealScope={dealScope}
        ads={ads}
        stats={stats}
        popularSearchList={await getPopularSearches(ads)}
        stripShops={featuredStripShops(shops)}
        initialBucket={guessBucket(jar.get(VIEWPORT_COOKIE)?.value, h)}
        initialOrigin={origin}
      />
    </Suspense>
  );
}
