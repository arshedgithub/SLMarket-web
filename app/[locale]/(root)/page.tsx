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
  ChevronRight,
  Clock,
  Crown,
  GraduationCap,
  Heart,
  Home,
  Leaf,
  MapPin,
  PawPrint,
  Search,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  TrendingUp,
  Users,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";
import { categories as categoryConfig } from "@/config/const/navLinks";
import {
  CategoryRail,
  type CategoryRailItem,
} from "./_components/CategoryRail";
import { HeroSearch } from "./_components/HeroSearch";
import { Rail } from "./_components/Rail";
import { SectionEyebrow } from "./_components/SectionHeader";
import { getPriceDropCount } from "@/lib/deals/priceDrops";
import { getActiveOfferCount } from "@/lib/deals/offers";

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
  { label: "Toyota Aqua", href: "/search?q=Toyota%20Aqua" },
  { label: "House for rent", href: "/search?q=house%20for%20rent" },
  { label: "iPhone 13", href: "/search?q=iPhone%2013" },
  { label: "Part time job", href: "/search?q=part%20time%20job" },
  { label: "Land for sale", href: "/search?q=land%20for%20sale" },
  { label: "Laptop", href: "/search?q=laptop" },
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
  {
    title: "L-Shape Sofa Set",
    location: "Kandy",
    price: "Rs. 95,000",
    image: `${CAT_IMG}/home-garden.webp`,
    badge: "Negotiable",
    tags: ["Furniture", "6 Seater"],
  },
  {
    title: "Designer Party Dress",
    location: "Colombo",
    price: "Rs. 6,500",
    image: `${CAT_IMG}/fashion.webp`,
    badge: "New Arrival",
    tags: ["Women", "Size M"],
  },
  {
    title: "Organic Spice Pack",
    location: "Matale",
    price: "Rs. 1,200",
    image: `${CAT_IMG}/food.webp`,
    badge: "Verified Seller",
    tags: ["Organic", "1kg"],
  },
  {
    title: "Home Deep Cleaning",
    location: "Colombo",
    price: "Rs. 4,500",
    image: `${CAT_IMG}/services.webp`,
    badge: "Verified Business",
    tags: ["Same Day", "Insured"],
  },
  {
    title: "Mountain Bike, 21-Speed",
    location: "Nuwara Eliya",
    price: "Rs. 32,000",
    image: `${CAT_IMG}/hobbies.webp`,
    badge: "Negotiable",
    tags: ["21-Speed", "Good Condition"],
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
  accent: "blue" | "orange" | "dark" | "green" | "purple" | "teal";
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
  {
    name: "StyleHub",
    category: "Fashion",
    location: "Colombo",
    rating: 4.7,
    listings: "150+",
    tagline: "Look Good, Feel Great",
    tier: "premium",
    cover: `${CAT_IMG}/fashion.webp`,
    thumbs: [
      `${CAT_IMG}/fashion.webp`,
      `${CAT_IMG}/health-beauty.webp`,
      `${CAT_IMG}/home-garden.webp`,
    ],
    tags: ["Clothing", "Shoes", "Bags"],
    accent: "purple",
    icon: Shirt,
  },
  {
    name: "TasteBuds Kitchen",
    category: "Food & Groceries",
    location: "Galle",
    rating: 4.6,
    listings: "70+",
    tagline: "Fresh Flavours, Every Day",
    tier: "verified",
    cover: `${CAT_IMG}/food.webp`,
    thumbs: [
      `${CAT_IMG}/food.webp`,
      `${CAT_IMG}/agriculture.webp`,
      `${CAT_IMG}/jobs.webp`,
    ],
    tags: ["Homemade", "Catering", "Bakery"],
    accent: "teal",
    icon: Utensils,
  },
  {
    name: "EduPro Institute",
    category: "Education",
    location: "Kandy",
    rating: 4.9,
    listings: "40+",
    tagline: "Learn Without Limits",
    tier: "toprated",
    cover: `${CAT_IMG}/education.webp`,
    thumbs: [
      `${CAT_IMG}/education.webp`,
      `${CAT_IMG}/jobs.webp`,
      `${CAT_IMG}/electronics.webp`,
    ],
    tags: ["Tuition", "Online", "Exam Prep"],
    accent: "blue",
    icon: GraduationCap,
  },
  {
    name: "PetCare Lanka",
    category: "Animals & Pets",
    location: "Negombo",
    rating: 4.7,
    listings: "55+",
    tagline: "Happy Pets, Happy Homes",
    tier: "verified",
    cover: `${CAT_IMG}/animals.webp`,
    thumbs: [
      `${CAT_IMG}/animals.webp`,
      `${CAT_IMG}/agriculture.webp`,
      `${CAT_IMG}/home-garden.webp`,
    ],
    tags: ["Pet Food", "Grooming", "Accessories"],
    accent: "orange",
    icon: PawPrint,
  },
  {
    name: "FixIt Services",
    category: "Services",
    location: "Colombo",
    rating: 4.6,
    listings: "110+",
    tagline: "Repairs Done Right",
    tier: "premium",
    cover: `${CAT_IMG}/services.webp`,
    thumbs: [
      `${CAT_IMG}/services.webp`,
      `${CAT_IMG}/electronics.webp`,
      `${CAT_IMG}/home-garden.webp`,
    ],
    tags: ["Repairs", "Cleaning", "Movers"],
    accent: "dark",
    icon: Wrench,
  },
  {
    name: "GlowBeauty",
    category: "Health & Beauty",
    location: "Jaffna",
    rating: 4.8,
    listings: "65+",
    tagline: "Shine From Within",
    tier: "toprated",
    cover: `${CAT_IMG}/health-beauty.webp`,
    thumbs: [
      `${CAT_IMG}/health-beauty.webp`,
      `${CAT_IMG}/fashion.webp`,
      `${CAT_IMG}/hobbies.webp`,
    ],
    tags: ["Skincare", "Makeup", "Wellness"],
    accent: "purple",
    icon: Sparkles,
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

  const [priceDropCount, offerCount] = await Promise.all([
    getPriceDropCount(),
    getActiveOfferCount(),
  ]);

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
        {/* Desktop / tablet: full-bleed background photo with legibility overlays */}
        <div className="marketplace-hero-photo hidden sm:block">
          <Image
            src="/images/hero-bg.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1320px) 100vw, 1280px"
            className="object-cover object-[center_top]"
          />
        </div>

        <div className="marketplace-hero-edges hidden sm:block" />
        <div className="marketplace-hero-scrim hidden sm:block" />
        <div className="marketplace-hero-basefade hidden sm:block" />

        <div className="px-5 pt-8 sm:px-10 sm:pb-12 sm:pt-14 lg:px-14 lg:pt-16">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900 dark:bg-slate-900/70 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {t("hero.badge")}
            </div>

            <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#10213f] sm:text-5xl lg:text-[58px] dark:text-white">
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

            {/* POPULAR SEARCH — desktop (inline under the search bar) */}
            <div className="mt-4 hidden flex-wrap items-center gap-2 lg:flex">
              <span className="mr-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("hero.popularLabel")}
              </span>

              {popularSearches.slice(0, 4).map((search) => (
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

        {/* Phone: the hero art flows below the copy, its top edge fading
            into the page so the box + app mock-up stay fully visible. */}
        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden sm:hidden">
          <Image
            src="/images/hero-bg-mobile.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_72%]"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--color-market-background)] via-[var(--color-market-background)]/75 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--color-market-background)] to-transparent" />
        </div>
      </section>

      {/* ======================================================
          POPULAR SEARCHES — mobile / tablet
          ====================================================== */}

      <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-[var(--color-market-text)]">
              {t("hero.popularLabel")}
            </h2>
          </div>
          <Link
            href="/search"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600"
          >
            {t("hero.popularMore")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <Link
              key={search.label}
              href={search.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 py-2 text-xs font-medium text-[var(--color-market-text-secondary)] transition hover:border-blue-300 hover:text-blue-600"
            >
              <Search className="h-3.5 w-3.5 text-blue-500" />
              {search.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ======================================================
          CATEGORY RAIL — one horizontal row, overlaps the hero fade
          ====================================================== */}

      <section className="relative z-10 mx-auto mt-4 max-w-7xl px-4 sm:mt-5 sm:px-6">
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
          FEATURED LISTINGS
          ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Rail
          heading={t("featured.heading")}
          subheading={t("featured.subheading")}
          viewAllHref="/search"
          viewAllLabel={t("featured.viewAll")}
          dotsCount={recommendedListings.length}
        >
          {recommendedListings.map((listing) => (
            <div
              key={listing.title}
              className="w-[210px] shrink-0 snap-start sm:w-[236px]"
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
          heading={t("shops.heading")}
          subheading={t("shops.subheading")}
          viewAllHref="/businesses"
          viewAllLabel={t("shops.viewAll")}
          dotsCount={featuredShops.length}
        >
          {featuredShops.map((shop) => (
            <ShopCard
              key={shop.name}
              shop={shop}
              visitLabel={t("shops.visit")}
              listingsLabel={t("shops.listings")}
            />
          ))}
        </Rail>
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
            src="/images/marketplace/sell/background.webp"
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
            badge="/images/marketplace/why/icon-built.webp"
            title={t("whyUs.builtTitle")}
            desc={t("whyUs.builtDesc")}
            image="/images/marketplace/why/sri-lanka.webp"
          />
          <WhyCard
            tint="bg-pink-50 dark:bg-pink-950/30"
            badge="/images/marketplace/why/icon-discover.webp"
            title={t("whyUs.discoverTitle")}
            desc={t("whyUs.discoverDesc")}
            image="/images/marketplace/why/discovery.webp"
            imageInset
          />
          <WhyCard
            tint="bg-emerald-50 dark:bg-emerald-950/30"
            badge="/images/marketplace/why/icon-exposure.webp"
            title={t("whyUs.exposureTitle")}
            desc={t("whyUs.exposureDesc")}
            socials
          />
          <WhyCard
            tint="bg-amber-50 dark:bg-amber-950/30"
            badge="/images/marketplace/why/icon-everyone.webp"
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
        <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-market-border)] shadow-[0_20px_55px_-24px_rgba(16,33,63,0.22)] sm:min-h-[460px]">
          {/* Mobile: a tailored portrait shot (phones sit below the copy). */}
          <Image
            src="/images/marketplace/mobile-app/background-mobile.webp"
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover object-top sm:hidden"
          />
          {/* Desktop / tablet: the wide phone photo, anchored right. */}
          <Image
            src="/images/marketplace/mobile-app/background.webp"
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
                  <p className="mt-1 text-[10px] leading-tight text-[var(--color-market-text-muted)]">
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

const SHOP_ACCENT: Record<SampleShop["accent"], string> = {
  blue: "bg-blue-600",
  orange: "bg-orange-500",
  dark: "bg-[#10213f]",
  green: "bg-green-600",
  purple: "bg-violet-600",
  teal: "bg-teal-600",
};

// Credibility label shown on the cover: Top Rated > Premium > Verified.
const SHOP_TIER: Record<
  ShopTier,
  { label: string; icon: IconComponent; cls: string }
> = {
  toprated: {
    label: "Top Rated",
    icon: Award,
    cls: "text-amber-600 dark:text-amber-300",
  },
  premium: {
    label: "Premium",
    icon: Crown,
    cls: "text-violet-600 dark:text-violet-300",
  },
  verified: {
    label: "Verified",
    icon: BadgeCheck,
    cls: "text-emerald-600 dark:text-emerald-300",
  },
};

function ShopCard({
  shop,
  visitLabel,
  listingsLabel,
}: {
  shop: SampleShop;
  visitLabel: string;
  listingsLabel: string;
}) {
  const Icon = shop.icon;
  const tier = SHOP_TIER[shop.tier];
  const TierIcon = tier.icon;

  return (
    <article className="flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] shadow-sm transition hover:shadow-lg sm:w-[338px]">
      {/* Cover */}
      <div className="relative h-36">
        <Image
          src={shop.cover}
          alt=""
          fill
          sizes="338px"
          className="object-cover"
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow-sm ${tier.cls}`}
        >
          <TierIcon className="h-3.5 w-3.5" />
          {tier.label}
        </span>
      </div>

      {/* Full-width identity panel, overlapping the cover */}
      <div className="relative z-10 -mt-6 rounded-t-2xl bg-[var(--color-market-surface)] px-4 pb-3 pt-4">
        <div className="flex items-start gap-2.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
              SHOP_ACCENT[shop.accent]
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-bold text-[var(--color-market-text)]">
              <span className="truncate">{shop.name}</span>
              <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />
            </p>
            <p className="truncate text-xs text-[var(--color-market-text-muted)]">
              {shop.category} &middot; {shop.location}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-market-text-muted)]">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-[var(--color-market-text)]">
                {shop.rating.toFixed(1)}
              </span>
              <span className="text-[var(--color-market-border-strong)]">
                |
              </span>
              {shop.listings} {listingsLabel}
            </p>
          </div>
        </div>

        {/* Listing thumbnails */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {shop.thumbs.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Visit — full-width bar, flush to the card edges */}
      <Link
        href="/businesses"
        className="mt-auto flex items-center justify-center gap-1.5 bg-blue-50 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
      >
        {visitLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
