export const revalidate = 60;

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, MapPin, ShieldCheck, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo/hreflang";
import { categories as categoryConfig } from "@/config/const/navLinks";
import {
  featuredStripShops,
  feedStats,
  getAdFeed,
  getShopFeed,
} from "@/lib/listings/feed";
import { getPopularSearches } from "@/lib/search/popular";
import { getPriceDropCount } from "@/lib/deals/priceDrops";
import { showCount, showNewToday } from "@/lib/listings/socialProof";
import { compactNumber } from "@/lib/format";
import { ALL_DISTRICTS, locationDistrict } from "./ads/_components/data";
import { FeaturedBusinessesStrip } from "./ads/_components/BusinessCards";
import { RecentlyViewed } from "./ad/[slug]/_components/RecentlyViewed";
import { HeroSearch } from "./_components/HeroSearch";
import { CategoryGrid } from "./_components/CategoryGrid";
import { LatestAds } from "./_components/LatestAds";
import { DealsSection } from "./_components/DealsSection";
import { DistrictLinks } from "./_components/DistrictLinks";
import { SellCta } from "./_components/SellCta";
import { SafetyTips } from "@/components/safety/SafetyTips";

// Districts offered (busiest first); the section shows 8, own district first.
const HOME_DISTRICTS = 25;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return {
    title: { absolute: t("title") },
    description: t("description"),
    keywords: t("keywords"),
    alternates: { languages: localeAlternates("/") },
  };
}

/*
 * Hero (search and trust) -> categories -> latest ads -> deals -> featured
 * businesses -> districts -> how to sell -> safety. Every number and every
 * offer is from the database; a block with nothing real to show is left
 * out (lib/listings/socialProof.ts sets the thresholds).
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  // The deals panel is a nice-to-have: if the database is unreachable the
  // homepage still renders, without it, instead of crashing.
  const [ads, shops, priceDropCount] = await Promise.all([
    getAdFeed(),
    getShopFeed(),
    getPriceDropCount().catch(() => 0),
  ]);
  // Coupons & Offers counts the ads its tile opens: ads carrying a coupon
  // code or a special offer.
  const offerCount = ads.filter(
    (a) => a.deal === "coupon" || a.deal === "offer",
  ).length;
  const stats = feedStats(ads);
  const heroSearches = await getPopularSearches(ads);

  const allCategories = categoryConfig.map((c) => ({
    id: c.id,
    name: tCat(`${c.id}.name`),
    iconName: c.icon,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      name: tCat(`${c.id}.subcategories.${s.id}`),
    })),
  }));
  const districtCounts = new Map<string, number>();
  for (const a of ads) {
    const d = locationDistrict(a.location);
    if (ALL_DISTRICTS.includes(d))
      districtCounts.set(d, (districtCounts.get(d) ?? 0) + 1);
  }
  const districts = [...districtCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, HOME_DISTRICTS)
    .map(([name, count]) => ({
      name,
      countLabel: showCount(count) ? compactNumber(count, locale) : "",
    }));

  const trust = [
    { icon: BadgeCheck, label: t("hero.trustVerified"), href: null },
    { icon: Tag, label: t("hero.trustFree"), href: null },
    { icon: ShieldCheck, label: t("hero.trustSafety"), href: "/help/safety" },
    { icon: MapPin, label: t("hero.trustIslandwide"), href: null },
  ];

  return (
    <div className="marketplace-page">
      {/* HERO: kept short so the first row of ads shows at 1366 x 768. */}
      <section className="relative isolate border-b border-[var(--color-market-border)] bg-gradient-to-b from-[#eef4ff] to-[var(--color-market-background)] dark:from-[#0c1a30]">
        <div className="mx-auto max-w-4xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pt-8">
          <h1 className="font-heading text-balance text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[#10213f] sm:text-4xl dark:text-white">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-balance text-[15px] text-slate-700 sm:text-base dark:text-slate-300">
            {t("hero.subline")}
          </p>

          <div className="mx-auto mt-5 max-w-3xl text-left">
            <HeroSearch
              categories={allCategories}
              districts={ALL_DISTRICTS}
              labels={{
                allCategories: t("hero.searchAllCategories"),
                category: t("hero.searchCategoryLabel"),
                allSriLanka: t("hero.allSriLanka"),
                location: t("hero.searchLocationLabel"),
                useMyLocation: t("hero.useMyLocation"),
                placeholder: t("hero.searchPlaceholder"),
                search: t("hero.searchLabel"),
                searchButton: t("hero.searchButton"),
              }}
            />
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {trust.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                {href ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-blue-700 hover:underline"
                  >
                    <Icon aria-hidden className="h-4 w-4 text-blue-600" />
                    {label}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon aria-hidden className="h-4 w-4 text-blue-600" />
                    {label}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {heroSearches.length > 0 && (
            <div className="scrollbar-hide -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0">
              <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("hero.popularLabel")}
              </span>
              {heroSearches.map((search) => (
                <Link
                  key={search.label}
                  href={search.href}
                  className="inline-flex h-9 shrink-0 items-center rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {search.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES: the busiest ones, "More" opens the All categories menu */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
        <CategoryGrid
          heading={t("browse.heading")}
          moreLabel={t("browse.more")}
          items={categoryConfig.map((category) => {
            const count = stats.byCategory[category.id] ?? 0;
            return {
              id: category.id,
              name: tCat(`${category.id}.name`),
              count,
              // Small numbers read as an empty marketplace (socialProof.ts).
              countLabel: showCount(count)
                ? t("browse.countLabel", {
                    count,
                    shown: compactNumber(count, locale),
                  })
                : "",
            };
          })}
        />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <LatestAds
          heading={t("latest.heading")}
          newToday={
            showNewToday(stats.postedToday)
              ? t("latest.newToday", { count: stats.postedToday })
              : ""
          }
          listings={ads}
          labels={{
            tabs: t("latest.tabsLabel"),
            latest: t("latest.latest"),
            featured: t("latest.featured"),
            deals: t("latest.deals"),
            nearIn: t("latest.nearIn", { district: "{district}" }),
            viewAll: t("latest.viewAll"),
          }}
        />
        <RecentlyViewed
          currentSlug=""
          heading={t("forYou.recentlyViewed")}
          clearLabel={t("forYou.clear")}
        />
      </div>

      <DealsSection
        priceDropCount={priceDropCount}
        offerCount={offerCount}
        t={{
          eyebrow: t("deals.eyebrow"),
          headingStart: t("deals.headingStart"),
          headingHighlight: t("deals.headingHighlight"),
          desc: t("deals.desc"),
          cta: t("deals.cta"),
          couponsTitle: t("deals.coupons.title"),
          couponsDesc: t("deals.coupons.desc"),
          couponsCta: t("deals.coupons.cta"),
          couponsCount: t("deals.coupons.countLabel", { count: offerCount }),
          priceTitle: t("deals.priceDrops.title"),
          priceDesc: t("deals.priceDrops.desc"),
          priceCta: t("deals.priceDrops.cta"),
          priceCount: t("deals.priceDrops.countLabel", {
            count: priceDropCount,
          }),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 empty:hidden sm:px-6">
        <FeaturedBusinessesStrip shops={featuredStripShops(shops)} />
      </div>

      {/* Before the footer: discover by district, sell, then stay safe. */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-6 pt-8 sm:px-6 lg:gap-12">
        <DistrictLinks
          districts={districts}
          labels={{
            eyebrow: t("districts.eyebrow"),
            headingStart: t("districts.headingStart"),
            headingHighlight: t("districts.headingHighlight"),
            desc: t("districts.desc"),
            viewAll: t("districts.all"),
          }}
        />

        <SellCta
          t={{
            eyebrow: t("sell.eyebrow"),
            heading: t("sell.heading"),
            desc: t("sell.desc"),
            benefits: [
              t("sell.benefit1"),
              t("sell.benefit2"),
              t("sell.benefit3"),
            ],
            panelTitle: t("sell.panelTitle"),
            panelDesc: t("sell.panelDesc"),
            ctaPost: t("sell.ctaPost"),
            ctaShop: t("sell.ctaShop"),
          }}
        />

        <SafetyTips locale={locale} variant="strip" />
      </div>
    </div>
  );
}
