export const revalidate = 60;
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { localeAlternates } from "@/lib/seo/hreflang";
import { ArrowRight } from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { HeroSellerLink, BottomSellerCta } from "./_components/SellerCta";
import {
  MetalPricesSection,
  FeaturedAndNewArrivalsSection,
  FeaturedShopsSection,
  TrustBandSection,
  BlogSection,
} from "./_components/HomeDataSections";
import {
  MetalPricesSkeleton,
  FeaturedAndNewArrivalsSkeleton,
  FeaturedShopsSkeleton,
  TrustBandSkeleton,
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

export default async function HomePage() {
  const servicesPreview =
    categories
      .find((c) => c.id === "services")
      ?.subcategories.filter((s) => s.id !== "all")
      .slice(0, 4) ?? [];

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      {/* Hero — purely static; the seller CTA reads session client-side */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark to-primary">
        <div className="absolute inset-0 opacity-20 bg-primary-dark">
          <Image
            src="/images/categories/gems/other-gems.png"
            alt=""
            fill
            sizes="100vw"
            quality={40}
            loading="eager"
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <p className="text-secondary-light font-semibold tracking-wide uppercase text-sm mb-4">
            The Trusted Global Gem &amp; Jewellery Marketplace
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Certified Gems, Fine Jewellery &amp; <br />
            <span className="text-amber-500">Precious Metals</span>
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto mb-8 text-lg">
            Buy and sell certified sapphires, rubies and rare gems, gold and
            silver, handcrafted jewellery, and trusted valuation &amp;
            certification services, directly from verified sellers worldwide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/gems"
              className="inline-flex items-center gap-2 bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Gems <ArrowRight className="w-4 h-4" />
            </Link>
            <HeroSellerLink />
          </div>
        </div>
      </section>

      {/* Live metal prices */}
      <Suspense fallback={<MetalPricesSkeleton />}>
        <MetalPricesSection />
      </Suspense>

      {/* Shop by category — static config data, no DB query */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              href={category.subcategories[0]?.href ?? "/"}
              className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
            >
              <div className="aspect-square relative skeleton-shimmer">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  priority={i === 0}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-center font-semibold text-sm py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings + New arrivals */}
      <Suspense fallback={<FeaturedAndNewArrivalsSkeleton />}>
        <FeaturedAndNewArrivalsSection />
      </Suspense>

      {/* Services preview — static config data, no DB query */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Trusted Gem &amp; Jewellery Services
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Certification, valuation, custom design and more, from professionals
            who specialise in gems and precious metals.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {servicesPreview.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
              >
                <div className="aspect-square relative skeleton-shimmer">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-center font-medium text-sm py-3 text-gray-900 dark:text-white">
                  {service.name}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/services"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all services →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured shops */}
      <Suspense fallback={<FeaturedShopsSkeleton />}>
        <FeaturedShopsSection />
      </Suspense>

      {/* Trust band */}
      <Suspense fallback={<TrustBandSkeleton />}>
        <TrustBandSection />
      </Suspense>

      {/* Blog / learn & community */}
      <Suspense fallback={<BlogSkeleton />}>
        <BlogSection />
      </Suspense>

      {/* Become a seller CTA — session-dependent content lives in BottomSellerCta */}
      <section className="bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <BottomSellerCta />
        </div>
      </section>
    </div>
  );
}
