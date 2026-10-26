import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStorefront } from "@/lib/business/getStorefront";
import { windowFor } from "@/lib/business/responseTime";
import type { StorefrontBusiness } from "@/lib/business/storefront";
import { localeAlternates } from "@/lib/seo/hreflang";
import { safeJsonLd } from "@/lib/utils/json-ld";
import { StorefrontClient, type StorefrontView } from "./StorefrontClient";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const hhmm = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

async function load(
  locale: string,
  slug: string,
): Promise<StorefrontBusiness | null> {
  const business = await getStorefront(slug);
  if (!business) return null;
  // Category names come from the shared translations, not the data layer.
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const key = `${business.categoryId}.name`;
  return tCat.has(key) ? { ...business, categoryName: tCat(key) } : business;
}

function absolute(path: string | null) {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

export async function buildStorefrontMetadata(
  locale: string,
  slug: string,
  view: StorefrontView,
): Promise<Metadata> {
  setRequestLocale(locale);
  const business = await load(locale, slug);
  if (!business) return { title: "Business not found" };

  const path =
    view === "main" ? `/business/${slug}` : `/business/${slug}/${view}`;
  const description = [
    business.tagline || `${business.name} on SLMarket.lk`,
    business.rating.count > 0
      ? `Rated ${business.rating.average.toFixed(1)} from ${business.rating.count} verified reviews.`
      : "",
    `${business.categoryName} in ${business.city || business.district}, Sri Lanka.`,
  ]
    .filter(Boolean)
    .join(" ");
  const title =
    view === "reviews"
      ? `${business.name} Reviews | SLMarket.lk`
      : view === "questions"
        ? `${business.name} Questions and Answers | SLMarket.lk`
        : `${business.name}: ${business.categoryName} in ${business.city || business.district} | SLMarket.lk`;
  const cover = absolute(business.cover);

  return {
    // absolute: the title already ends in the brand name.
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${BASE}/${locale}${path}`,
      languages: localeAlternates(path),
    },
    openGraph: {
      title: business.name,
      description,
      images: cover ? [{ url: cover }] : [],
    },
  };
}

// The most specific schema.org type the category allows.
const STORE_TYPE: Record<string, string> = {
  electronics: "ElectronicsStore",
  vehicles: "AutoDealer",
  property: "RealEstateAgent",
  "home-garden": "FurnitureStore",
  fashion: "ClothingStore",
  food: "GroceryStore",
  agriculture: "Store",
  education: "EducationalOrganization",
  services: "LocalBusiness",
};

function structuredData(business: StorefrontBusiness, locale: string) {
  const branch = business.branches[0];
  const type = STORE_TYPE[business.categoryId] ?? "Store";
  const url = `${BASE}/${locale}/business/${business.slug}`;
  const hours = business.hoursSet
    ? [0, 1, 2, 3, 4, 5, 6].flatMap((d) => {
        const w = windowFor(business.openingHours, d);
        return w
          ? [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: DAY_NAMES[d],
                opens: hhmm(w.openMinute),
                closes: hhmm(w.closeMinute),
              },
            ]
          : [];
      })
    : undefined;

  const store = {
    "@context": "https://schema.org",
    "@type": type,
    name: business.name,
    description: business.tagline || undefined,
    url,
    image: absolute(business.cover),
    logo: absolute(business.logo),
    sameAs: business.about.social.length
      ? business.about.social.map((s) => s.url)
      : undefined,
    telephone: `+${business.phone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch?.address,
      addressLocality: business.city || undefined,
      addressRegion: business.district || undefined,
      addressCountry: "LK",
    },
    openingHoursSpecification: hours,
    // Only a real, measured rating: never on a business with no reviews.
    aggregateRating:
      business.rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: business.rating.average,
            reviewCount: business.rating.count,
          }
        : undefined,
  };

  // Each other branch is its own local business, tied to the main one.
  const branches = business.branches
    .filter((b) => !b.main)
    .map((b) => ({
      "@context": "https://schema.org",
      "@type": type,
      name: `${business.name} ${b.label}`,
      telephone: b.phone ? `+${b.phone}` : undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: b.address,
        addressRegion: b.district,
        addressCountry: "LK",
      },
      parentOrganization: { "@type": "Organization", name: business.name, url },
    }));

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Businesses",
        item: `${BASE}/${locale}/businesses`,
      },
      { "@type": "ListItem", position: 3, name: business.name, item: url },
    ],
  };
  return [store, ...branches, breadcrumbs];
}

export async function StorefrontPage({
  locale,
  slug,
  view,
}: {
  locale: string;
  slug: string;
  view: StorefrontView;
}) {
  setRequestLocale(locale);
  const business = await load(locale, slug);
  if (!business) notFound();

  return (
    <>
      {structuredData(business, locale).map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
        />
      ))}
      <StorefrontClient business={business} view={view} />
    </>
  );
}
