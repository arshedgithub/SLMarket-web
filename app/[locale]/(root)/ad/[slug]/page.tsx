import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BadgeCheck, CalendarDays, MapPin, Tag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { categories } from "@/config/const/navLinks";
import MessageSellerButton from "./_components/MessageSellerButton";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { NegotiateButton } from "@/components/listings/NegotiateButton";
import { AVATAR_TONE } from "../../ads/_components/avatarTone";
import { safeJsonLd } from "@/lib/utils/json-ld";
import { localeAlternates } from "@/lib/seo/hreflang";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

// cache() dedupes this within a single request: generateMetadata and the
// page both need the same listing.
const getListing = cache(async (slug: string) =>
  db.listing.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      seller: { select: { name: true } },
      businessProfile: {
        select: {
          name: true,
          slug: true,
          isVerified: true,
          logoUrl: true,
          whatsappNumber: true,
          status: true,
        },
      },
    },
  }),
);

type Listing = NonNullable<Awaited<ReturnType<typeof getListing>>>;

// A suspended business hides all of its listings.
const isVisible = (l: Listing) =>
  !l.businessProfile || l.businessProfile.status === "ACTIVE";

// Short spec chips stored by the post-ad flow (attributes.highlights).
function highlightsOf(l: Listing): string[] {
  const attrs = l.attributes as { highlights?: unknown } | null;
  return Array.isArray(attrs?.highlights)
    ? attrs.highlights.filter((h): h is string => typeof h === "string")
    : [];
}

const rupees = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const listing = await getListing(slug);
  if (!listing || !isVisible(listing)) return { title: "Ad not found" };

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
    // og:image / twitter:image come from the sibling opengraph-image.tsx.
    openGraph: {
      title,
      description,
      url,
      siteName: "SLMarket.lk",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AdPage({ params }: Props) {
  const { slug, locale } = await params;
  const listing = await getListing(slug);
  if (!listing || !isVisible(listing)) notFound();

  const t = await getTranslations({ locale, namespace: "listings" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  const category = categories.find((c) => c.id === listing.categoryId);
  const hasSub = category?.subcategories.some(
    (s) => s.id === listing.subcategoryId,
  );
  const price = listing.price === null ? null : Number(listing.price);
  const business = listing.businessProfile;
  const sellerName = business?.name ?? listing.seller.name;
  const place = [listing.city, listing.district]
    .filter((p, i, all) => p && all.indexOf(p) === i)
    .join(", ");
  const contactPhone = listing.showContactPhone ? listing.contactPhone : null;
  const whatsapp = listing.allowWhatsapp
    ? (business?.whatsappNumber ?? listing.contactPhone)
    : null;
  const highlights = highlightsOf(listing);

  const priceText =
    listing.pricingType === "FREE"
      ? t("adPage.free")
      : listing.pricingType === "CONTACT" || price === null
        ? t("adPage.contactForPrice")
        : listing.pricingType === "STARTING_FROM"
          ? t("adPage.from", { price: rupees(price) })
          : rupees(price);

  const jsonLd = listing.schemaMarkup ?? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    ...(price !== null && listing.pricingType !== "CONTACT"
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: listing.currency,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: sellerName },
            areaServed: { "@type": "Country", name: "Sri Lanka" },
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <nav
          aria-label={t("adPage.breadcrumb")}
          className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-[color:var(--color-market-text-muted)]"
        >
          <Link href="/ads" className="hover:text-blue-600">
            {t("adPage.allAds")}
          </Link>
          {category && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/ads/${category.id}`}
                className="hover:text-blue-600"
              >
                {tCat(`${category.id}.name`)}
              </Link>
            </>
          )}
          {category && hasSub && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/ads/${category.id}/${listing.subcategoryId}`}
                className="hover:text-blue-600"
              >
                {tCat(`${category.id}.subcategories.${listing.subcategoryId}`)}
              </Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ListingGallery
              images={listing.images}
              reelUrl={listing.videoUrl}
              title={listing.title}
              isBoosted={listing.isBoosted}
            />
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[color:var(--color-market-text)]">
                {listing.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-3xl font-bold text-[color:var(--color-market-price)]">
                  {priceText}
                </p>
                {listing.negotiable && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {t("card.negotiable")}
                  </span>
                )}
              </div>
              {listing.promotionType !== "NONE" && listing.promotionDetail && (
                <p className="mt-2 inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  <Tag aria-hidden className="h-3.5 w-3.5" />
                  {listing.promotionDetail}
                </p>
              )}
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[color:var(--color-market-text-muted)]">
                {place && (
                  <li className="flex items-center gap-1">
                    <MapPin aria-hidden className="h-4 w-4" />
                    {place}
                  </li>
                )}
                <li className="flex items-center gap-1">
                  <CalendarDays aria-hidden className="h-4 w-4" />
                  {t("adPage.posted", {
                    date: listing.createdAt.toLocaleDateString(
                      locale === "en" ? "en-LK" : locale,
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    ),
                  })}
                </li>
                {(listing.deliveryAvailable || listing.islandwideDelivery) && (
                  <li className="flex items-center gap-1">
                    <Truck aria-hidden className="h-4 w-4" />
                    {listing.islandwideDelivery
                      ? t("business.highlights.delivery")
                      : t("adPage.delivery")}
                  </li>
                )}
              </ul>
            </div>

            {highlights.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-lg border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-2.5 py-1 text-sm text-[color:var(--color-market-text-secondary)]"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {listing.negotiable && (
              <NegotiateButton
                listingId={listing.id}
                listingSlug={listing.slug}
                listingTitle={listing.title}
                whatsappNumber={whatsapp}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              />
            )}

            <div>
              <h2 className="mb-2 font-semibold text-[color:var(--color-market-text)]">
                {t("adPage.description")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-market-text-secondary)]">
                {listing.description}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVATAR_TONE}`}
                >
                  {sellerName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-semibold text-[color:var(--color-market-text)]">
                    <span className="truncate">{sellerName}</span>
                    {business?.isVerified && (
                      <BadgeCheck
                        aria-label={t("premiumCard.verified")}
                        className="h-4 w-4 shrink-0 fill-blue-600 text-white"
                      />
                    )}
                  </p>
                  <p className="text-xs text-[color:var(--color-market-text-muted)]">
                    {business ? t("card.shop") : t("card.individual")}
                  </p>
                </div>
              </div>

              {business && (
                <Link
                  href={`/business/${business.slug}`}
                  className="mb-3 block text-center text-xs font-medium text-blue-600 hover:underline"
                >
                  {t("card.viewBusiness")}
                </Link>
              )}

              <MessageSellerButton
                listingId={listing.id}
                listingTitle={listing.title}
                contactPhone={contactPhone}
                whatsappNumber={whatsapp}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
