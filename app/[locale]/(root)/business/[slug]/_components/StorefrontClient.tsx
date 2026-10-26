"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  activeOffers,
  type StorefrontBusiness,
} from "@/lib/business/storefront";
import {
  AllProductsSection,
  BrandsSection,
  CatalogueProvider,
  CollectionsSection,
  OffersSection,
  TopPicksSection,
} from "./CatalogueSections";
import { Hero } from "./Hero";
import {
  AboutSection,
  LocationSection,
  QuestionsSection,
  SellerInfo,
  hasAboutContent,
} from "./InfoSections";
import { MobileBar } from "./MobileBar";
import { ReviewsSection } from "./Reviews";
import { SectionBar, type BarSection } from "./SectionBar";
import { EnquiryCard, TrustCard, VisitCard } from "./SideCards";
import { useNow } from "./format";

export type StorefrontView = "main" | "reviews" | "questions";

export function StorefrontClient({
  business,
  view,
}: {
  business: StorefrontBusiness;
  view: StorefrontView;
}) {
  const t = useTranslations("storefront");
  const now = useNow();
  const offerCount = activeOffers(business.offers, now ?? new Date(0)).length;
  const kind = t(`kind.${business.itemsKind}`);

  const showQuestions = business.questions.length > 0 || !business.isNew;
  const sections: BarSection[] = [
    {
      id: "catalogue",
      label: kind,
      count: business.products.length || undefined,
      also: ["collections", "top-picks", "products"],
    },
    ...(offerCount > 0
      ? [{ id: "offers", label: t("sections.offers"), count: offerCount }]
      : []),
    ...(business.brands.length > 0
      ? [{ id: "brands", label: t("sections.brands") }]
      : []),
    {
      id: "reviews",
      label: t("sections.reviews"),
      count: business.rating.count || undefined,
    },
    ...(showQuestions
      ? [
          {
            id: "questions",
            label: t("sections.questions"),
            count: business.questions.length,
          },
        ]
      : []),
    ...(hasAboutContent(business)
      ? [{ id: "about", label: t("sections.about") }]
      : []),
    ...(business.branches.length > 0
      ? [{ id: "location", label: t("sections.location") }]
      : []),
  ];

  return (
    <CatalogueProvider>
      <div className="marketplace-page">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-0 md:px-6 md:pt-4">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 hidden flex-wrap items-center gap-1.5 text-xs text-[var(--color-market-text-muted)] md:flex"
          >
            <Link href="/" className="hover:text-blue-600">
              {t("breadcrumb.home")}
            </Link>
            <span>/</span>
            <Link href="/businesses" className="hover:text-blue-600">
              {t("breadcrumb.businesses")}
            </Link>
            <span>/</span>
            <span>{business.categoryName}</span>
            <span>/</span>
            <span className="font-semibold text-[var(--color-market-text)]">
              {business.name}
            </span>
          </nav>

          <div className="-mx-4 md:mx-0">
            <Hero business={business} />
          </div>
          <SectionBar
            business={business}
            sections={sections}
            stay={view === "main" ? undefined : view}
          />

          {business.isNew && (
            <div className="mt-4 lg:hidden">
              <TrustCard business={business} anchor={false} />
            </div>
          )}

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
              {view === "main" ? (
                <>
                  <div
                    id="catalogue"
                    className="flex scroll-mt-32 flex-col gap-4 empty:hidden"
                  >
                    <CollectionsSection business={business} />
                    <TopPicksSection business={business} />
                  </div>
                  <OffersSection business={business} />
                  <BrandsSection business={business} />
                  <AllProductsSection business={business} />
                  <ReviewsSection business={business} />
                  {showQuestions && <QuestionsSection business={business} />}
                  {hasAboutContent(business) && (
                    <AboutSection business={business} />
                  )}
                  {business.branches.length > 0 && (
                    <LocationSection business={business} />
                  )}
                </>
              ) : view === "reviews" ? (
                <ReviewsSection business={business} full />
              ) : (
                <QuestionsSection business={business} full />
              )}
            </div>

            <aside className="flex flex-col gap-4 lg:h-full">
              <div className={business.isNew ? "hidden lg:block" : ""}>
                <TrustCard business={business} />
              </div>
              <VisitCard business={business} />
              <EnquiryCard business={business} />
            </aside>
          </div>

          <div className="mt-4">
            <SellerInfo business={business} />
          </div>
        </div>
        <MobileBar business={business} />
      </div>
    </CatalogueProvider>
  );
}
