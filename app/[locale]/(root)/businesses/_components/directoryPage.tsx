import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories } from "@/config/const/navLinks";
import { districtFromSlug, districtSlug } from "@/lib/business/directory/geo";
import {
  DISTRICT_INDEX_MIN_BUSINESSES,
  DIRECTORY_CATEGORY_ORDER,
} from "@/lib/business/directory/seo";
import { isListed, runDirectory } from "@/lib/business/directory/query";
import { getDirectory } from "@/lib/business/directory/fromDatabase";
import { DEFAULT_FILTERS } from "@/lib/business/directory/types";
import { getStorefront } from "@/lib/business/getStorefront";
import { localeAlternates } from "@/lib/seo/hreflang";
import { safeJsonLd } from "@/lib/utils/json-ld";
import { DirectoryExperience, type DirectoryBase } from "./DirectoryExperience";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";
const NOW = () => new Date();

export type DirectoryRoute =
  | { kind: "root" }
  | { kind: "category"; category: string }
  | { kind: "segment"; category: string; segment: string };

// Resolves the URL to what the page shows, or sends the visitor to the right
// place: an old /businesses/<business-slug> link goes to that business page,
// anything else is a real 404.
export async function resolveRoute(
  locale: string,
  route: DirectoryRoute,
): Promise<DirectoryBase> {
  if (route.kind === "root")
    return { category: null, subcategory: null, district: null };

  const category = categories.find((c) => c.id === route.category);
  if (!category) {
    if (route.kind === "category") {
      const business = await getStorefront(route.category);
      if (business) redirect(`/${locale}/business/${business.slug}`);
    }
    notFound();
  }
  if (route.kind === "category")
    return { category: category.id, subcategory: null, district: null };

  if (category.subcategories.some((s) => s.id === route.segment)) {
    return {
      category: category.id,
      subcategory: route.segment,
      district: null,
    };
  }
  const district = districtFromSlug(route.segment);
  if (!district) notFound();
  return { category: category.id, subcategory: null, district };
}

async function categoryNames(locale: string) {
  const t = await getTranslations({ locale, namespace: "businesses" });
  const out: Record<string, string> = {};
  for (const id of DIRECTORY_CATEGORY_ORDER)
    out[id] = t(`directory.categories.${id}`);
  return out;
}

function pathOf(base: DirectoryBase) {
  if (!base.category) return "/businesses";
  if (base.subcategory)
    return `/businesses/${base.category}/${base.subcategory}`;
  if (base.district)
    return `/businesses/${base.category}/${districtSlug(base.district)}`;
  return `/businesses/${base.category}`;
}

async function countFor(base: DirectoryBase) {
  return runDirectory(
    await getDirectory(),
    {
      ...DEFAULT_FILTERS,
      category: base.category,
      subcategory: base.subcategory,
      district: base.district,
    },
    { now: NOW(), origin: null, userDistrict: null },
  ).results.length;
}

export async function buildDirectoryMetadata(
  locale: string,
  route: DirectoryRoute,
): Promise<Metadata> {
  setRequestLocale(locale);
  const base = await resolveRoute(locale, route);
  const t = await getTranslations({ locale, namespace: "businesses" });
  const names = await categoryNames(locale);
  const path = pathOf(base);
  const n = await countFor(base);
  const place = base.district ?? t("directory.sriLanka");

  let title: string;
  let description: string;
  if (!base.category) {
    const s = await getTranslations({ locale, namespace: "seo.businesses" });
    title = s("title");
    description = s("description");
  } else {
    const name = names[base.category] ?? base.category;
    title = base.district
      ? t("directory.seoTitleDistrict", {
          category: name,
          district: base.district,
          count: n,
        })
      : t("directory.seoTitleCategory", { category: name });
    description = t("directory.seoDescription", {
      count: n,
      category: name.toLowerCase(),
      place,
    });
  }

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: localeAlternates(path),
    },
    // A category-and-district page with too few businesses still works for
    // visitors but is kept out of search results until it has enough.
    robots:
      base.district && n < DISTRICT_INDEX_MIN_BUSINESSES
        ? { index: false, follow: true }
        : undefined,
  };
}

export async function DirectoryPage({
  locale,
  route,
}: {
  locale: string;
  route: DirectoryRoute;
}) {
  setRequestLocale(locale);
  const base = await resolveRoute(locale, route);
  const names = await categoryNames(locale);
  const all = (await getDirectory()).filter(isListed);
  const t = await getTranslations({ locale, namespace: "businesses" });

  const first = runDirectory(
    all,
    {
      ...DEFAULT_FILTERS,
      category: base.category,
      subcategory: base.subcategory,
      district: base.district,
    },
    { now: NOW(), origin: null, userDistrict: base.district },
  ).results.slice(0, 24);

  const url = `${BASE_URL}/${locale}${pathOf(base)}`;
  const crumbs = [
    { name: t("directory.home"), item: `${BASE_URL}/${locale}` },
    {
      name: t("directory.businesses"),
      item: `${BASE_URL}/${locale}/businesses`,
    },
    ...(base.category
      ? [
          {
            name: names[base.category] ?? base.category,
            item: `${BASE_URL}/${locale}/businesses/${base.category}`,
          },
        ]
      : []),
    ...(base.district ? [{ name: base.district, item: url }] : []),
  ];
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: first.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.business.name,
        url: `${BASE_URL}/${locale}/business/${r.business.slug}`,
      })),
    },
  ];

  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(d) }}
        />
      ))}
      <Suspense fallback={<div className="marketplace-page min-h-[60vh]" />}>
        <DirectoryExperience
          key={`${base.category}|${base.subcategory}|${base.district}`}
          all={all}
          base={base}
          serverNow={NOW().toISOString()}
          categoryNames={names}
        />
      </Suspense>
    </>
  );
}
