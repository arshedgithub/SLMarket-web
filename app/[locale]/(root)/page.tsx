export const revalidate = 60;

import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo/hreflang";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  Car,
  Clock,
  Crown,
  Gem,
  Handshake,
  Heart,
  Home,
  Leaf,
  MapPin,
  Megaphone,
  MessageCircle,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { categories as categoryConfig } from "@/config/const/navLinks";
import {
  CategoryRail,
  type CategoryRailItem,
} from "./_components/CategoryRail";
import { HeroSearch } from "./_components/HeroSearch";
import { Rail } from "./_components/Rail";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type IconComponent = React.ComponentType<{ className?: string }>;

type PopularSearch = {
  label: string;
  href: string;
};

type SampleListing = {
  title: string;
  location: string;
  price: string;
  image: string;
  badge?: string;
  tags: string[];
};

/*
 * ============================================================
 * POPULAR SEARCHES
 * ============================================================
 */

const popularSearches: PopularSearch[] = [
  { label: "3BR House Negombo", href: "/search?q=3BR%20House%20Negombo" },
  { label: "Toyota Aqua 2015", href: "/search?q=Toyota%20Aqua%202015" },
  { label: "iPhone 13", href: "/search?q=iPhone%2013" },
  {
    label: "Part-time Job Colombo",
    href: "/search?q=Part-time%20Job%20Colombo",
  },
];

/*
 * ============================================================
 * SAMPLE / FALLBACK LISTINGS
 *
 * Placeholder data that gives the design a complete visual state. Swap
 * for a real database query / listing component later.
 * ============================================================
 */

const CAT_IMG = "/images/marketplace/categories";

const recommendedListings: SampleListing[] = [
  {
    title: "3BR House, Negombo",
    location: "Negombo",
    price: "Rs. 18.5M",
    image: `${CAT_IMG}/property.webp`,
    badge: "Verified Seller",
    tags: ["House", "3 Beds"],
  },
  {
    title: "Toyota Aqua 2015",
    location: "Colombo",
    price: "Rs. 6.2M",
    image: `${CAT_IMG}/vehicles.webp`,
    badge: "Negotiable",
    tags: ["Hybrid", "Auto", "2015"],
  },
  {
    title: "iPhone 13, 128GB",
    location: "Colombo",
    price: "Rs. 145,000",
    image: `${CAT_IMG}/electronics.webp`,
    badge: "Verified Seller",
    tags: ["128GB", "Excellent"],
  },
  {
    title: "Accountant (Full-time)",
    location: "Colombo",
    price: "Rs. 80,000 to 120,000",
    image: `${CAT_IMG}/jobs.webp`,
    badge: "Verified Business",
    tags: ["Full-time", "Colombo"],
  },
  {
    title: "10 Perches Land",
    location: "Gampaha",
    price: "Rs. 2.8M",
    image: `${CAT_IMG}/agriculture.webp`,
    badge: "Verified Seller",
    tags: ["Land", "10 Perches"],
  },
];

/*
 * ============================================================
 * SAMPLE FEATURED SHOPS
 *
 * Placeholder data. Real shops (with a mix of personal-account and
 * premium-shop listings) come from the database once the schema is
 * extended for the general marketplace.
 * ============================================================
 */

type ShopTier = "toprated" | "premium" | "verified";

type SampleShop = {
  name: string;
  category: string;
  location: string;
  rating: number;
  listings: string;
  tagline: string;
  tier: ShopTier;
  cover: string;
  thumbs: string[];
  tags: string[];
  accent: "blue" | "orange" | "dark" | "green";
  icon: IconComponent;
};

const featuredShops: SampleShop[] = [
  {
    name: "TechZone Sri Lanka",
    category: "Electronics",
    location: "Colombo",
    rating: 4.8,
    listings: "120+",
    tagline: "Latest Tech for a Better You",
    tier: "verified",
    cover: `${CAT_IMG}/electronics.webp`,
    thumbs: [
      `${CAT_IMG}/electronics.webp`,
      `${CAT_IMG}/jobs.webp`,
      `${CAT_IMG}/home-garden.webp`,
    ],
    tags: ["Laptops", "Phones", "Accessories"],
    accent: "blue",
    icon: Store,
  },
  {
    name: "HomeNest",
    category: "Home & Living",
    location: "Kandy",
    rating: 4.7,
    listings: "85+",
    tagline: "Make Your House a Home",
    tier: "premium",
    cover: `${CAT_IMG}/home-garden.webp`,
    thumbs: [
      `${CAT_IMG}/home-garden.webp`,
      `${CAT_IMG}/fashion.webp`,
      `${CAT_IMG}/food.webp`,
    ],
    tags: ["Furniture", "Decor", "Kitchen"],
    accent: "orange",
    icon: Home,
  },
  {
    name: "AutoHub LK",
    category: "Vehicles",
    location: "Colombo",
    rating: 4.6,
    listings: "60+",
    tagline: "Drive Your Dreams",
    tier: "verified",
    cover: `${CAT_IMG}/vehicles.webp`,
    thumbs: [
      `${CAT_IMG}/vehicles.webp`,
      `${CAT_IMG}/services.webp`,
      `${CAT_IMG}/electronics.webp`,
    ],
    tags: ["Cars", "Motorbikes", "Parts"],
    accent: "dark",
    icon: Car,
  },
  {
    name: "GreenFields",
    category: "Agriculture",
    location: "Kurunegala",
    rating: 4.8,
    listings: "95+",
    tagline: "For a Greener Tomorrow",
    tier: "toprated",
    cover: `${CAT_IMG}/agriculture.webp`,
    thumbs: [
      `${CAT_IMG}/agriculture.webp`,
      `${CAT_IMG}/animals.webp`,
      `${CAT_IMG}/food.webp`,
    ],
    tags: ["Plants", "Fertilizers", "Tools"],
    accent: "green",
    icon: Leaf,
  },
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
    title: t("title") || "SLMarket.lk: Sri Lanka's Marketplace for Every Need",

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
 * LISTING CARD
 * ============================================================
 */

function ListingCard({ listing }: { listing: SampleListing }) {
  return (
    <Link href="/search" className="market-listing-card group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 240px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {listing.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-blue-700 shadow-sm">
            {listing.badge}
          </span>
        )}

        <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm">
          <Heart className="h-4 w-4" />
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold text-[var(--color-market-text)]">
          {listing.title}
        </h3>

        <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
          {listing.location}
        </p>

        <p className="mt-2 text-base font-bold text-[#1557d6]">
          {listing.price}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {listing.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
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

const WHY_SOCIALS = [
  "/images/social/facebook.webp",
  "/images/social/instagram.webp",
  "/images/social/tiktok.webp",
  "/images/social/whatsapp.webp",
];

function WhyCard({
  tint,
  iconWrap,
  icon: Icon,
  title,
  desc,
  image,
  socials = false,
}: {
  tint: string;
  iconWrap: string;
  icon: IconComponent;
  title: string;
  desc: string;
  image?: string;
  socials?: boolean;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-black/[0.04] ${tint} transition hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="flex flex-1 flex-col p-5">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconWrap}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-3.5 text-base font-bold leading-snug text-[var(--color-market-text)]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-market-text-secondary)]">
          {desc}
        </p>
      </div>

      {socials ? (
        <div className="flex h-44 items-end gap-3.5 px-5 pb-8">
          {WHY_SOCIALS.map((src) => (
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
      ) : image ? (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="320px"
            className="object-cover object-bottom"
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

  const catItems: CategoryRailItem[] = categoryConfig.map((category) => ({
    id: category.id,
    name: tCat(`${category.id}.name`),
    href: category.href,
    image: category.image,
    description: t(`categoryTaglines.${category.id}`),
    iconName: category.icon,
  }));

  return (
    <div className="marketplace-page">
      {/* ======================================================
          HERO — contained so it doesn't sprawl on wide screens
          ====================================================== */}

      <section className="marketplace-hero mx-auto max-w-7xl">
        <div className="marketplace-hero-photo">
          <Image
            src="/images/hero-bg.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1320px) 100vw, 1280px"
            className="object-cover object-center"
          />
        </div>

        <div className="marketplace-hero-edges" />
        <div className="marketplace-hero-scrim" />
        <div className="marketplace-hero-basefade" />

        <div className="px-6 pb-10 pt-10 sm:px-10 sm:pb-12 sm:pt-14 lg:px-14 lg:pt-16">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900 dark:bg-slate-900/70 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#10213f] sm:text-5xl lg:text-[58px] dark:text-white">
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleLine2")}
              <br />
              <span className="text-[#1557d6] dark:text-[#72a1ff]">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-700 sm:text-lg dark:text-slate-200">
              {t("hero.subtitle")}
            </p>

            {/* SEARCH — input, premium category dropdown, then an icon button */}
            <HeroSearch
              items={catItems}
              allLabel={t("hero.searchAllCategories")}
              placeholder={t("hero.searchPlaceholder")}
              searchLabel={t("hero.searchLabel")}
              categoryLabel={t("hero.searchCategoryLabel")}
              searchButtonLabel={t("hero.searchButton")}
            />

            {/* POPULAR SEARCH */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("hero.popularLabel")}
              </span>

              {popularSearches.map((search) => (
                <Link
                  key={search.label}
                  href={search.href}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  {search.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CATEGORY RAIL — one horizontal row, overlaps the hero fade
          ====================================================== */}

      <section className="relative z-10 mx-auto mt-2 max-w-7xl px-4 sm:mt-3 sm:px-6">
        <CategoryRail
          items={catItems}
          heading={t("browse.heading")}
          subheading={t("browse.subheading")}
          viewAllLabel={t("browse.viewAll")}
        />
      </section>

      {/* ======================================================
          DEALS & OFFERS
          ====================================================== */}

      <DealsSection
        t={{
          eyebrow: t("deals.eyebrow"),
          headingStart: t("deals.headingStart"),
          headingHighlight: t("deals.headingHighlight"),
          desc: t("deals.desc"),
          cta: t("deals.cta"),
          couponsTitle: t("deals.coupons.title"),
          couponsDesc: t("deals.coupons.desc"),
          couponsNote: t("deals.coupons.note"),
          couponsCta: t("deals.coupons.cta"),
          priceTitle: t("deals.priceDrops.title"),
          priceDesc: t("deals.priceDrops.desc"),
          priceNote: t("deals.priceDrops.note"),
          priceCta: t("deals.priceDrops.cta"),
          negTitle: t("deals.negotiable.title"),
          negDesc: t("deals.negotiable.desc"),
          negNote: t("deals.negotiable.note"),
          negCta: t("deals.negotiable.cta"),
        }}
      />

      {/* ======================================================
          FEATURED LISTINGS
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Rail
          heading={t("featured.heading")}
          subheading={t("featured.subheading")}
          viewAllHref="/search"
          viewAllLabel={t("featured.viewAll")}
        >
          {recommendedListings.map((listing) => (
            <div
              key={listing.title}
              className="w-[210px] shrink-0 sm:w-[236px]"
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </Rail>
      </section>

      {/* ======================================================
          FEATURED SHOPS
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Rail
          eyebrow={t("shops.eyebrow")}
          heading={t("shops.heading")}
          headingHighlight={t("shops.headingHighlight")}
          subheading={t("shops.subheading")}
          viewAllHref="/sellers"
          viewAllLabel={t("shops.viewAll")}
        >
          {featuredShops.map((shop) => (
            <ShopCard
              key={shop.name}
              shop={shop}
              visitLabel={t("shops.visit")}
              listingsLabel={t("shops.listings")}
              moreLabel={t("shops.more")}
            />
          ))}
        </Rail>
      </section>

      {/* ======================================================
          SELL ON SLMARKET
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative isolate flex min-h-[440px] items-center overflow-hidden rounded-3xl border border-[var(--color-market-border)] shadow-[0_20px_55px_-24px_rgba(16,33,63,0.22)] sm:min-h-[500px]">
          <Image
            src="/images/marketplace/sell/background.webp"
            alt=""
            fill
            priority={false}
            sizes="(max-width: 1320px) 100vw, 1240px"
            className="-z-10 object-cover object-right"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white from-30% via-white/80 to-transparent to-80% dark:from-[#0c1422] dark:via-[#0c1422]/85" />

          <div className="max-w-xl p-6 sm:p-10 lg:p-14">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm">
              <Sparkles className="h-3 w-3" />
              {t("sell.eyebrow")}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
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
                href="/sell"
                className="btn-solid inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
              >
                {t("sell.ctaPost")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/seller-registration"
                className="btn-outline inline-flex items-center gap-2 rounded-xl bg-white/70 px-5 py-3 text-sm font-semibold backdrop-blur"
              >
                {t("sell.ctaShop")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-4">
              <MiniFeature
                icon={Tag}
                title={t("sell.freeTitle")}
                desc={t("sell.freeDesc")}
              />
              <MiniFeature
                icon={Users}
                title={t("sell.reachTitle")}
                desc={t("sell.reachDesc")}
              />
              <MiniFeature
                icon={Zap}
                title={t("sell.quickTitle")}
                desc={t("sell.quickDesc")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          WHY SLMARKET
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            <Gem className="h-3 w-3" />
            {t("whyUs.eyebrow")}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
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
            iconWrap="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            icon={MapPin}
            title={t("whyUs.builtTitle")}
            desc={t("whyUs.builtDesc")}
            image="/images/marketplace/why/sri-lanka.webp"
          />
          <WhyCard
            tint="bg-pink-50 dark:bg-pink-950/30"
            iconWrap="bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300"
            icon={Megaphone}
            title={t("whyUs.discoverTitle")}
            desc={t("whyUs.discoverDesc")}
            image="/images/marketplace/why/discovery.webp"
          />
          <WhyCard
            tint="bg-emerald-50 dark:bg-emerald-950/30"
            iconWrap="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
            icon={TrendingUp}
            title={t("whyUs.exposureTitle")}
            desc={t("whyUs.exposureDesc")}
            socials
          />
          <WhyCard
            tint="bg-amber-50 dark:bg-amber-950/30"
            iconWrap="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
            icon={Users}
            title={t("whyUs.everyoneTitle")}
            desc={t("whyUs.everyoneDesc")}
            image="/images/marketplace/why/storefront.webp"
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
        <div className="relative isolate flex min-h-[460px] flex-col justify-center overflow-hidden rounded-3xl border border-[var(--color-market-border)] shadow-[0_20px_55px_-24px_rgba(16,33,63,0.22)] sm:min-h-[520px]">
          <Image
            src="/images/marketplace/mobile-app/background.webp"
            alt=""
            fill
            sizes="(max-width: 1320px) 100vw, 1240px"
            className="-z-10 object-cover object-right"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white from-45% via-white/88 to-transparent to-95% dark:from-[#0c1422] dark:via-[#0c1422]/88" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-white/85 to-transparent dark:from-[#0c1422]/85" />

          <div className="flex flex-col gap-8 p-6 sm:p-10 lg:p-14">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm">
                <Smartphone className="h-3 w-3" />
                {t("mobileApp.eyebrow")}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
                <span className="text-[#1557d6]">SLMarket.lk</span>{" "}
                {t("mobileApp.heading")}
              </h2>
              <p className="mt-2 text-lg font-semibold text-[var(--color-market-text)]">
                {t("mobileApp.tagline")}
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-market-text-secondary)]">
                {t("mobileApp.desc")}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
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
              <p className="mt-2 text-xs text-[var(--color-market-text-muted)]">
                {t("mobileApp.comingSoon")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                {
                  icon: Smartphone,
                  title: t("mobileApp.f1Title"),
                  desc: t("mobileApp.f1Desc"),
                },
                {
                  icon: Bell,
                  title: t("mobileApp.f2Title"),
                  desc: t("mobileApp.f2Desc"),
                },
                {
                  icon: Heart,
                  title: t("mobileApp.f3Title"),
                  desc: t("mobileApp.f3Desc"),
                },
                {
                  icon: MapPin,
                  title: t("mobileApp.f4Title"),
                  desc: t("mobileApp.f4Desc"),
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-md dark:border-white/10 dark:bg-white/10"
                >
                  <MiniFeature
                    icon={f.icon}
                    title={f.title}
                    desc={f.desc}
                    stack
                  />
                </div>
              ))}
            </div>
          </div>
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
  couponsNote: string;
  couponsCta: string;
  priceTitle: string;
  priceDesc: string;
  priceNote: string;
  priceCta: string;
  negTitle: string;
  negDesc: string;
  negNote: string;
  negCta: string;
};

function DealFeatureCard({
  image,
  tint,
  iconWrap,
  icon: Icon,
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
  icon: IconComponent;
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
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${iconWrap}`}
          >
            <Icon className="h-5 w-5" />
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
          className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function DealsSection({ t }: { t: DealsCopy }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-5 shadow-[0_20px_55px_-24px_rgba(16,33,63,0.2)] sm:p-7 lg:p-9">
        <Image
          src="/images/marketplace/deals/background.webp"
          alt=""
          fill
          sizes="(max-width: 1320px) 100vw, 1240px"
          className="-z-10 object-cover object-bottom opacity-90 dark:opacity-20"
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              {t.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] tracking-tight text-[var(--color-market-text)] sm:text-4xl">
              {t.headingStart}
              <br />
              <span className="text-[#1557d6]">{t.headingHighlight}</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-market-text-secondary)]">
              {t.desc}
            </p>

            <Link
              href="/deals"
              className="btn-solid mt-6 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <DealFeatureCard
              image="/images/marketplace/deals/coupons.webp"
              tint="bg-[#fdf4e7] dark:bg-[#2a2418]"
              iconWrap="bg-orange-500"
              icon={Ticket}
              title={t.couponsTitle}
              description={t.couponsDesc}
              noteIcon={Store}
              note={t.couponsNote}
              cta={t.couponsCta}
              href="/deals?type=coupons"
            />
            <DealFeatureCard
              image="/images/marketplace/deals/price-drops.webp"
              tint="bg-[#eef4fd] dark:bg-[#17263c]"
              iconWrap="bg-blue-500"
              icon={TrendingDown}
              title={t.priceTitle}
              description={t.priceDesc}
              noteIcon={Clock}
              note={t.priceNote}
              cta={t.priceCta}
              href="/deals?type=price-drops"
            />
            <DealFeatureCard
              image="/images/marketplace/deals/negotiable.webp"
              tint="bg-[#eef7ef] dark:bg-[#172a1d]"
              iconWrap="bg-green-500"
              icon={Handshake}
              title={t.negTitle}
              description={t.negDesc}
              noteIcon={MessageCircle}
              note={t.negNote}
              cta={t.negCta}
              href="/deals?type=negotiable"
            />
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

const SHOP_ACCENT: Record<
  SampleShop["accent"],
  { grad: string; avatar: string }
> = {
  blue: {
    grad: "from-transparent via-[rgba(15,47,107,0.35)] to-[rgba(15,47,107,0.9)]",
    avatar: "bg-blue-600",
  },
  orange: {
    grad: "from-transparent via-[rgba(42,29,12,0.3)] to-[rgba(42,29,12,0.88)]",
    avatar: "bg-orange-500",
  },
  dark: {
    grad: "from-transparent via-[rgba(0,0,0,0.35)] to-[rgba(0,0,0,0.88)]",
    avatar: "bg-[#10213f]",
  },
  green: {
    grad: "from-transparent via-[rgba(15,43,26,0.35)] to-[rgba(15,43,26,0.9)]",
    avatar: "bg-green-600",
  },
};

// Shop credibility tiers, highest first: Top Rated > Premium > Verified.
const SHOP_TIER: Record<
  ShopTier,
  { label: string; icon: IconComponent; text: string; iconCls: string }
> = {
  toprated: {
    label: "Top Rated",
    icon: Award,
    text: "text-amber-700 dark:text-amber-300",
    iconCls: "text-amber-500",
  },
  premium: {
    label: "Premium Shop",
    icon: Crown,
    text: "text-violet-700 dark:text-violet-300",
    iconCls: "text-violet-500",
  },
  verified: {
    label: "Verified Shop",
    icon: BadgeCheck,
    text: "text-emerald-700 dark:text-emerald-300",
    iconCls: "text-emerald-500",
  },
};

function ShopCard({
  shop,
  visitLabel,
  listingsLabel,
  moreLabel,
}: {
  shop: SampleShop;
  visitLabel: string;
  listingsLabel: string;
  moreLabel: string;
}) {
  const Icon = shop.icon;
  const a = SHOP_ACCENT[shop.accent];
  const tier = SHOP_TIER[shop.tier];
  const TierIcon = tier.icon;

  return (
    <div className="flex w-[288px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] shadow-sm transition hover:shadow-lg sm:w-[320px]">
      {/* Cover */}
      <div className="relative h-40">
        <Image
          src={shop.cover}
          alt=""
          fill
          sizes="320px"
          className="object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${a.grad}`} />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow-sm ${tier.text}`}
        >
          <TierIcon className={`h-3.5 w-3.5 ${tier.iconCls}`} />
          {tier.label}
        </span>
        <p className="absolute right-4 top-5 max-w-[62%] text-right text-lg font-extrabold leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
          {shop.tagline}
        </p>
      </div>

      {/* Thumbs */}
      <div className="-mt-6 flex gap-2 px-3">
        {shop.thumbs.slice(0, 3).map((src, i) => (
          <div
            key={i}
            className="relative aspect-square flex-1 overflow-hidden rounded-xl border-2 border-[var(--color-market-surface)] bg-slate-100 shadow-sm"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="100px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Identity */}
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${a.avatar}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-bold text-[var(--color-market-text)]">
            <span className="truncate">{shop.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />
          </p>
          <p className="truncate text-xs text-[var(--color-market-text-muted)]">
            {shop.category} &bull; {shop.location}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-market-text-muted)]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[var(--color-market-text)]">
              {shop.rating.toFixed(1)}
            </span>
            <span className="text-[var(--color-market-border-strong)]">|</span>
            {shop.listings} {listingsLabel}
          </p>
        </div>
        <button
          type="button"
          aria-label="Save shop"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-market-text-muted)] hover:bg-background hover:text-blue-600"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {shop.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-[var(--color-market-text-secondary)]"
          >
            {tag}
          </span>
        ))}
        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-blue-600">
          {moreLabel}
        </span>
      </div>

      {/* Visit */}
      <div className="mt-auto p-4">
        <Link
          href="/sellers"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 hover:-translate-y-0.5 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          {visitLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
