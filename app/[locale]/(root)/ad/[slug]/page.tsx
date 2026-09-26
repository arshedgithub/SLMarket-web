import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, Clock, Globe } from "lucide-react";
import MessageSellerButton from "./_components/MessageSellerButton";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { NegotiateButton } from "@/components/listings/NegotiateButton";
import { safeJsonLd } from "@/lib/utils/json-ld";
import { localeAlternates } from "@/lib/seo/hreflang";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

// cache() dedupes this within a single request — generateMetadata and the
// page component both need the same listing, so without this they'd issue
// two separate round-trips to Postgres for the same row.
const getListing = cache(async (slug: string) =>
  db.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          shopSlug: true,
          avatarUrl: true,
          isVerified: true,
          locationCity: true,
          specialties: true,
          subscription: { select: { plan: { select: { name: true } } } },
        },
      },
    },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  const listing = await getListing(slug);

  if (!listing) return { title: "Not Found" };

  const title = listing.metaTitle ?? listing.title;
  const description =
    listing.metaDescription ??
    `${listing.title} is available now on SLMarket.lk, Sri Lanka's trusted online marketplace. Message the seller directly to enquire.`;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";
  const url = `${base}/${locale}/ad/${listing.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternates(`/ad/${listing.slug}`),
    },
    // og:image / twitter:image come from the sibling opengraph-image.tsx
    // file convention — it generates a branded preview without the price.
    openGraph: {
      title,
      description,
      url,
      siteName: "SLMarket.lk",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AdPage({ params }: Props) {
  const { slug } = await params;

  const listing = await getListing(slug);

  if (!listing) notFound();

  const seller = {
    ...listing.seller,
    planName: listing.seller.subscription?.plan.name ?? "free",
  };

  // JSON-LD schema
  const jsonLd = listing.schemaMarkup ?? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    brand: { "@type": "Brand", name: "SLMarket.lk" },
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: seller.name },
      areaServed: { "@type": "Country", name: "Sri Lanka" },
    },
    additionalProperty: [
      listing.gemOrigin && {
        "@type": "PropertyValue",
        name: "Origin",
        value: listing.gemOrigin,
      },
      listing.caratWeight && {
        "@type": "PropertyValue",
        name: "Carat Weight",
        value: String(listing.caratWeight),
      },
      listing.treatmentStatus && {
        "@type": "PropertyValue",
        name: "Treatment",
        value: listing.treatmentStatus,
      },
      listing.certificationBody && {
        "@type": "PropertyValue",
        name: "Certified By",
        value: listing.certificationBody,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Images */}
          <div className="lg:col-span-3">
            <ListingGallery
              images={listing.images}
              reelUrl={listing.reelUrl}
              title={listing.title}
              isBoosted={listing.isBoosted}
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                {listing.category}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.title}
              </h1>
              <div className="mt-2">
                <p className="flex items-center gap-2 text-3xl font-bold text-blue-600">
                  {listing.currency} {Number(listing.price).toLocaleString()}
                  {listing.pricingType === "Negotiable" && (
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                      Negotiable
                    </span>
                  )}
                </p>
                {listing.pricingType === "Negotiable" && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Price is negotiable. Message the seller for details.
                    </p>
                    <NegotiateButton
                      listingId={listing.id}
                      listingSlug={listing.slug}
                      listingTitle={listing.title}
                      whatsappNumber={
                        listing.whatsappEnabled ? listing.whatsappNumber : null
                      }
                      className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Category-specific details */}
            <CategoryDetails listing={listing} />

            {/* Certification images (all categories) */}
            {listing.certificationImages?.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Certification Documents
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {listing.certificationImages.map((src: string, i: number) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity">
                        <Image
                          src={src}
                          alt={`Certificate ${i + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Seller card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {seller.name}
                    </span>
                    {seller.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  {seller.locationCity && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {seller.locationCity}, Sri Lanka
                    </div>
                  )}
                </div>
              </div>

              {seller.shopSlug && (
                <Link
                  href={`/business/${seller.shopSlug}`}
                  className="block text-center text-xs font-medium text-blue-600 hover:underline mb-3"
                >
                  View business page →
                </Link>
              )}

              {/* Message Seller (direct chat) + Call/WhatsApp fallback */}
              <MessageSellerButton
                listingId={listing.id}
                listingTitle={listing.title}
                contactPhone={
                  listing.hideContactPhone ? null : listing.contactPhone
                }
                whatsappNumber={
                  listing.whatsappEnabled ? listing.whatsappNumber : null
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Category-specific detail grids ─────────────────────────────────────────

function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
      {children}
    </div>
  );
}

function DetailCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CategoryDetails({ listing }: { listing: any }) {
  const category: string = listing.category;

  if (category === "GEM") {
    return (
      <DetailGrid>
        <DetailCell label="Gem Type" value={listing.gemType} />
        <DetailCell
          label="Carat Weight"
          value={
            listing.caratWeight ? `${Number(listing.caratWeight)} ct` : null
          }
        />
        <DetailCell label="Origin" value={listing.gemOrigin} />
        <DetailCell label="Current Location" value={listing.currentLocation} />
        <DetailCell label="Treatment" value={listing.treatmentStatus} />
        <DetailCell label="Certified By" value={listing.certificationBody} />
        <DetailCell label="Certificate #" value={listing.certificationNumber} />
      </DetailGrid>
    );
  }

  if (category === "JEWELLERY") {
    return (
      <DetailGrid>
        <DetailCell label="Type" value={listing.jewelleryType} />
        <DetailCell
          label="Metal"
          value={
            [listing.metalType, listing.metalPurity]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <DetailCell label="Accent Gemstone" value={listing.gemType} />
        <DetailCell
          label="Weight"
          value={
            listing.weightGrams ? `${Number(listing.weightGrams)} g` : null
          }
        />
        <DetailCell label="Ring Size" value={listing.ringSize} />
        <DetailCell label="Location" value={listing.currentLocation} />
      </DetailGrid>
    );
  }

  if (category === "PRECIOUS_METAL") {
    return (
      <DetailGrid>
        <DetailCell label="Metal Type" value={listing.metalType} />
        <DetailCell label="Purity" value={listing.metalPurity} />
        <DetailCell
          label="Weight"
          value={
            listing.weightGrams ? `${Number(listing.weightGrams)} g` : null
          }
        />
        <DetailCell label="Current Location" value={listing.currentLocation} />
        <DetailCell label="Certificate #" value={listing.certificationNumber} />
      </DetailGrid>
    );
  }

  if (category === "SERVICE") {
    const areaLabel =
      listing.serviceArea?.length > 0
        ? listing.serviceArea.join(", ")
        : (listing.currentLocation ?? null);

    return (
      <DetailGrid>
        <DetailCell label="Service Type" value={listing.serviceType} />
        <DetailCell label="Pricing" value={listing.pricingType} />
        <DetailCell
          label="Turnaround Time"
          value={
            listing.turnaroundTime ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {listing.turnaroundTime}
              </span>
            ) : null
          }
        />
        <DetailCell
          label="Service Area"
          value={
            areaLabel ? (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {areaLabel}
              </span>
            ) : null
          }
        />
        <DetailCell label="Workshop Location" value={listing.currentLocation} />
      </DetailGrid>
    );
  }

  return null;
}
