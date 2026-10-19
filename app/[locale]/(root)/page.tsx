export const revalidate = 60;

import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo/hreflang";

import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Camera,
  Clock,
  Eye,
  Flag,
  Heart,
  MapPin,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
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
import { getPriceDropCount } from "@/lib/deals/priceDrops";
import { getActiveOfferCount } from "@/lib/deals/offers";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type IconComponent = React.ComponentType<{ className?: string }>;

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

const DEAL_ICON_DIR = "/images/marketplace/deals/icons";
const DEAL_ICON = {
  gift: `${DEAL_ICON_DIR}/gift.webp`,
  trendingUp: `${DEAL_ICON_DIR}/trending-up.webp`,
  percent: `${DEAL_ICON_DIR}/percent.webp`,
};

// Mobile App section perks — rendered inside the photo card on desktop,
// and as a separate block below it on mobile (see the section itself).
const MOBILE_APP_FEATURES: {
  key: "f1" | "f2" | "f3" | "f4";
  icon: IconComponent;
}[] = [
  { key: "f1", icon: Smartphone },
  { key: "f2", icon: Bell },
  { key: "f3", icon: Heart },
  { key: "f4", icon: MapPin },
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
 * MINI FEATURE (sell + mobile-app sections)
 * ============================================================
 */

function MiniFeature({
  icon: Icon,
  title,
  desc,
  stack = false,
}: {
  icon: IconComponent;
  title: string;
  desc: string;
  stack?: boolean;
}) {
  return (
    <div
      className={stack ? "flex flex-col gap-1.5" : "flex items-start gap-2.5"}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100/80 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--color-market-text)]">
          {title}
        </p>
        <p className="text-xs leading-4 text-[var(--color-market-text-muted)]">
          {desc}
        </p>
      </div>
    </div>
  );
}

const WHY_SOCIALS_ROW1 = [
  "/images/social/facebook.webp",
  "/images/social/instagram.webp",
  "/images/social/tiktok.webp",
];
const WHY_SOCIALS_ROW2 = [
  "/images/social/whatsapp.webp",
  "/images/social/linkedin.webp",
];

function WhyCard({
  tint,
  badge,
  title,
  desc,
  image,
  imageInset = false,
  socials = false,
}: {
  tint: string;
  badge: string;
  title: string;
  desc: string;
  image?: string;
  imageInset?: boolean;
  socials?: boolean;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/[0.04] ${tint} transition hover:-translate-y-1 hover:shadow-lg`}
    >
      {/* Mobile: badge beside the text. Desktop: badge above the text. */}
      <div className="flex flex-1 items-center gap-3.5 p-4 sm:flex-col sm:items-stretch sm:gap-0 sm:p-5">
        <Image
          src={badge}
          alt=""
          width={56}
          height={56}
          className="h-12 w-12 shrink-0 drop-shadow-sm sm:h-14 sm:w-14"
        />
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold leading-snug text-[var(--color-market-text)] sm:mt-3.5 sm:text-base">
            {title}
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-[var(--color-market-text-secondary)] sm:mt-2 sm:text-sm sm:leading-6">
            {desc}
          </p>
        </div>
      </div>

      {/* Card media — desktop / tablet only; mobile cards are text + badge */}
      {socials ? (
        <div className="hidden flex-col items-center gap-3 px-5 pb-6 sm:flex">
          <div className="flex justify-center gap-3">
            {WHY_SOCIALS_ROW1.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={44}
                height={44}
                className="h-10 w-10 drop-shadow-sm"
              />
            ))}
          </div>
          <div className="flex justify-center gap-3">
            {WHY_SOCIALS_ROW2.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={44}
                height={44}
                className="h-10 w-10 drop-shadow-sm"
              />
            ))}
          </div>
        </div>
      ) : image ? (
        <div
          className={`relative hidden sm:block ${
            imageInset ? "mx-6 h-32 sm:mx-8 sm:h-36" : "h-36 w-full sm:h-40"
          }`}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="280px"
            className="object-contain object-bottom"
          />
        </div>
      ) : null}
    </div>
  );
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

  // The deals panel is a nice-to-have: if the database is unreachable the
  // homepage still renders, with zero counts, instead of crashing.
  const [priceDropCount, offerCount] = await Promise.all([
    getPriceDropCount().catch(() => 0),
    getActiveOfferCount().catch(() => 0),
  ]);

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
          DEALS & OFFERS
          ====================================================== */}

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
          SELL ON SLMARKET
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative isolate flex min-h-[440px] items-center overflow-hidden rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] shadow-[0_20px_55px_-24px_rgba(16,33,63,0.22)] sm:min-h-[500px]">
          {/* Mobile: the same soft wavy background as Deals & Offers */}
          <Image
            src="/images/marketplace/deals/background.webp"
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover object-bottom opacity-90 dark:opacity-20 sm:hidden"
          />
          {/* Desktop / tablet: the seller photo */}
          <Image
            src="/images/marketplace/pages/sell/background.webp"
            alt=""
            fill
            priority={false}
            sizes="(max-width: 1320px) 100vw, 1240px"
            className="-z-10 hidden object-cover object-right sm:block"
          />
          <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-white from-30% via-white/80 to-transparent to-80% dark:from-[#0c1422] dark:via-[#0c1422]/85 sm:block" />

          <div className="max-w-xl p-6 sm:p-10 lg:p-14">
            <div className="mb-4">
              <SectionEyebrow icon={Sparkles}>
                {t("sell.eyebrow")}
              </SectionEyebrow>
            </div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
              {t("sell.heading")}{" "}
              <span className="text-[#1557d6]">SLMarket.lk</span>
            </h2>
            <p className="mt-2 text-lg font-semibold text-[var(--color-market-text)]">
              {t("sell.tagline")}
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-market-text-secondary)]">
              {t("sell.desc")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/post-ad"
                className="btn-solid inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
              >
                {t("sell.ctaPost")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business/new"
                className="btn-outline inline-flex items-center gap-2 rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold backdrop-blur"
              >
                {t("sell.ctaShop")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* How it works: three steps, about a minute. */}
            <p className="mt-7 text-sm font-bold uppercase tracking-wide text-[var(--color-market-text-secondary)]">
              {t("sell.stepsTitle")}
            </p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
              {(
                [
                  [Camera, "step1"],
                  [Wallet, "step2"],
                  [Rocket, "step3"],
                ] as const
              ).map(([Icon, key], i) => (
                <li
                  key={key}
                  className="flex items-start gap-2.5 rounded-xl bg-white/80 p-3 backdrop-blur dark:bg-white/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-market-text)]">
                      {i + 1}. {t(`sell.${key}Title`)}
                    </p>
                    <p className="text-[13px] leading-5 text-[var(--color-market-text-secondary)]">
                      {t(`sell.${key}Desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
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

      {/* ======================================================
          WHY SLMARKET
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 max-w-2xl">
          <SectionEyebrow icon={Sparkles}>{t("whyUs.eyebrow")}</SectionEyebrow>
          <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
            {t("whyUs.heading")}{" "}
            <span className="text-[#1557d6]">SLMarket.lk?</span>
          </h2>
          <p className="mt-3 text-[var(--color-market-text-secondary)]">
            {t("whyUs.desc")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <WhyCard
            tint="bg-blue-50 dark:bg-blue-950/40"
            badge="/images/marketplace/pages/why/icon-built.webp"
            title={t("whyUs.builtTitle")}
            desc={t("whyUs.builtDesc")}
            image="/images/marketplace/pages/why/sri-lanka.webp"
          />
          <WhyCard
            tint="bg-pink-50 dark:bg-pink-950/30"
            badge="/images/marketplace/pages/why/icon-discover.webp"
            title={t("whyUs.discoverTitle")}
            desc={t("whyUs.discoverDesc")}
            image="/images/marketplace/pages/why/discovery.webp"
            imageInset
          />
          <WhyCard
            tint="bg-emerald-50 dark:bg-emerald-950/30"
            badge="/images/marketplace/pages/why/icon-exposure.webp"
            title={t("whyUs.exposureTitle")}
            desc={t("whyUs.exposureDesc")}
            socials
          />
          <WhyCard
            tint="bg-amber-50 dark:bg-amber-950/30"
            badge="/images/marketplace/pages/why/icon-everyone.webp"
            title={t("whyUs.everyoneTitle")}
            desc={t("whyUs.everyoneDesc")}
            image="/images/marketplace/pages/why/storefront.webp"
          />
        </div>
      </section>

      {/* ======================================================
          MOBILE APP
          ====================================================== */}

      <section
        id="mobile-app"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6"
      >
        <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-market-border)] shadow-[0_20px_55px_-24px_rgba(16,33,63,0.22)] sm:min-h-[460px]">
          {/* Mobile: a tailored portrait shot (phones sit below the copy). */}
          <Image
            src="/images/marketplace/pages/mobile-app/background-mobile.webp"
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover object-top sm:hidden"
          />
          {/* Desktop / tablet: the wide phone photo, anchored right. */}
          <Image
            src="/images/marketplace/pages/mobile-app/background.webp"
            alt=""
            fill
            sizes="(max-width: 1320px) 100vw, 1240px"
            className="-z-10 hidden object-cover object-right sm:block"
          />
          {/* Mobile: wash the copy's whole zone solid, then fade out — the
              phones only start showing in the empty space left below the
              text, so nothing ever draws over them. */}
          <div className="absolute inset-x-0 top-0 -z-10 h-[380px] bg-gradient-to-b from-white from-78% to-transparent dark:from-[#0c1422] sm:hidden" />
          {/* Desktop / tablet: wash just enough of the left for the copy to
              stay legible — the phones in the middle/right stay visible. */}
          <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-white from-38% via-white/70 via-52% to-transparent to-66% dark:from-[#0c1422] dark:via-[#0c1422]/75 sm:block" />
          {/* Desktop / tablet only — the feature-card row sits at the very
              bottom of the photo card there, so it still needs a wash under
              it; mobile has that row below the card instead, so it doesn't. */}
          <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-2/5 bg-gradient-to-t from-white from-55% via-white/92 via-80% to-transparent dark:from-[#0c1422] dark:via-[#0c1422]/92 sm:block" />
          {/* Mobile: a matching wash behind the badges pinned to the bottom
              of the card. */}
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white via-white/85 to-transparent dark:from-[#0c1422] dark:via-[#0c1422]/85 sm:hidden" />

          <div className="flex min-h-[820px] flex-col gap-8 p-6 sm:min-h-0 sm:p-10 lg:p-14">
            <div className="max-w-xl">
              <div className="mb-4">
                <SectionEyebrow icon={Smartphone}>
                  {t("mobileApp.eyebrow")}
                </SectionEyebrow>
              </div>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
                <span className="text-[#1557d6]">SLMarket.lk</span>{" "}
                {t("mobileApp.heading")}
              </h2>
              <p className="mt-2 text-lg font-semibold text-[var(--color-market-text)]">
                {t("mobileApp.tagline")}
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-market-text-secondary)]">
                {t("mobileApp.desc")}
              </p>

              {/* Desktop / tablet: badges sit right under the copy, beside
                  the phones. */}
              <div className="mt-6 hidden flex-wrap items-center gap-3 sm:flex">
                <a href="#" aria-label="Download on the App Store">
                  <Image
                    src="/images/app-badges/app-store.webp"
                    alt="Download on the App Store"
                    width={480}
                    height={157}
                    className="h-12 w-auto transition hover:-translate-y-0.5"
                  />
                </a>
                <a href="#" aria-label="Get it on Google Play">
                  <Image
                    src="/images/app-badges/google-play.webp"
                    alt="Get it on Google Play"
                    width={480}
                    height={139}
                    className="h-12 w-auto transition hover:-translate-y-0.5"
                  />
                </a>
              </div>
              <p className="mt-2 hidden text-xs text-[var(--color-market-text-muted)] sm:block">
                {t("mobileApp.comingSoon")}
              </p>
            </div>

            {/* Mobile: badges pinned to the very bottom of the card, below
                the phones, instead of sitting on top of them. */}
            <div className="mt-auto flex flex-nowrap items-center justify-center gap-2 sm:hidden">
              <a
                href="#"
                aria-label="Download on the App Store"
                className="shrink-0"
              >
                <Image
                  src="/images/app-badges/app-store.webp"
                  alt="Download on the App Store"
                  width={480}
                  height={157}
                  className="h-8 w-auto transition hover:-translate-y-0.5"
                />
              </a>
              <a
                href="#"
                aria-label="Get it on Google Play"
                className="shrink-0"
              >
                <Image
                  src="/images/app-badges/google-play.webp"
                  alt="Get it on Google Play"
                  width={480}
                  height={139}
                  className="h-8 w-auto transition hover:-translate-y-0.5"
                />
              </a>
            </div>
            <p className="text-center text-xs text-[var(--color-market-text-muted)] sm:hidden">
              {t("mobileApp.comingSoon")}
            </p>

            {/* Feature grid — desktop / tablet only; on mobile the photo
                card stays short and the same grid sits below it instead,
                so it never has to compete with the phones for space. */}
            <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4">
              {MOBILE_APP_FEATURES.map(({ key, icon }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-md dark:border-white/10 dark:bg-white/10"
                >
                  <MiniFeature
                    icon={icon}
                    title={t(`mobileApp.${key}Title`)}
                    desc={t(`mobileApp.${key}Desc`)}
                    stack
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature grid — mobile only, below the photo card */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
          {MOBILE_APP_FEATURES.map(({ key, icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 shadow-sm"
            >
              <MiniFeature
                icon={icon}
                title={t(`mobileApp.${key}Title`)}
                desc={t(`mobileApp.${key}Desc`)}
                stack
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/*
 * ============================================================
 * DEALS & OFFERS SECTION
 * ============================================================
 */

type DealsCopy = {
  eyebrow: string;
  headingStart: string;
  headingHighlight: string;
  desc: string;
  cta: string;
  couponsTitle: string;
  couponsDesc: string;
  couponsCta: string;
  couponsCount: string;
  priceTitle: string;
  priceDesc: string;
  priceCta: string;
  priceCount: string;
};

function DealFeatureCard({
  image,
  tint,
  iconWrap,
  icon,
  title,
  description,
  noteIcon: NoteIcon,
  note,
  cta,
  href,
}: {
  image: string;
  tint: string;
  iconWrap: string;
  icon: string;
  title: string;
  description: string;
  noteIcon: IconComponent;
  note: string;
  cta: string;
  href: string;
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border border-black/[0.04] shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${tint}`}
    >
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 90vw, 340px"
          className="object-contain object-bottom px-4 pt-3 transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
          >
            <Image
              src={icon}
              alt=""
              width={40}
              height={40}
              className="h-5 w-5"
            />
          </span>
          <h3 className="text-base font-bold text-[var(--color-market-text)]">
            {title}
          </h3>
        </div>

        <p className="mt-2 flex-1 text-sm leading-6 text-[var(--color-market-text-secondary)]">
          {description}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/70 p-3 text-xs leading-5 text-[var(--color-market-text-muted)] dark:bg-white/10">
          <NoteIcon className="h-4 w-4 shrink-0 text-blue-500" />
          {note}
        </div>

        <Link
          href={href}
          className="mt-3.5 flex items-center justify-center gap-1.5 self-center whitespace-nowrap text-[15px] font-bold tracking-tight text-blue-600 hover:text-blue-700"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function DealsSection({
  t,
  priceDropCount,
  offerCount,
}: {
  t: DealsCopy;
  priceDropCount: number;
  offerCount: number;
}) {
  // Genuine data only — an empty tile looks broken, so it's hidden rather
  // than shown with a "0" count, and the whole section disappears once
  // there's nothing real to show in either tile. See lib/deals/priceDrops.ts
  // and lib/deals/offers.ts for what "genuine" means here.
  if (priceDropCount === 0 && offerCount === 0) return null;

  const tiles = [
    offerCount > 0 && {
      tint: "bg-[#fdf4e7] dark:bg-[#2a2418]",
      iconWrap: "bg-orange-500",
      icon: DEAL_ICON.gift,
      title: t.couponsTitle,
      tag: t.couponsCount,
      href: "/ads/deals/coupons",
    },
    priceDropCount > 0 && {
      tint: "bg-[#eef4fd] dark:bg-[#17263c]",
      iconWrap: "bg-blue-500",
      icon: DEAL_ICON.trendingUp,
      title: t.priceTitle,
      tag: t.priceCount,
      href: "/ads/deals/price-drops",
    },
  ].filter((tile): tile is Exclude<typeof tile, false> => Boolean(tile));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 shadow-[0_20px_55px_-24px_rgba(16,33,63,0.2)] sm:p-7 lg:p-9">
        <Image
          src="/images/marketplace/deals/background.webp"
          alt=""
          fill
          sizes="(max-width: 1320px) 100vw, 1240px"
          className="-z-10 object-cover object-bottom opacity-90 dark:opacity-20"
        />

        {/* Mobile — its own compact layout (not the desktop/tablet header) */}
        <div className="sm:hidden">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1557d6]">
                <Image
                  src={DEAL_ICON.percent}
                  alt=""
                  width={40}
                  height={40}
                  className="h-5 w-5"
                />
              </span>
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-extrabold leading-tight tracking-tight text-[var(--color-market-text)]">
                  {t.eyebrow}
                </h2>
                <p className="truncate text-xs text-[var(--color-market-text-muted)]">
                  {t.headingStart} {t.headingHighlight}
                </p>
              </div>
            </div>
            <Link
              href="/ads/deals"
              className="shrink-0 whitespace-nowrap pt-1 text-sm font-semibold text-blue-600"
            >
              {t.cta}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tiles.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className={`flex flex-col gap-2 rounded-2xl border border-black/[0.04] p-3 ${c.tint}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${c.iconWrap}`}
                >
                  <Image
                    src={c.icon}
                    alt=""
                    width={36}
                    height={36}
                    className="h-4.5 w-4.5"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[12px] font-bold leading-tight text-[var(--color-market-text)]">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs leading-tight text-[var(--color-market-text-muted)]">
                    {c.tag}
                  </p>
                </div>
                <ArrowRight className="mt-auto h-3.5 w-3.5 self-end text-[var(--color-market-text-muted)]" />
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden gap-8 sm:grid lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
          <div className="flex flex-col items-start justify-center">
            <SectionEyebrow icon={Tag}>{t.eyebrow}</SectionEyebrow>
            <h2 className="font-heading mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-market-text)] sm:text-4xl">
              {t.headingStart}{" "}
              <span className="text-[#1557d6]">{t.headingHighlight}</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-market-text-secondary)]">
              {t.desc}
            </p>

            <Link
              href="/ads/deals"
              className="btn-solid mt-6 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {offerCount > 0 && (
              <DealFeatureCard
                image="/images/marketplace/deals/coupons.webp"
                tint="bg-[#fdf4e7] dark:bg-[#2a2418]"
                iconWrap="bg-orange-500"
                icon={DEAL_ICON.gift}
                title={t.couponsTitle}
                description={t.couponsDesc}
                noteIcon={Store}
                note={t.couponsCount}
                cta={t.couponsCta}
                href="/ads/deals/coupons"
              />
            )}
            {priceDropCount > 0 && (
              <DealFeatureCard
                image="/images/marketplace/deals/price-drops.webp"
                tint="bg-[#eef4fd] dark:bg-[#17263c]"
                iconWrap="bg-blue-500"
                icon={DEAL_ICON.trendingUp}
                title={t.priceTitle}
                description={t.priceDesc}
                noteIcon={Clock}
                note={t.priceCount}
                cta={t.priceCta}
                href="/ads/deals/price-drops"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * SMALL COMPONENTS
 * ============================================================
 */
