import { Suspense } from "react";
import { getOrSetCached } from "@/lib/redis";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Wrench } from "lucide-react";
import { ServiceCard } from "@/components/cards";
import { ServiceCardSkeleton } from "@/components/cards/CardSkeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { localeAlternates } from "@/lib/seo/hreflang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo.services" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: { languages: localeAlternates("/services") },
  };
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ServicesPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 24;

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    category: "SERVICE",
  };
  if (q)
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];

  const pageHref = (p: number) => `/services?page=${p}${q ? `&q=${q}` : ""}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero — static, renders immediately, no DB dependency */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Gem & Jewellery <span className="text-green-600">Services</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Professional gem cutting, certification, appraisal, and jewellery
            repair from trusted experts worldwide.
          </p>
        </div>

        <Suspense fallback={<ServicesResultsSkeleton />}>
          <ServicesResults
            where={where}
            page={page}
            limit={limit}
            pageHref={pageHref}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Caches the query result directly — see gems/page.tsx's getGemsResults for
// why, and why this uses the Redis cache rather than unstable_cache.
async function getServicesResults(
  where: Prisma.ListingWhereInput,
  page: number,
  limit: number,
) {
  return getOrSetCached(
    `listings:services:${JSON.stringify(where)}:${page}:${limit}`,
    120,
    async () => {
      const [listings, total] = await Promise.all([
        db.listing.findMany({
          where,
          include: {
            seller: {
              select: { name: true, isVerified: true, locationCity: true },
            },
          },
          orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.listing.count({ where }),
      ]);
      return { listings, total };
    },
  );
}

async function ServicesResults({
  where,
  page,
  limit,
  pageHref,
}: {
  where: Prisma.ListingWhereInput;
  page: number;
  limit: number;
  pageHref: (p: number) => string;
}) {
  const { listings, total } = await getServicesResults(where, page, limit);

  return (
    <>
      <p className="text-sm text-gray-500 mb-5">
        {total.toLocaleString()} services found
      </p>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No service listings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <ServiceCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ← Previous
            </Link>
          )}
          {page * limit < total && (
            <Link
              href={pageHref(page + 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function ServicesResultsSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-32 mb-5" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
