import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Eye,
  Flag,
  MapPin,
  Navigation,
  PencilLine,
  Rocket,
  ShieldCheck,
  Star,
  Tag,
  TrendingDown,
  Truck,
  Zap,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { withTimeout } from "@/lib/business/dbGuard";
import { Link } from "@/i18n/navigation";
import { categories } from "@/config/const/navLinks";
import { getAdView, isStale, type AdView } from "@/lib/listings/adView";
import {
  keyDetailRows,
  quickFacts,
  schemaCondition,
  titleWithSpecs,
} from "@/lib/listings/adPresentation";
import {
  businessesNearby,
  moreFromSeller,
  similarAds,
} from "@/lib/listings/recommendations";
import { getStorefront } from "@/lib/business/getStorefront";
import { businessesInCategory, getAdFeed } from "@/lib/listings/feed";
import {
  GPS_COOKIE,
  PLACE_COOKIE,
  resolveOrigin,
} from "@/lib/listings/nearYou";
import { showViews } from "@/lib/listings/socialProof";
import { isOpenNow, type StorefrontBusiness } from "@/lib/business/storefront";
import { instalmentQuote } from "@/lib/business/pricing";
import { labelForSurface, responseLabelFor } from "@/lib/business/responseTime";
import { DISTRICT_CENTRES } from "@/lib/business/directory/geo";
import { safeJsonLd } from "@/lib/utils/json-ld";
import { localeAlternates } from "@/lib/seo/hreflang";
import { AVATAR_TONE } from "../../ads/_components/avatarTone";
import { AdGallery } from "./_components/AdGallery";
import {
  ContactBar,
  ContactPanel,
  SaveShare,
  type ContactLabels,
} from "./_components/ContactActions";
import { Description } from "./_components/Description";
import { LazyLocationMap } from "./_components/LazyLocationMap";
import { RecoRow, TrackLink } from "./_components/RecoRow";
import { AdViewTracker, RecentlyViewed } from "./_components/RecentlyViewed";
import { NearYouLocation } from "./_components/NearYouLocation";
import { OwnerActions } from "./_components/OwnerActions";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";
const rupees = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;
const dateLocale = (locale: string) => (locale === "en" ? "en-LK" : locale);

function priceTextOf(
  ad: AdView,
  t: (k: string, v?: Record<string, string>) => string,
) {
  if (ad.priceRange) return ad.priceRange;
  if (ad.pricingType === "FREE") return t("adPage.free");
  if (ad.pricingType === "CONTACT" || ad.price === null)
    return t("adPage.contactForPrice");
  if (ad.pricingType === "STARTING_FROM")
    return t("adPage.from", { price: rupees(ad.price) });
  return rupees(ad.price);
}

function placeOf(ad: AdView) {
  return [ad.city, ad.district]
    .filter((p, i, all) => p && all.indexOf(p) === i)
    .join(", ");
}

// "3 days ago" in the page's language.
function timeAgo(date: Date, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(dateLocale(locale), {
    numeric: "auto",
  });
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return rtf.format(Math.round(days / 30), "month");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const ad = await getAdView(slug);
  if (!ad) return { title: "Ad not found" };
  const t = await getTranslations({ locale, namespace: "listings" });

  const place = placeOf(ad);
  // "Dell XPS 13 Laptop (i7, 16GB, 512GB): Rs. 299,000 in Colombo"
  const title =
    ad.metaTitle ??
    `${titleWithSpecs(ad.title, ad.details)}: ${priceTextOf(ad, t)}${place ? ` in ${ad.city ?? place}` : ""}`;
  const description =
    ad.metaDescription ??
    (ad.description.slice(0, 155) ||
      `${ad.title} on SLMarket.lk, Sri Lanka's trusted online marketplace.`);
  const url = `${SITE_URL}/${locale}/ad/${ad.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternates(`/ad/${ad.slug}`),
    },
    // Sold or removed more than 30 days ago: out of search results.
    robots: isStale(ad) ? { index: false, follow: true } : undefined,
    // og:image (first photo, title and price) comes from opengraph-image.tsx.
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
  const ad = await getAdView(slug);
  if (!ad) notFound();

  const t = await getTranslations({ locale, namespace: "listings" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;
  const isOwner = !!userId && userId === ad.sellerUserId;

  // "Near" (lib/listings/nearYou.ts): GPS if allowed, the place chosen on
  // the site, the account's district, then the ad's own.
  let userDistrict: string | null = null;
  if (userId) {
    userDistrict = await withTimeout(
      db.user.findUnique({ where: { id: userId }, select: { district: true } }),
    )
      .then((u) => u?.district ?? null)
      .catch(() => null);
  }
  const jar = await cookies();
  const { district: origin } = resolveOrigin({
    gps: decodeURIComponent(jar.get(GPS_COOKIE)?.value ?? ""),
    chosen: decodeURIComponent(jar.get(PLACE_COOKIE)?.value ?? ""),
    account: userDistrict,
    ad: ad.district,
  });

  const business = ad.seller.business;
  const storefront: StorefrontBusiness | null = business
    ? await getStorefront(business.slug).catch(() => null)
    : null;

  const category = categories.find((c) => c.id === ad.categoryId);
  const subcategory = category?.subcategories.find(
    (s) => s.id === ad.subcategoryId,
  );
  const categoryName = category ? tCat(`${category.id}.name`) : "";
  const subName =
    subcategory && category
      ? tCat(`${category.id}.subcategories.${subcategory.id}`)
      : categoryName;

  const live = ad.status === "live";
  // Reserved ads stay open for contact ("ask to be next").
  const contactable = live || ad.status === "reserved";
  const title = titleWithSpecs(ad.title, ad.details);
  const priceText = priceTextOf(ad, t);
  const place = placeOf(ad);
  const url = `${SITE_URL}/${locale}/ad/${ad.slug}`;
  const warrantyMonths = (type: string, months: string) =>
    t("adPage.warrantyMonths", { type, months });
  const facts = quickFacts(ad.details, warrantyMonths);
  const detailRows = keyDetailRows(ad.categoryId, ad.details, {
    yes: t("adPage.yes"),
    no: t("adPage.no"),
    warrantyMonths,
  });

  const providers = storefront?.about.instalmentProviders ?? [];
  const instalment =
    ad.price && providers.length
      ? instalmentQuote(ad.price, { provider: providers[0] }, providers)
      : null;

  // Recommendations: more from the seller, similar ads (never repeating
  // those), businesses (private ads only).
  const [feedAds, categoryBusinesses] = await Promise.all([
    getAdFeed(),
    business ? Promise.resolve([]) : businessesInCategory(ad.categoryId),
  ]);
  const more = moreFromSeller(ad, feedAds);
  const similar = similarAds(
    ad,
    origin,
    feedAds,
    new Set(more.map((l) => l.slug)),
  );
  const nearbyBusinesses = businessesNearby(ad, origin, categoryBusinesses);
  const similarHeading = similar
    ? {
        1: t("adPage.similar1", { sub: subName, place: origin ?? place }),
        2: t("adPage.similar2", { sub: subName }),
        3: t("adPage.similar3", { category: categoryName }),
        4: t("adPage.similar4"),
      }[similar.level]
    : "";
  const similarRow = similar && (
    <RecoRow
      id="similar"
      heading={similarHeading}
      headingAside={
        <NearYouLocation
          label={t("adPage.useMyLocation")}
          busyLabel={t("adPage.locating")}
        />
      }
      ads={similar.ads}
      event="similar_click"
      data={{ from: ad.slug, level: similar.level }}
      viewAll={
        similar.level <= 2 && subcategory && category
          ? {
              href: `/ads/${category.id}/${subcategory.id}`,
              label: t("adPage.viewAll"),
            }
          : undefined
      }
    />
  );

  // Seller card facts.
  const responseLabel = storefront
    ? labelForSurface(responseLabelFor(storefront.response), "page")
    : null;
  const openNow = storefront ? isOpenNow(storefront) : null;
  const sinceYear =
    storefront?.sinceYear ?? ad.seller.memberSince?.getFullYear() ?? null;
  const sellerName = ad.seller.name ?? t("adPage.privateSeller");

  // A business with a shop location gets its pin; everyone else (always
  // private sellers) an approximate area.
  const shopPin = business ? storefront?.location : undefined;
  const centre =
    shopPin ?? (ad.district ? DISTRICT_CENTRES[ad.district] : undefined);

  const contactLabels: ContactLabels = {
    whatsapp: t("adPage.contact.whatsapp"),
    askNext: t("adPage.contact.askNext"),
    showNumber: t("adPage.contact.showNumber"),
    call: t("adPage.contact.call"),
    chat: t("adPage.contact.chat"),
    save: t("adPage.contact.save"),
    saved: t("adPage.contact.saved"),
    share: t("adPage.contact.share"),
    copied: t("adPage.contact.copied"),
    tooMany: t("adPage.contact.tooMany"),
    failed: t("adPage.contact.failed"),
    close: t("adPage.contact.close"),
    emailCheck: {
      title: t("adPage.emailCheck.title"),
      body: t("adPage.emailCheck.body"),
      emailLabel: t("adPage.emailCheck.emailLabel"),
      sendCode: t("adPage.emailCheck.sendCode"),
      codeLabel: t("adPage.emailCheck.codeLabel"),
      codeSent: t("adPage.emailCheck.codeSent", { email: "{email}" }),
      confirm: t("adPage.emailCheck.confirm"),
      changeEmail: t("adPage.emailCheck.changeEmail"),
      close: t("adPage.contact.close"),
      failed: t("adPage.contact.failed"),
    },
  };
  const contactProps = {
    listingId: ad.id,
    slug: ad.slug,
    title: ad.title,
    priceText,
    url,
    publicPhone: business ? ad.contact.phone : null,
    publicWhatsapp: business ? ad.contact.whatsapp : null,
    privateNumber: !business && !!ad.contact.phone,
    canChat: true,
    reserved: ad.status === "reserved",
    labels: contactLabels,
  };
  const showContact = contactable && !isOwner;

  // Structured data: the product with its offer, and the breadcrumb.
  const condition = schemaCondition(ad.details.condition);
  const jsonLd = ad.schemaMarkup ?? [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description: ad.description,
      image: ad.photos.map((p) =>
        p.startsWith("http") ? p : `${SITE_URL}${p}`,
      ),
      sku: ad.adCode,
      ...(ad.details.brand
        ? { brand: { "@type": "Brand", name: ad.details.brand } }
        : {}),
      ...(ad.price !== null && ad.pricingType !== "CONTACT" && !ad.priceRange
        ? {
            offers: {
              "@type": "Offer",
              url,
              price: ad.price,
              priceCurrency: ad.currency,
              ...(condition ? { itemCondition: condition } : {}),
              availability:
                ad.status === "sold"
                  ? "https://schema.org/SoldOut"
                  : ad.status === "reserved"
                    ? "https://schema.org/LimitedAvailability"
                    : ad.status === "expired"
                      ? "https://schema.org/Discontinued"
                      : ad.details.availability === "Pre-order"
                        ? "https://schema.org/PreOrder"
                        : "https://schema.org/InStock",
              seller: business
                ? {
                    "@type": "Organization",
                    name: business.name,
                    url: `${SITE_URL}/${locale}/business/${business.slug}`,
                  }
                : { "@type": "Person", name: sellerName },
              areaServed: { "@type": "Country", name: "Sri Lanka" },
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: t("adPage.allAds"), path: "/ads" },
        ...(category
          ? [{ name: categoryName, path: `/ads/${category.id}` }]
          : []),
        ...(category && subcategory
          ? [{ name: subName, path: `/ads/${category.id}/${subcategory.id}` }]
          : []),
        ...(category && subcategory && ad.district
          ? [
              {
                name: ad.district,
                path: `/ads/${category.id}/${subcategory.id}?location=${encodeURIComponent(ad.district)}`,
              },
            ]
          : []),
      ].map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${SITE_URL}/${locale}${c.path}`,
      })),
    },
  ];

  const crumb = "hover:text-blue-600";
  const sectionTitle =
    "font-heading mb-3 text-lg font-bold text-[color:var(--color-market-text)]";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <AdViewTracker
        listingId={ad.id}
        ad={{
          slug: ad.slug,
          title: ad.title,
          priceText,
          photo: ad.photos[0] ?? null,
          place,
        }}
      />

      <div
        className={`mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 ${showContact ? "pb-28 md:pb-12" : "pb-12"}`}
      >
        <nav
          aria-label={t("adPage.breadcrumb")}
          className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[color:var(--color-market-text-muted)]"
        >
          <Link href="/ads" className={crumb}>
            {t("adPage.allAds")}
          </Link>
          {category && (
            <>
              <span aria-hidden>›</span>
              <Link href={`/ads/${category.id}`} className={crumb}>
                {categoryName}
              </Link>
            </>
          )}
          {category && subcategory && (
            <>
              <span aria-hidden>›</span>
              <Link
                href={`/ads/${category.id}/${subcategory.id}`}
                className={crumb}
              >
                {subName}
              </Link>
            </>
          )}
          {category && subcategory && ad.district && (
            <>
              <span aria-hidden>›</span>
              <Link
                href={`/ads/${category.id}/${subcategory.id}?location=${encodeURIComponent(ad.district)}`}
                className={crumb}
              >
                {ad.district}
              </Link>
            </>
          )}
        </nav>

        {!live && (
          <div
            role="status"
            className={`mb-6 rounded-2xl border p-4 sm:p-5 ${
              ad.status === "expired"
                ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
            }`}
          >
            <p className="font-heading text-lg font-bold text-[color:var(--color-market-text)]">
              {t(`adPage.${ad.status}Title`)}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-market-text-secondary)]">
              {t(`adPage.${ad.status}Body`)}
            </p>
          </div>
        )}
        {!contactable && similarRow && (
          <div className="-mt-4 mb-8">{similarRow}</div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Gallery */}
          <div className={`lg:col-span-7 ${contactable ? "" : "opacity-80"}`}>
            <AdGallery
              photos={ad.photos}
              videoUrl={ad.videoUrl}
              title={ad.title}
              slug={ad.slug}
              labels={{
                previous: t("adPage.gallery.previous"),
                next: t("adPage.gallery.next"),
                fullScreen: t("adPage.gallery.fullScreen"),
                close: t("adPage.gallery.close"),
                photoOf: t("adPage.gallery.photoOf", {
                  n: "{n}",
                  total: String(ad.photos.length + (ad.videoUrl ? 1 : 0)),
                }),
                video: t("adPage.gallery.video"),
                zoom: t("adPage.gallery.zoom"),
              }}
              overlay={
                contactable ? (
                  <SaveShare
                    slug={ad.slug}
                    title={ad.title}
                    url={url}
                    labels={contactLabels}
                    compact
                  />
                ) : undefined
              }
            />
          </div>

          {/* The sticky panel: price, facts, actions, seller, safety */}
          <aside className="mt-5 lg:col-span-5 lg:row-span-2 lg:mt-0 lg:self-start lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-5">
              <h1 className="font-heading text-xl font-bold leading-snug text-[color:var(--color-market-text)] sm:text-2xl">
                {title}
              </h1>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-3xl font-extrabold tracking-tight text-[color:var(--color-market-price)]">
                  {priceText}
                </p>
                {ad.perMonth && (
                  <span className="text-sm font-medium text-[color:var(--color-market-text-muted)]">
                    / month
                  </span>
                )}
                {ad.negotiable && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {t("card.negotiable")}
                  </span>
                )}
              </div>
              {ad.wasPrice && (
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <TrendingDown aria-hidden className="h-4 w-4" />
                  {ad.wasPrice.since
                    ? t("adPage.wasSince", {
                        price: rupees(ad.wasPrice.price),
                        date: ad.wasPrice.since.toLocaleDateString(
                          dateLocale(locale),
                          { day: "numeric", month: "short" },
                        ),
                      })
                    : t("adPage.was", { price: rupees(ad.wasPrice.price) })}
                </p>
              )}
              {instalment && (
                <p className="mt-1 text-sm text-[color:var(--color-market-text-secondary)]">
                  {t("adPage.instalment", {
                    amount: rupees(instalment.perMonth),
                    provider: instalment.providerName,
                  })}
                </p>
              )}
              {ad.promotionDetail && (
                <p className="mt-2 inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  <Tag aria-hidden className="h-3.5 w-3.5" />
                  {ad.promotionDetail}
                </p>
              )}

              {facts.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {facts.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--color-market-border)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-market-text-secondary)]"
                    >
                      {f === ad.details.availability && (
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                      )}
                      {f}
                    </li>
                  ))}
                </ul>
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
                  <time
                    dateTime={ad.createdAt.toISOString()}
                    title={ad.createdAt.toLocaleString(dateLocale(locale), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  >
                    {timeAgo(ad.createdAt, locale)}
                  </time>
                </li>
                {ad.delivery !== "none" && (
                  <li className="flex items-center gap-1">
                    <Truck aria-hidden className="h-4 w-4" />
                    {ad.delivery === "islandwide"
                      ? t("business.highlights.delivery")
                      : t("adPage.delivery")}
                  </li>
                )}
              </ul>

              {showContact && (
                <div className="mt-5 hidden md:block">
                  <ContactPanel {...contactProps} />
                </div>
              )}

              {isOwner && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                  <p className="font-semibold text-[color:var(--color-market-text)]">
                    {t("adPage.ownerTitle")}
                  </p>
                  {showViews(ad.views) && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[color:var(--color-market-text-secondary)]">
                      <Eye aria-hidden className="h-4 w-4" />
                      {t("adPage.ownerViews", { count: ad.views })}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[color:var(--color-market-text-muted)]">
                    {t("adPage.ownerBody")}
                  </p>
                  {ad.status !== "expired" && (
                    <OwnerActions
                      listingId={ad.id}
                      status={
                        ad.status === "sold"
                          ? "SOLD"
                          : ad.status === "reserved"
                            ? "RESERVED"
                            : "ACTIVE"
                      }
                      labels={{
                        markSold: t("adPage.markSold"),
                        markReserved: t("adPage.markReserved"),
                        markAvailable: t("adPage.markAvailable"),
                        failed: t("adPage.contact.failed"),
                      }}
                    />
                  )}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link
                      href={`/dashboard/ads/${ad.id}/edit`}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] text-sm font-semibold"
                    >
                      <PencilLine aria-hidden className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {t("adPage.edit")}
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/upgrade"
                      className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-market-blue)] text-sm font-semibold text-white"
                    >
                      <Rocket aria-hidden className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {t("adPage.boost")}
                      </span>
                    </Link>
                  </div>
                  <Link
                    href="/dashboard/ads"
                    className="mt-2 block text-center text-xs font-semibold text-blue-600"
                  >
                    {t("adPage.manage")}
                  </Link>
                </div>
              )}

              {/* Seller */}
              <div className="mt-5 border-t border-[var(--color-market-border)] pt-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${AVATAR_TONE}`}
                  >
                    {storefront?.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={storefront.logo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      sellerName.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-semibold text-[color:var(--color-market-text)]">
                      <span className="truncate">{sellerName}</span>
                      {business?.isVerified && (
                        <BadgeCheck
                          aria-label={t("premiumCard.verified")}
                          className="h-4 w-4 shrink-0 fill-blue-600 text-white"
                        />
                      )}
                    </p>
                    {storefront && storefront.rating.count > 0 ? (
                      <p className="flex items-center gap-1 text-sm text-[color:var(--color-market-text-secondary)]">
                        <Star
                          aria-hidden
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        />
                        {t("adPage.rating", {
                          rating: storefront.rating.average.toFixed(1),
                          count: String(storefront.rating.count),
                        })}
                      </p>
                    ) : (
                      !business && (
                        <p className="text-sm text-[color:var(--color-market-text-muted)]">
                          {t("adPage.privateSeller")}
                        </p>
                      )
                    )}
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--color-market-text-secondary)]">
                  {responseLabel && (
                    <li className="flex items-center gap-2">
                      <Zap aria-hidden className="h-4 w-4 text-amber-500" />
                      {t(`business.responseShort.${responseLabel}`)}
                    </li>
                  )}
                  {openNow !== null && (
                    <li className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={`ml-1 mr-1 h-2 w-2 rounded-full ${openNow ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      {openNow ? t("business.openNow") : t("business.closed")}
                    </li>
                  )}
                  {!business && ad.seller.phoneVerified && (
                    <li className="flex items-center gap-2">
                      <ShieldCheck
                        aria-hidden
                        className="h-4 w-4 text-emerald-600"
                      />
                      {t("adPage.phoneVerified")}
                    </li>
                  )}
                  {sinceYear && (
                    <li className="flex items-center gap-2">
                      <Clock aria-hidden className="h-4 w-4" />
                      {t("adPage.memberSince", { year: String(sinceYear) })}
                    </li>
                  )}
                  {!business && ad.seller.otherAdsCount > 0 && (
                    <li>
                      {t("adPage.otherAds", {
                        count: String(ad.seller.otherAdsCount),
                      })}
                    </li>
                  )}
                </ul>
                {business && (
                  <TrackLink
                    href={`/business/${business.slug}`}
                    event="view_business_click"
                    data={{ slug: ad.slug, business: business.slug }}
                    className="mt-4 flex h-11 items-center justify-center rounded-xl border border-[var(--color-market-border-strong)] text-sm font-semibold text-blue-700 transition hover:border-blue-300 dark:text-blue-300"
                  >
                    <span className="text-sm font-semibold">
                      {t("adPage.viewBusinessAds", {
                        count: String(ad.seller.otherAdsCount + 1),
                      })}{" "}
                      →
                    </span>
                  </TrackLink>
                )}
              </div>

              <p className="mt-4 flex gap-2 border-t border-[var(--color-market-border)] pt-4 text-xs leading-relaxed text-[color:var(--color-market-text-secondary)]">
                <ShieldCheck
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-blue-600"
                />
                <span>
                  {t("adPage.safety")}{" "}
                  <TrackLink
                    href="/help/safety"
                    event="safety_tips_click"
                    data={{ slug: ad.slug }}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {t("adPage.safetyMore")} →
                  </TrackLink>
                </span>
              </p>
            </div>
          </aside>

          {/* Under the gallery */}
          <div className="mt-8 space-y-8 lg:col-span-7">
            {detailRows.length > 0 ? (
              <section aria-labelledby="key-details">
                <h2 id="key-details" className={sectionTitle}>
                  {t("adPage.keyDetails")}
                </h2>
                <dl className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] sm:grid-cols-2">
                  {detailRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex justify-between gap-4 border-b border-[var(--color-market-border)] px-4 py-2.5 text-sm sm:odd:border-r"
                    >
                      <dt className="text-[color:var(--color-market-text-muted)]">
                        {row.label}
                      </dt>
                      <dd className="text-right font-semibold text-[color:var(--color-market-text)]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : (
              ad.highlights.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {ad.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-lg border border-[var(--color-market-border)] px-2.5 py-1 text-sm text-[color:var(--color-market-text-secondary)]"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )
            )}

            {ad.description && (
              <section aria-labelledby="description">
                <h2 id="description" className={sectionTitle}>
                  {t("adPage.description")}
                </h2>
                <Description
                  text={ad.description}
                  more={t("adPage.readMore")}
                  less={t("adPage.showLess")}
                />
              </section>
            )}

            {storefront &&
              (storefront.about.deliveryAreas ||
                storefront.about.warrantyPolicy ||
                storefront.about.returnsPolicy) && (
                <section aria-labelledby="policies">
                  <h2 id="policies" className={sectionTitle}>
                    {t("adPage.policies")}
                  </h2>
                  <dl className="space-y-3 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 text-sm">
                    {[
                      {
                        k: "delivery",
                        label: t("adPage.policyDelivery"),
                        v: [
                          storefront.about.deliveryAreas,
                          storefront.about.deliveryFee,
                        ]
                          .filter(Boolean)
                          .join(". "),
                      },
                      {
                        k: "warranty",
                        label: t("adPage.policyWarranty"),
                        v: storefront.about.warrantyPolicy,
                      },
                      {
                        k: "returns",
                        label: t("adPage.policyReturns"),
                        v: storefront.about.returnsPolicy,
                      },
                    ]
                      .filter((p) => p.v)
                      .map((p) => (
                        <div key={p.k}>
                          <dt className="font-semibold text-[color:var(--color-market-text)]">
                            {p.label}
                          </dt>
                          <dd className="mt-0.5 text-[color:var(--color-market-text-secondary)]">
                            {p.v}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </section>
              )}

            {centre && (
              <section aria-labelledby="location">
                <h2 id="location" className={sectionTitle}>
                  {t("adPage.location")}
                </h2>
                <LazyLocationMap
                  centre={centre}
                  radiusKm={5}
                  pin={shopPin}
                  label={t("adPage.mapLabel", { place })}
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-[color:var(--color-market-text-muted)]">
                  <span>
                    {shopPin
                      ? t("adPage.locationShop")
                      : business
                        ? t("adPage.locationBusiness")
                        : t("adPage.locationApprox")}
                  </span>
                  {business && (
                    <a
                      href={
                        shopPin
                          ? `https://www.google.com/maps/dir/?api=1&destination=${shopPin.lat},${shopPin.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${ad.city ?? ad.district}`)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <Navigation aria-hidden className="h-4 w-4" />
                      {t("adPage.directions")}
                    </a>
                  )}
                </div>
              </section>
            )}

            <section
              aria-label={t("adPage.adDetailsTitle")}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-market-border)] pt-4 text-sm text-[color:var(--color-market-text-muted)]"
            >
              <span>{t("adPage.adId", { code: ad.adCode })}</span>
              {showViews(ad.views) && (
                <span>{t("adPage.views", { count: ad.views })}</span>
              )}
              <TrackLink
                href={`/help/complaints?ad=${encodeURIComponent(ad.slug)}`}
                event="report_click"
                data={{ slug: ad.slug }}
                className="ml-auto inline-flex items-center gap-1 font-medium hover:text-red-600"
              >
                <Flag aria-hidden className="h-4 w-4" />
                {t("adPage.report")}
              </TrackLink>
            </section>
          </div>
        </div>

        {/* Below: more from the seller, similar, businesses, recently viewed */}
        {more.length > 0 && (
          <RecoRow
            id="more"
            heading={
              business
                ? t("adPage.moreFrom", { name: business.name })
                : t("adPage.theirOtherAds")
            }
            ads={more}
            event="more_from_seller_click"
            data={{ from: ad.slug }}
            viewAll={
              business
                ? {
                    href: `/business/${business.slug}`,
                    label: t("adPage.viewAll"),
                  }
                : undefined
            }
          />
        )}
        {contactable && similarRow}
        {nearbyBusinesses.length > 0 && (
          <section aria-labelledby="businesses-heading" className="mt-10">
            <h2
              id="businesses-heading"
              className="font-heading mb-4 text-lg font-extrabold tracking-tight text-[color:var(--color-market-text)] sm:text-xl"
            >
              {t("adPage.businessesNear", { sub: subName })}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {nearbyBusinesses.map((s) => (
                <li key={s.slug}>
                  <TrackLink
                    href={`/business/${s.slug}`}
                    event="business_suggestion_click"
                    data={{ from: ad.slug, business: s.slug }}
                    className="flex h-full items-center gap-3 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-3 transition hover:border-blue-300"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVATAR_TONE}`}
                    >
                      {s.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-sm font-semibold text-[color:var(--color-market-text)]">
                        <span className="truncate">{s.name}</span>
                        <BadgeCheck
                          aria-hidden
                          className="h-4 w-4 shrink-0 fill-blue-600 text-white"
                        />
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[color:var(--color-market-text-muted)]">
                        {s.rating !== null && (
                          <>
                            <Star
                              aria-hidden
                              className="h-3 w-3 fill-amber-400 text-amber-400"
                            />
                            {s.rating.toFixed(1)} ·
                          </>
                        )}
                        {s.location}
                      </span>
                    </span>
                    {s.sponsored && (
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {t("adPage.sponsored")}
                      </span>
                    )}
                  </TrackLink>
                </li>
              ))}
            </ul>
          </section>
        )}
        <RecentlyViewed currentSlug={ad.slug} heading={t("adPage.recent")} />
      </div>

      {showContact && <ContactBar {...contactProps} />}
    </>
  );
}
