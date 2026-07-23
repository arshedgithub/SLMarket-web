import { getOrSetCached } from "@/lib/redis";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { ShieldCheck, Store, MapPin } from "lucide-react";
import { localeAlternates } from "@/lib/seo/hreflang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo.sellers" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: { languages: localeAlternates("/sellers") },
  };
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

// Caches the query result directly — see gems/page.tsx's getGemsResults for
// why, and why this uses the Redis cache rather than unstable_cache. Keyed
// under the "listings:" prefix (even though this queries sellers, not
// listings) so it's cleared by the same invalidateCache("listings:*") calls
// on listing mutations — a seller card's active-listing count depends on
// listing data too.
async function getSellersResults(
  where: Prisma.UserWhereInput,
  page: number,
  limit: number,
) {
  return getOrSetCached(
    `listings:sellers:${JSON.stringify(where)}:${page}:${limit}`,
    120,
    async () => {
      const [sellers, total] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            shopSlug: true,
            shopBio: true,
            shopBannerUrl: true,
            isVerified: true,
            locationCity: true,
            specialties: true,
            subscription: {
              select: { plan: { select: { name: true } } },
            },
            _count: { select: { listings: { where: { status: "ACTIVE" } } } },
          },
          orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.user.count({ where }),
      ]);
      return { sellers, total };
    },
  );
}

export default async function SellersPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 24;

  const where: Prisma.UserWhereInput = {
    role: "SELLER",
    subscription: {
      plan: { hasShopProfile: true },
      status: "ACTIVE",
    },
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shopBio: { contains: q, mode: "insensitive" } },
    ];
  }

  const { sellers, total } = await getSellersResults(where, page, limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Verified <span className="text-blue-600">Sellers</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Connect directly with authenticated gem miners, dealers, and
            jewellers from around the world.
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {total.toLocaleString()} sellers found
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/shop/${seller.shopSlug}`}
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="h-28 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
                {seller.shopBannerUrl && (
                  <Image
                    src={seller.shopBannerUrl}
                    alt={`${seller.name} banner`}
                    fill
                    className="object-cover"
                  />
                )}
                {seller.isVerified && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-gray-800 -mt-8 shadow">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                      {seller.name}
                    </p>
                    {seller.locationCity && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" /> {seller.locationCity}
                      </div>
                    )}
                  </div>
                </div>
                {seller.shopBio && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {seller.shopBio}
                  </p>
                )}
                {seller.specialties && seller.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(seller.specialties as string[]).slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500">
                    {seller._count.listings} active listings
                  </span>
                  {seller.subscription?.plan?.name && (
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 capitalize">
                      {seller.subscription.plan.name} plan
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {sellers.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No sellers found.
          </div>
        )}
      </div>
    </div>
  );
}
