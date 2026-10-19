import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";
import { categories } from "@/config/const/navLinks";
import { directorySitemapPaths } from "@/lib/business/directory/seo";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";

// Emits one sitemap entry per locale for a given path, each annotated with
// hreflang alternates pointing at its siblings — this is what lets Google
// index the /ta/ and /si/ versions as translations instead of duplicate
// content competing with /en/.
function localizedUrls(
  path: string,
  opts: Pick<
    MetadataRoute.Sitemap[number],
    "lastModified" | "priority" | "changeFrequency"
  >,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${BASE}/${locale}${path}`]),
  );
  return routing.locales.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    ...opts,
    alternates: { languages },
  }));
}

const staticHubs: MetadataRoute.Sitemap = [
  ...localizedUrls("/", { priority: 1.0, changeFrequency: "daily" }),
  ...localizedUrls("/ads", { priority: 0.95, changeFrequency: "hourly" }),
  ...localizedUrls("/ads/deals", {
    priority: 0.8,
    changeFrequency: "daily",
  }),
  ...localizedUrls("/ads/deals/coupons", {
    priority: 0.6,
    changeFrequency: "daily",
  }),
  ...localizedUrls("/ads/deals/price-drops", {
    priority: 0.6,
    changeFrequency: "daily",
  }),
  ...localizedUrls("/ads/deals/offers", {
    priority: 0.6,
    changeFrequency: "daily",
  }),
  ...localizedUrls("/categories", {
    priority: 0.7,
    changeFrequency: "weekly",
  }),
  ...localizedUrls("/about", { priority: 0.5, changeFrequency: "monthly" }),
  ...localizedUrls("/help", {
    priority: 0.4,
    changeFrequency: "monthly",
  }),
  ...localizedUrls("/help/faq", {
    priority: 0.4,
    changeFrequency: "monthly",
  }),
  ...localizedUrls("/help/contact", {
    priority: 0.4,
    changeFrequency: "monthly",
  }),
  ...localizedUrls("/help/privacy-policy", {
    priority: 0.3,
    changeFrequency: "yearly",
  }),
  ...localizedUrls("/help/safety", {
    priority: 0.4,
    changeFrequency: "yearly",
  }),
  ...localizedUrls("/help/terms", {
    priority: 0.3,
    changeFrequency: "yearly",
  }),
  // Every category and subcategory is a real, crawlable landing page (e.g.
  // "/ads/vehicles/cars") — this is where a classifieds site earns
  // long-tail search traffic, so each one gets its own sitemap entry.
  ...categories.flatMap((category) => [
    ...localizedUrls(`/ads/${category.id}`, {
      priority: 0.85,
      changeFrequency: "hourly",
    }),
    ...category.subcategories.flatMap((sub) =>
      localizedUrls(`/ads/${category.id}/${sub.id}`, {
        priority: 0.7,
        changeFrequency: "daily",
      }),
    ),
  ]),
];

// The directory, each category and subcategory with businesses in it, and
// each category-and-district page with enough businesses to be worth
// indexing (see lib/business/directory/seo.ts). Filtered views are not here.
async function directoryUrls(): Promise<MetadataRoute.Sitemap> {
  return (await directorySitemapPaths()).flatMap((path) =>
    localizedUrls(path, {
      priority: path === "/businesses" ? 0.8 : 0.7,
      changeFrequency: "daily",
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [directory, listings, businesses] = await Promise.all([
      directoryUrls(),
      db.listing.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      db.businessProfile.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const listingUrls: MetadataRoute.Sitemap = listings.flatMap((l) =>
      localizedUrls(`/ad/${l.slug}`, {
        lastModified: l.updatedAt,
        priority: 0.75,
        changeFrequency: "weekly",
      }),
    );

    const businessUrls: MetadataRoute.Sitemap = businesses.flatMap((b) =>
      localizedUrls(`/business/${b.slug}`, {
        lastModified: b.updatedAt,
        priority: 0.65,
        changeFrequency: "weekly",
      }),
    );

    return [...staticHubs, ...directory, ...listingUrls, ...businessUrls];
  } catch {
    return staticHubs;
  }
}
