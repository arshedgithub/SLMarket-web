import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, Package } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const business = await db.businessProfile.findUnique({
    where: { slug },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      bannerUrl: true,
    },
  });

  if (!business) return { title: "Business Not Found" };

  return {
    // absolute: skips the root layout's "%s | SLMarket.lk" template so the
    // brand name isn't appended twice.
    title: { absolute: business.metaTitle ?? `${business.name} | SLMarket.lk` },
    description:
      business.metaDescription ??
      `Browse listings from ${business.name} on SLMarket.lk.`,
    openGraph: {
      title: business.metaTitle ?? business.name,
      images: business.bannerUrl ? [{ url: business.bannerUrl }] : [],
    },
  };
}

const BUSINESS_TYPE_LABEL: Record<string, string> = {
  STORE: "Store",
  DEALER: "Dealer",
  AGENCY: "Agency",
  INSTITUTE: "Institute",
  SERVICE_PROVIDER: "Service Provider",
  FARM: "Farm",
  OTHER: "",
};

function priceLabel(listing: {
  pricingType: string;
  price: unknown;
  currency: string;
}) {
  if (listing.pricingType === "CONTACT") return "Contact for price";
  if (listing.pricingType === "FREE") return "Free";
  const amount = listing.price != null ? Number(listing.price) : null;
  if (amount == null) return "Price on request";
  const prefix = listing.pricingType === "STARTING_FROM" ? "From " : "";
  return `${prefix}${listing.currency} ${amount.toLocaleString()}`;
}

export default async function BusinessProfilePage({ params }: Props) {
  const { slug } = await params;

  const business = await db.businessProfile.findUnique({
    where: { slug },
    include: {
      listings: {
        where: { status: "ACTIVE" },
        orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
        take: 24,
      },
    },
  });

  if (!business || business.status !== "ACTIVE") notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 md:h-64">
        {business.bannerUrl && (
          <Image
            src={business.bannerUrl}
            alt="Business banner"
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={business.name}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {business.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{business.name}</h1>
              {business.isVerified && (
                <ShieldCheck className="h-5 w-5 text-blue-300" />
              )}
              {BUSINESS_TYPE_LABEL[business.businessType ?? ""] && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {BUSINESS_TYPE_LABEL[business.businessType ?? ""]}
                </span>
              )}
            </div>
            {(business.city || business.district) && (
              <div className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
                <MapPin className="h-3.5 w-3.5" />
                {business.city || business.district}, Sri Lanka
              </div>
            )}
          </div>
        </div>
        <div className="absolute right-5 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
              business.tier === "TOP_RATED"
                ? "bg-amber-500 text-white"
                : business.tier === "PREMIUM"
                  ? "bg-purple-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            {business.tier.replace("_", " ").toLowerCase()}
          </span>
        </div>
      </div>

      {/* Tags + Bio */}
      {(business.tags.length > 0 || business.bio) && (
        <div className="space-y-4">
          {business.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {business.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {business.bio && (
            <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {business.bio}
            </p>
          )}
        </div>
      )}

      {/* Listings */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
          Active Listings ({business.listings.length})
        </h2>
        {business.listings.length === 0 ? (
          <p className="text-sm text-gray-500">No active listings yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {business.listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/ad/${listing.slug}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  {listing.isBoosted && (
                    <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                    {listing.title}
                  </p>
                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {priceLabel(listing)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
