import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { ShieldCheck, Store, MapPin, Search } from "lucide-react";
import { db } from "@/lib/db";
import { getOrSetCached } from "@/lib/redis";
import { localeAlternates } from "@/lib/seo/hreflang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo.businesses" });
  return {
    // absolute: "title" already ends in the brand name, so it must skip the
    // root layout's "%s | SLMarket.lk" template rather than have it appended
    // a second time.
    title: { absolute: t("title") },
    description: t("description"),
    keywords: t("keywords"),
    alternates: { languages: localeAlternates("/businesses") },
  };
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function getBusinessResults(
  where: Prisma.BusinessProfileWhereInput,
  page: number,
  limit: number,
) {
  return getOrSetCached(
    `businesses:${JSON.stringify(where)}:${page}:${limit}`,
    120,
    async () => {
      const [businesses, total] = await Promise.all([
        db.businessProfile.findMany({
          where,
          select: {
            id: true,
            name: true,
            slug: true,
            categoryId: true,
            bio: true,
            bannerUrl: true,
            district: true,
            city: true,
            isVerified: true,
            tier: true,
            businessType: true,
            _count: { select: { listings: { where: { status: "ACTIVE" } } } },
          },
          orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.businessProfile.count({ where }),
      ]);
      return { businesses, total };
    },
  );
}

const TIER_LABEL: Record<string, string> = {
  TOP_RATED: "Top Rated",
  PREMIUM: "Premium",
  VERIFIED: "Verified",
  STANDARD: "",
};

const BUSINESS_TYPE_LABEL: Record<string, string> = {
  STORE: "Store",
  DEALER: "Dealer",
  AGENCY: "Agency",
  INSTITUTE: "Institute",
  SERVICE_PROVIDER: "Service Provider",
  FARM: "Farm",
  OTHER: "",
};

export default async function BusinessesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "businesses" });

  const { q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 24;

  const where: Prisma.BusinessProfileWhereInput = { status: "ACTIVE" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
    ];
  }

  const { businesses, total } = await getBusinessResults(where, page, limit);

  return (
    <div className="marketplace-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--color-market-text)] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--color-market-text-secondary)] sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <form className="mx-auto mb-6 flex max-w-lg items-center gap-2 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </form>

        <p className="mb-5 text-sm text-[var(--color-market-text-muted)]">
          {t("resultsFound", { count: total })}
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/business/${business.slug}`}
              className="group overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="relative h-28 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700">
                {business.bannerUrl && (
                  <Image
                    src={business.bannerUrl}
                    alt={`${business.name} banner`}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                )}
                {business.isVerified && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                    <ShieldCheck className="h-3 w-3" /> {t("verified")}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="-mt-8 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-market-surface)] bg-blue-100 shadow dark:bg-blue-900">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-[var(--color-market-text)] transition-colors group-hover:text-blue-600">
                        {business.name}
                      </p>
                      {BUSINESS_TYPE_LABEL[business.businessType ?? ""] && (
                        <span className="shrink-0 rounded-full bg-[var(--color-market-border)]/60 px-2 py-0.5 text-[10px] font-medium text-[var(--color-market-text-muted)]">
                          {BUSINESS_TYPE_LABEL[business.businessType ?? ""]}
                        </span>
                      )}
                    </div>
                    {(business.district || business.city) && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-market-text-muted)]">
                        <MapPin className="h-3 w-3" />
                        {business.city || business.district}
                      </div>
                    )}
                  </div>
                </div>
                {business.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-[var(--color-market-text-muted)]">
                    {business.bio}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-[var(--color-market-border)] pt-3">
                  <span className="text-xs text-[var(--color-market-text-muted)]">
                    {t("activeListings", { count: business._count.listings })}
                  </span>
                  {TIER_LABEL[business.tier] && (
                    <span className="text-xs font-medium capitalize text-violet-600 dark:text-violet-400">
                      {TIER_LABEL[business.tier]}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="py-20 text-center text-[var(--color-market-text-muted)]">
            {t("empty")}
          </div>
        )}
      </div>
    </div>
  );
}
