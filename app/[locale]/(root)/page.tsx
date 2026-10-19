export const revalidate = 60;

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo/hreflang";

import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Flag,
  MapPin,
  ShieldCheck,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { categories as categoryConfig } from "@/config/const/navLinks";
import { CategoryGrid } from "./_components/CategoryGrid";
import { LatestAds } from "./_components/LatestAds";
import { SavedSearchesStrip } from "./_components/SavedSearchesStrip";
import { RecentlyViewed } from "./ad/[slug]/_components/RecentlyViewed";
import {
  featuredStripShops,
  feedStats,
  getAdFeed,
  getShopFeed,
} from "@/lib/listings/feed";
import { popularSearches as derivePopularSearches } from "@/lib/listings/popularSearches";
import { showCount, showNewToday } from "@/lib/listings/socialProof";
import { ALL_DISTRICTS } from "./ads/_components/data";
import { FeaturedBusinessesStrip } from "./ads/_components/BusinessCards";
import { HeroSearch } from "./_components/HeroSearch";
import { SectionEyebrow } from "./_components/SectionHeader";

// The districts most people search in, for "Browse by district".
const HOME_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kandy",
  "Kurunegala",
  "Galle",
  "Kalutara",
  "Jaffna",
  "Matara",
];

/*
 * ============================================================
 * METADATA
 * ============================================================
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "seo.home",
  });

  return {
    title: {
      absolute:
        t("title") ||
        "SLMarket.lk: Sri Lanka's Trusted Marketplace to Buy & Sell",
    },

    description:
      t("description") ||
      "Buy, sell and discover great deals across Sri Lanka.",

    keywords:
      t("keywords") ||
      "Sri Lanka marketplace, buy sell Sri Lanka, property, vehicles, jobs, electronics",

    alternates: {
      languages: localeAlternates("/"),
    },
  };
}

/*
 * ============================================================
 * HOME PAGE
 * ============================================================
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

  // Real ads, newest first (lib/listings/feed.ts), and the counts around them.
  const [latestListings, shops] = await Promise.all([
    getAdFeed(),
    getShopFeed(),
  ]);
  const stats = feedStats(latestListings);
  const heroSearches = derivePopularSearches(latestListings, 6);
  const now = Date.now();

  const heroCategories = categoryConfig.map((category) => ({
    id: category.id,
    name: tCat(`${category.id}.name`),
    iconName: category.icon,
  }));

  const trust = [
    { icon: BadgeCheck, label: t("hero.trustVerified"), href: null },
    { icon: Tag, label: t("hero.trustFree"), href: null },
    { icon: ShieldCheck, label: t("hero.trustSafety"), href: "/help/safety" },
    { icon: MapPin, label: t("hero.trustIslandwide"), href: null },
  ];

  return (
    <div className="marketplace-page">
      {/* ======================================================
          HERO: benefit, search, trust. Kept short so the first ads
          start within the first screen on a laptop.
          ====================================================== */}

      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#eaf3ff] to-[var(--color-market-background)] dark:from-[#0c1a30]">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(55%_80%_at_50%_0%,rgba(21,87,214,0.10),transparent_70%)]"
        />
        {/* A faint dotted texture, fading out towards the content. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(21,87,214,0.10)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_90%_at_50%_0%,black,transparent)] dark:bg-[radial-gradient(rgba(147,180,255,0.08)_1px,transparent_1px)]"
        />
        <div className="mx-auto max-w-4xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pb-7 sm:pt-8 lg:pt-10">
          <h1 className="font-heading text-balance text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[#10213f] sm:text-4xl lg:text-[44px] dark:text-white">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-balance text-[15px] text-slate-700 sm:text-base dark:text-slate-300">
            {t("hero.subline")}
          </p>

          <div className="mx-auto mt-5 max-w-3xl text-left">
            <HeroSearch
              categories={heroCategories}
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

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
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
            <div className="scrollbar-hide -mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 sm:text-sm dark:text-slate-300">
                {t("hero.popularLabel")}
              </span>
              {heroSearches.map((search) => (
                <Link
                  key={search.label}
                  href={search.href}
                  className="inline-flex h-9 shrink-0 items-center rounded-full border border-slate-200 bg-white/90 px-3.5 text-[13px] font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 sm:text-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  {search.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/ads"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300"
          >
            {showNewToday(stats.postedToday) && (
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            )}
            {showNewToday(stats.postedToday)
              ? t("hero.newToday", { count: stats.postedToday })
              : t("hero.browseLatest")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ======================================================
          CATEGORIES: the busiest ones, the rest behind "More"
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
        <CategoryGrid
          heading={t("browse.heading")}
          moreLabel={t("browse.more")}
          lessLabel={t("browse.less")}
          emptyLabel={t("browse.beFirst")}
          items={categoryConfig.map((category) => {
            const count = stats.byCategory[category.id] ?? 0;
            return {
              id: category.id,
              name: tCat(`${category.id}.name`),
              count,
              // Small numbers read as an empty marketplace (socialProof.ts).
              countLabel: showCount(count)
                ? t("browse.countLabel", { count })
                : count > 0
                  ? t("browse.countNew")
                  : "",
            };
          })}
        />
      </section>

      {/* ======================================================
          LATEST ADS: real ads on the first screen
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <LatestAds
          heading={t("latest.heading")}
          listings={latestListings}
          labels={{
            tabs: t("latest.tabsLabel"),
            latest: t("latest.latest"),
            featured: t("latest.featured"),
            deals: t("latest.deals"),
            near: t("latest.near"),
            nearIn: t("latest.nearIn", { district: "{district}" }),
            nearEmpty: t("latest.nearEmpty", { district: "{district}" }),
            nearAsk: t("latest.nearAsk"),
            useMyLocation: t("hero.useMyLocation"),
            chooseDistrict: t("latest.chooseDistrict"),
            viewAll: t("latest.viewAll"),
          }}
        />
      </section>

      {/* Returning visitors: their saved searches and recently viewed ads
          (each hidden when empty). */}
      <SavedSearchesStrip
        heading={t("forYou.savedSearches")}
        manageLabel={t("forYou.manage")}
      />
      <div className="mx-auto max-w-7xl px-4 empty:hidden sm:px-6">
        <RecentlyViewed currentSlug="" heading={t("forYou.recentlyViewed")} />
      </div>

      {/* ======================================================
          FEATURED BUSINESSES (3 or more, else not shown)
          ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 empty:hidden sm:px-6">
        <FeaturedBusinessesStrip
          shops={featuredStripShops(shops, now)}
          now={now}
        />
      </div>

      {/* ======================================================
          BROWSE BY DISTRICT
          ====================================================== */}

      <section
        aria-labelledby="districts-heading"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <h2
          id="districts-heading"
          className="font-heading text-xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-3xl"
        >
          {t("districts.heading")}
        </h2>
        <p className="mt-1 text-[15px] text-[var(--color-market-text-secondary)]">
          {t("districts.desc")}
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
          {HOME_DISTRICTS.map((d) => (
            <li key={d}>
              <Link
                href={`/ads?location=${encodeURIComponent(d)}`}
                className="flex h-12 items-center gap-2 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3.5 text-[15px] font-semibold text-[var(--color-market-text)] transition hover:border-blue-300 hover:text-blue-700"
              >
                <MapPin
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-blue-600"
                />
                <span className="truncate">{d}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/ads"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300"
        >
          {t("districts.all")}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>

      {/* ======================================================
          SELL: three steps and the two ways to start
          ====================================================== */}

      <section
        aria-labelledby="sell-heading"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h2
                id="sell-heading"
                className="font-heading text-2xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-3xl"
              >
                {t("sell.stepsTitle")}
              </h2>
              <p className="mt-2 text-[15px] text-[var(--color-market-text-secondary)]">
                {t("sell.desc")}
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3 lg:max-w-2xl lg:flex-1">
              {(["step1", "step2", "step3"] as const).map((key, i) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-market-text)]">
                      {t(`sell.${key}Title`)}
                    </p>
                    <p className="text-sm text-[var(--color-market-text-secondary)]">
                      {t(`sell.${key}Desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/post-ad"
              className="btn-solid inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              {t("sell.ctaPost")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/business/new"
              className="inline-flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              {t("sell.ctaShop")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          SAFETY: trust before the transaction
          ====================================================== */}

      <section
        aria-labelledby="safety-heading"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-8 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionEyebrow icon={ShieldCheck}>
                {t("safety.eyebrow")}
              </SectionEyebrow>
              <h2
                id="safety-heading"
                className="font-heading mt-3 text-2xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-3xl"
              >
                {t("safety.heading")}
              </h2>
            </div>
            <Link
              href="/help/safety"
              className="btn-outline inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold dark:bg-transparent"
            >
              {t("safety.cta")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                [Wallet, "tip1"],
                [Users, "tip2"],
                [Eye, "tip3"],
                [Flag, "tip4"],
              ] as const
            ).map(([Icon, key]) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-2xl bg-[var(--color-market-surface)] p-4 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[var(--color-market-text)]">
                    {t(`safety.${key}Title`)}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-[var(--color-market-text-secondary)]">
                    {t(`safety.${key}Desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
