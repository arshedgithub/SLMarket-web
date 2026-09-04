export const revalidate = 60;
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { localeAlternates } from "@/lib/seo/hreflang";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  BadgeCheck,
  Truck,
  Users,
  Package,
  Globe,
  Smile,
  Headphones,
  Award,
  Grid3x3,
  Percent,
  Gem,
  Coins,
  Sparkles,
  Zap,
  Scissors,
  Wrench,
  FlaskConical,
  Scale,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { HeroSellerLink, BottomSellerCta } from "./_components/SellerCta";
import {
  FeaturedAndNewArrivalsSection,
  FeaturedShopsSection,
  BlogSection,
} from "./_components/HomeDataSections";
import {
  FeaturedAndNewArrivalsSkeleton,
  FeaturedShopsSkeleton,
  BlogSkeleton,
} from "./_components/HomeSectionSkeletons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: { languages: localeAlternates("/") },
  };
}

const heroBadgeIcons = [
  { key: "verifiedSellers", icon: ShieldCheck },
  { key: "secureTransactions", icon: Lock },
  { key: "qualityAssured", icon: BadgeCheck },
  { key: "worldwideShipping", icon: Truck },
] as const;

const statIcons = [
  { key: "verifiedSellers", icon: Users, value: "50,000+" },
  { key: "productsListed", icon: Package, value: "1M+" },
  { key: "countriesConnected", icon: Globe, value: "200+" },
  { key: "buyerSatisfaction", icon: Smile, value: "98%" },
  { key: "customerSupport", icon: Headphones, value: "24/7" },
] as const;

const categorySubtitleKeys: Record<string, string> = {
  gems: "gems",
  "precious-metals": "precious-metals",
  jewellery: "jewellery",
  services: "services",
  sellers: "sellers",
  deals: "deals",
};

const dealsCategory = {
  id: "deals",
  image: "/images/categories/gems/garnet.png",
  href: "/deals",
};

const trustFeatureIcons = [
  { key: "certified", icon: Award },
  { key: "secure", icon: ShieldCheck },
  { key: "global", icon: Globe },
  { key: "support", icon: Headphones },
] as const;

const quickAccessItems = [
  {
    key: "blueSapphire",
    icon: Gem,
    color: "var(--color-gem-sapphire)",
    href: "/gems?type=sapphire",
  },
  {
    key: "emeraldRing",
    icon: Gem,
    color: "var(--color-gem-emerald)",
    href: "/jewellery?type=rings",
  },
  {
    key: "gemCertification",
    icon: BadgeCheck,
    color: "var(--color-gold)",
    href: "/services?type=certification",
  },
  {
    key: "diamondRing",
    icon: Sparkles,
    color: "var(--color-secondary-600)",
    href: "/jewellery?type=rings",
  },
  {
    key: "gold22k",
    icon: Coins,
    color: "var(--color-gold)",
    href: "/precious-metals?type=gold",
  },
  {
    key: "platinumJewellery",
    icon: Gem,
    color: "var(--color-secondary-600)",
    href: "/jewellery",
  },
] as const;

const growSellerStats = [
  { key: "commission", icon: Percent },
  { key: "reach", icon: Globe },
  { key: "support", icon: Headphones },
] as const;

const journeyCtaBadges = [
  { key: "community", icon: Users },
  { key: "secure", icon: ShieldCheck },
  { key: "easy", icon: Zap },
] as const;

const servicesPreviewItems = [
  {
    key: "certification",
    icon: BadgeCheck,
    href: "/services?type=certification",
  },
  { key: "cutting", icon: Scissors, href: "/services?type=cutting" },
  { key: "customDesign", icon: Sparkles, href: "/services?type=custom" },
  { key: "repair", icon: Wrench, href: "/services?type=repair" },
  { key: "goldTesting", icon: FlaskConical, href: "/services?type=gold" },
  { key: "valuation", icon: Scale, href: "/services?type=valuation" },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  // Rendered twice: once over the framed image on large screens, once over
  // the full-bleed image panel below lg — kept as one definition so the two
  // layouts can't drift out of sync.
  const heroCtas = (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
      <Link
        href="/gems"
        className="btn-gold-gradient inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-lg"
      >
        {t("hero.exploreMarketplace")} <ArrowRight className="w-4 h-4" />
      </Link>
      <HeroSellerLink />
    </div>
  );

  const heroBadges = (
    <div className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8 sm:gap-y-5">
      {heroBadgeIcons.map((badge) => (
        <div key={badge.key} className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/40 text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)]">
            <badge.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="leading-tight min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-[var(--color-luxury-text)] truncate">
              {t(`hero.badges.${badge.key}.title`)}
            </p>
            <p className="text-[11px] sm:text-xs text-[var(--color-luxury-text-body)] truncate">
              {t(`hero.badges.${badge.key}.subtitle`)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // Compact single-column variant for the narrow overlay card on the
  // mobile/tablet hero image — the flex-wrap version above is too wide to
  // fit there without truncating the labels.
  const heroBadgesCompact = (
    <div className="flex flex-col gap-1.5">
      {heroBadgeIcons.map((badge) => (
        <div key={badge.key} className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/40 text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)]">
            <badge.icon className="h-2.5 w-2.5" />
          </span>
          <p className="text-[10px] leading-tight font-semibold text-[var(--color-luxury-text)]">
            {t(`hero.badges.${badge.key}.title`)}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-[var(--color-luxury-bg)]">
      {/* Hero — purely static; the seller CTA reads session client-side.
          Background image differs per theme (hero-bg-light / hero-bg-dark),
          both toggled with CSS so no client JS is needed to pick one.

          Large screens: image is framed to the same max-w-7xl margins the
          nav uses, biased to the right, and fades to solid page background
          on its left/bottom edges — the gems on the right render at full
          clarity, never dimmed. Below lg there's no room to dodge the image
          with text, so it switches to a separate full-bleed, un-tinted
          image panel with the CTAs/badges overlaid on its left (fabric)
          side, keeping the ring/gems on the right completely uncovered. */}
      <section className="relative overflow-hidden">
        {/* Large-screen framed + faded image, contained to nav's margins */}
        <div className="hidden lg:block absolute inset-0">
          <div className="relative max-w-7xl mx-auto h-full">
            <div className="absolute inset-y-0 right-0 left-[8%] overflow-hidden rounded-3xl">
              <Image
                src="/images/hero-bg-light.png"
                alt=""
                fill
                sizes="1280px"
                priority
                className="object-cover object-[70%_center] dark:hidden"
              />
              <Image
                src="/images/hero-bg-dark.png"
                alt=""
                fill
                sizes="1280px"
                priority
                className="hidden object-cover object-[62%_center] dark:block"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-luxury-bg)] from-0% to-transparent to-[55%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-luxury-bg)] from-0% to-transparent to-[30%]" />
              {/* Right edge fade — on very wide viewports the container ends
                  well short of the browser edge; this softens the seam into
                  that empty page background instead of a hard cut. */}
              <div className="absolute inset-y-0 right-0 w-16 xl:w-24 bg-gradient-to-l from-[var(--color-luxury-bg)] to-transparent" />
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8 sm:pt-16 sm:pb-10 lg:py-28">
          <div className="lg:max-w-xl">
            <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-[11px] sm:text-sm mb-3 sm:mb-4">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[var(--color-luxury-text)] mb-4 sm:mb-5 leading-tight">
              {t("hero.titlePrefix")}{" "}
              <span className="text-[var(--color-gold)]">
                {t("hero.titleHighlight")}
              </span>{" "}
              {t("hero.titleSuffix")}
            </h1>
            <p className="text-[var(--color-luxury-text-body)] mb-6 sm:mb-8 text-base sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="hidden lg:block mb-12">
              {heroCtas}
              <div className="mt-10">{heroBadges}</div>
            </div>
          </div>
        </div>

        {/* Mobile/tablet media panel — full-bleed, full clarity, no scrim.
            The panel matches the source photo's native 3:2 ratio exactly,
            so object-cover never crops it — the ring/gems stay exactly
            where they sit in the photo (roughly the right half), leaving a
            predictable, guaranteed-clear left margin for the CTAs/badges. */}
        <div className="lg:hidden relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src="/images/hero-bg-light.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-[62%_center] dark:hidden"
          />
          <Image
            src="/images/hero-bg-dark.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className="hidden object-cover object-[49%_center] dark:block"
          />
          {/* Top edge fade so the seam with the solid text block above isn't
              a hard cut line */}
          <div className="absolute inset-x-0 top-0 h-10 sm:h-14 bg-gradient-to-b from-[var(--color-luxury-bg)] to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
            <div className="max-w-[44%] sm:max-w-[40%] scale-90 origin-top-left sm:scale-100">
              {heroCtas}
            </div>
            <div className="max-w-[58%] sm:max-w-[42%] rounded-lg sm:rounded-xl bg-[var(--color-luxury-surface)]/90 backdrop-blur-sm p-2 sm:p-3">
              {heroBadgesCompact}
            </div>
          </div>
        </div>
      </section>

      {/* Stats band — overlaps the hero's bottom edge on large screens only;
          stacked flush underneath on mobile/tablet where there's no room
          to spare for an overlap without clipping the hero content above. */}
      <section className="relative z-10 mt-6 sm:mt-8 lg:-mt-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-luxury-border)] bg-[var(--color-luxury-surface-elevated)] shadow-sm px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {statIcons.map((stat) => (
            <div key={stat.key} className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)]">
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold text-[var(--color-luxury-text)] leading-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--color-luxury-text-body)]">
                  {t(`stats.${stat.key}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category — static config data, no DB query */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
              {t("categories.eyebrow")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
              {t("categories.heading")}
            </h2>
          </div>
          <Link
            href="/gems"
            className="btn-gold-outline inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            <Grid3x3 className="w-4 h-4" /> {t("categories.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              href={category.subcategories[0]?.href ?? "/"}
              className="group rounded-2xl overflow-hidden border border-[var(--color-luxury-border)] bg-[var(--color-luxury-surface)] hover:shadow-lg hover:border-[var(--color-gold)] transition-all"
            >
              <div className="aspect-[4/3] relative skeleton-shimmer">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  priority={i === 0}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-luxury-text)] truncate">
                    {category.name}
                  </p>
                  <p className="text-xs text-[var(--color-luxury-text-body)]">
                    {t(
                      `categories.subtitles.${categorySubtitleKeys[category.id]}`,
                    )}
                  </p>
                </div>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] group-hover:bg-[var(--color-gold)] group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
          <Link
            href={dealsCategory.href}
            className="group rounded-2xl overflow-hidden border border-[var(--color-luxury-border)] bg-[var(--color-luxury-surface)] hover:shadow-lg hover:border-[var(--color-gold)] transition-all"
          >
            <div className="aspect-[4/3] relative skeleton-shimmer">
              <Image
                src={dealsCategory.image}
                alt={t("categories.dealsName")}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-luxury-text)] truncate">
                  {t("categories.dealsName")}
                </p>
                <p className="text-xs text-[var(--color-luxury-text-body)]">
                  {t("categories.subtitles.deals")}
                </p>
              </div>
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] group-hover:bg-[var(--color-gold)] group-hover:text-white transition-colors">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured listings + New arrivals — placed right after the category
          grid, ahead of the editorial sections, matching the reference
          homepage's "Most Popular This Week" / "Recently Added" order. */}
      <Suspense fallback={<FeaturedAndNewArrivalsSkeleton />}>
        <FeaturedAndNewArrivalsSection />
      </Suspense>

      {/* Trusted by buyers & sellers */}
      <section className="bg-[var(--color-luxury-surface)] border-y border-[var(--color-luxury-border)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-3">
              {t("trust.eyebrow")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)] mb-4">
              {t("trust.heading")}
            </h2>
            <p className="text-[var(--color-luxury-text-body)] mb-6 max-w-md">
              {t("trust.description")}
            </p>
            <Link
              href="/about"
              className="btn-gold-gradient inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg"
            >
              {t("trust.learnMore")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trustFeatureIcons.map((feature) => (
              <div
                key={feature.key}
                className="rounded-xl border border-[var(--color-luxury-border)] p-5 text-center"
              >
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                  <feature.icon className="h-6 w-6" />
                </span>
                <p className="font-semibold text-[var(--color-luxury-text)] text-sm mb-1">
                  {t(`trust.features.${feature.key}.title`)}
                </p>
                <p className="text-xs text-[var(--color-luxury-text-body)]">
                  {t(`trust.features.${feature.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview — static config data, no DB query */}
      <section className="bg-[var(--color-luxury-surface)] border-y border-[var(--color-luxury-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
                {t("servicesPreview.eyebrow")}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
                {t("servicesPreview.heading")}
              </h2>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              {t("servicesPreview.viewAll")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {servicesPreviewItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="group flex flex-col items-center text-center gap-3 rounded-xl border border-[var(--color-luxury-border)] p-4 hover:border-[var(--color-gold)] hover:shadow-md transition-all"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)]">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-[var(--color-luxury-text)]">
                    {t(`servicesPreview.items.${item.key}.name`)}
                  </p>
                  <p className="text-xs text-[var(--color-luxury-text-body)] mt-1">
                    {t(`servicesPreview.items.${item.key}.desc`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / learn & community */}
      <Suspense fallback={<BlogSkeleton />}>
        <BlogSection />
      </Suspense>

      {/* "Ready to Begin Your Journey" — a single background-image card:
          always dark regardless of site theme. The gradient covers the
          left ~60% solidly so text never sits on the ring on the right,
          whatever the viewport — verified via screenshots at 360-1920px,
          not just assumed from the gradient math. */}
      <section className="px-4 sm:px-6 py-8 sm:py-10 lg:py-14 max-w-7xl mx-auto">
        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden bg-[#0c0d10]">
          <div className="absolute inset-0">
            <Image
              src="/images/home-cta.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="object-cover object-[82%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d10] from-0% via-[#0c0d10]/95 via-[38%] to-transparent to-[62%]" />
          </div>
          <div className="relative px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="max-w-[52%] sm:max-w-sm lg:max-w-md">
              <BottomSellerCta />
              <div className="grid grid-cols-3 gap-3 sm:gap-4 border-t border-white/15 pt-5 sm:pt-6 mt-8 sm:mt-10">
                {journeyCtaBadges.map((badge) => (
                  <div key={badge.key}>
                    <badge.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-gold-champagne)] mb-1.5" />
                    <p className="text-[10px] sm:text-xs font-semibold text-white leading-tight">
                      {t(`journeyCta.badges.${badge.key}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick access — static curated shortcuts (no real search-history
          backend to drive this from), so it's plain config data like the
          category grid rather than a Suspense-wrapped DB query. */}
      <section className="bg-[var(--color-luxury-surface)] border-y border-[var(--color-luxury-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
                {t("quickAccess.eyebrow")}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
                {t("quickAccess.heading")}
              </h2>
            </div>
            <Link
              href="/gems"
              className="text-sm font-medium text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] hover:underline flex items-center gap-1"
            >
              {t("quickAccess.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-3 lg:gap-4">
            {quickAccessItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="group flex items-center gap-3 rounded-full border border-[var(--color-luxury-border)] bg-[var(--color-luxury-bg)] px-4 py-3 hover:border-[var(--color-gold)] hover:shadow-md transition-all"
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-current/10"
                  style={{ color: item.color }}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-[var(--color-luxury-text)] leading-tight sm:whitespace-nowrap">
                  {t(`quickAccess.items.${item.key}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted sellers — real seller data (see FeaturedShopsSection) */}
      <Suspense fallback={<FeaturedShopsSkeleton />}>
        <FeaturedShopsSection />
      </Suspense>

      {/* "Grow Your Business With Lumevelo" — same background-image card
          treatment as the journey CTA above, immediately before the
          footer. home-seller.png already has a dark left third baked in,
          which gives this one extra margin for safety. */}
      <section className="px-4 sm:px-6 pb-8 sm:pb-10 lg:pb-14 max-w-7xl mx-auto">
        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden bg-[#0c0d10]">
          <div className="absolute inset-0">
            <Image
              src="/images/home-seller.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="object-cover object-[80%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d10] from-0% via-[#0c0d10]/95 via-[38%] to-transparent to-[62%]" />
          </div>
          <div className="relative px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="max-w-[52%] sm:max-w-sm">
              <p className="text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-[10px] sm:text-xs mb-3">
                {t("growSeller.eyebrow")}
              </p>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                {t("growSeller.heading")}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base mb-6">
                {t("growSeller.description")}
              </p>
              <Link
                href="/seller-registration"
                className="group inline-flex w-fit items-center gap-2 border-b border-[var(--color-gold-champagne)]/50 pb-1 font-semibold text-[var(--color-gold-champagne)] hover:border-[var(--color-gold-champagne)] hover:text-white transition-colors mb-8 sm:mb-10"
              >
                {t("growSeller.joinNow")}{" "}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 border-t border-white/15 pt-5 sm:pt-6">
                {growSellerStats.map((stat) => (
                  <div key={stat.key}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-gold-champagne)] mb-1.5" />
                    <p className="text-[10px] sm:text-xs font-semibold text-white leading-tight">
                      {t(`growSeller.stats.${stat.key}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
