"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Briefcase,
  Camera,
  Crown,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/config/const/navLinks";
import { categoryIcon } from "@/config/const/categoryIcons";
import { cardSpecs, isJustListed, listingKind } from "@/lib/listings/cardSpecs";
import { useSavedAd } from "@/lib/listings/savedAds";
import type { AdCard } from "./data";

/*
 * One ad card, in two densities: grid and list. The same component serves
 * the homepage and /ads.
 *
 * Image corners, one job each:
 *   top-left      status (Premium, Featured), then the deal (-10%, Coupon)
 *   top-right     save
 *   bottom-left   what kind of ad (Rent, Sale, Job, Reserved)
 *   bottom-right  photo count (2 or more photos)
 * Body, top to bottom (fixed heights, so a row of cards lines up): title
 * (2 lines), price with Negotiable or Fixed price, the old price or offer,
 * 2 specs, place and time, and for businesses the seller row.
 * Ads without a photo (most jobs) are a compact text card.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

// A neutral blur shown while a photo loads (no layout shift: the box has
// a fixed 4:3 ratio).
const BLUR =
  "data:image/svg+xml;base64," +
  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";

const detailHref = (l: AdCard) => `/ad/${l.slug}`;
const hasPhoto = (l: AdCard) => !!l.image;
const objectPosition = (l: AdCard) =>
  l.focus ? `${l.focus.x * 100}% ${l.focus.y * 100}%` : undefined;

// "5 hours ago" → "5h ago" on grid cards.
function shortAgo(s: string) {
  return s
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ weeks?/, "w");
}

// Full digits, never "Rs. 18.5M"; "/ month" in a lighter weight.
function priceParts(l: AdCard): { main: string; suffix: string } {
  if (l.priceLabel.includes(" to "))
    return { main: l.priceLabel, suffix: "/ month" };
  if (l.priceLabel === "Free" || l.priceLabel === "Contact for price")
    return { main: l.priceLabel, suffix: "" };
  return {
    main: `Rs. ${l.price.toLocaleString("en-US")}`,
    suffix: l.priceLabel.includes("/ month") ? "/ month" : "",
  };
}

export function dropPercent(l: AdCard) {
  if (!l.originalPriceLabel) return null;
  const old = Number(l.originalPriceLabel.replace(/[^\d]/g, ""));
  if (!old || old <= l.price) return null;
  return Math.round(((old - l.price) / old) * 100);
}

function categoryIconFor(categoryId: string) {
  return categoryIcon(
    categories.find((c) => c.id === categoryId)?.icon ?? "Package",
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function StatusBadges({ listing }: { listing: AdCard }) {
  const t = useTranslations("listings");
  const pct = dropPercent(listing);
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
      {listing.premium ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[image:var(--premium-gold)] px-2.5 py-1 text-xs font-bold leading-none text-[color:var(--premium-navy-1)] shadow-sm">
          <Crown aria-hidden className="h-3 w-3" />
          {t("premiumCard.premium")}
        </span>
      ) : listing.featured ? (
        <span className="rounded-full bg-[color:var(--color-market-gold-soft)] px-2.5 py-1 text-xs font-bold leading-none text-[color:var(--color-market-gold-text)] shadow-sm ring-1 ring-[color:var(--color-market-gold-line)]">
          {t("card.featured")}
        </span>
      ) : null}
      {pct ? (
        <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold leading-none text-white shadow-sm">
          &minus;{pct}%
        </span>
      ) : listing.deal === "coupon" ? (
        <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold leading-none text-white shadow-sm">
          {t("card.couponBadge")}
        </span>
      ) : null}
    </div>
  );
}

function KindLabel({
  listing,
  className = "",
}: {
  listing: AdCard;
  className?: string;
}) {
  const t = useTranslations("listings");
  const kind = listingKind(listing);
  if (!kind) return null;
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-xs font-semibold leading-4 shadow-sm ${
        kind === "reserved"
          ? "bg-slate-900/85 text-white"
          : "bg-white text-slate-800"
      } ${className}`}
    >
      {kind === "reserved" ? t("card.reserved") : t(`card.cue.${kind}`)}
    </span>
  );
}

function PhotoCount({
  count,
  className,
}: {
  count: number;
  className: string;
}) {
  const t = useTranslations("listings");
  if (count < 2) return null;
  return (
    <span
      aria-label={t("card.photos", { count })}
      className={`flex items-center gap-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-xs font-semibold leading-4 text-white ${className}`}
    >
      <Camera aria-hidden className="h-3 w-3" />
      {count}
    </span>
  );
}

// 44px hit area, a white disc that stays visible on dark and light photos.
function SaveButton({
  listing,
  className = "",
}: {
  listing: AdCard;
  className?: string;
}) {
  const t = useTranslations("listings");
  const { saved, toggle } = useSavedAd(listing.slug);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={
        saved
          ? t("card.unsave", { title: listing.title })
          : t("card.save", { title: listing.title })
      }
      className={`group/heart z-20 flex h-11 w-11 items-center justify-center ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.25)] ring-1 ring-black/5 transition group-hover/heart:scale-105 group-hover/heart:text-rose-600">
        <Heart
          aria-hidden
          className={`h-[18px] w-[18px] ${saved ? "fill-rose-500 text-rose-500" : ""}`}
        />
      </span>
    </button>
  );
}

function PriceBlock({ listing, size }: { listing: AdCard; size: "md" | "lg" }) {
  const t = useTranslations("listings");
  const { main, suffix } = priceParts(listing);
  const pct = dropPercent(listing);
  const note = listing.negotiable
    ? t("card.negotiable")
    : listing.fixedPrice
      ? t("card.fixedPrice")
      : null;
  return (
    <div>
      <p className="flex min-w-0 items-baseline gap-x-1.5">
        <span
          className={`whitespace-nowrap font-bold leading-6 text-[color:var(--color-market-price)] ${
            size === "lg" ? "text-xl" : "text-[17px]"
          }`}
        >
          {main}
          {suffix && (
            <span className="ml-1 text-[13px] font-normal text-[color:var(--color-market-text-secondary)]">
              {suffix}
            </span>
          )}
        </span>
        {note && size === "lg" && (
          <span className="ml-auto shrink-0 whitespace-nowrap text-xs font-medium text-[color:var(--color-market-text-secondary)]">
            {note}
          </span>
        )}
      </p>
      {/* Always the same height: the old price or the offer, and on grid
          cards the Negotiable / Fixed price note (beside a long price it
          would be cut off). */}
      <p className="flex h-5 min-w-0 items-center gap-1.5 text-[13px] leading-5">
        {pct ? (
          <span className="whitespace-nowrap text-[color:var(--color-market-text-muted)] line-through">
            {listing.originalPriceLabel}
          </span>
        ) : listing.deal === "coupon" && listing.offer ? (
          <span className="min-w-0 truncate font-medium text-emerald-700 dark:text-emerald-400">
            {listing.offer}
          </span>
        ) : null}
        {note && size === "md" && (
          <span className="ml-auto shrink-0 whitespace-nowrap text-xs font-medium text-[color:var(--color-market-text-secondary)]">
            {note}
          </span>
        )}
      </p>
    </div>
  );
}

function SpecsLine({ listing }: { listing: AdCard }) {
  const Icon = categoryIconFor(listing.categoryId);
  const specs = cardSpecs(listing);
  return (
    <p className="flex h-5 min-w-0 items-center gap-1.5 text-[13px] text-[color:var(--color-market-text-secondary)]">
      <Icon
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-market-text-muted)]"
      />
      <span className="min-w-0 truncate">{specs.join(" · ")}</span>
    </p>
  );
}

function MetaLine({ listing, compact }: { listing: AdCard; compact: boolean }) {
  const t = useTranslations("listings");
  const when = isJustListed(listing)
    ? t("card.justListed")
    : compact
      ? shortAgo(listing.postedAgo)
      : listing.postedAgo;
  return (
    <p className="flex h-5 min-w-0 items-center gap-1 text-[13px] text-[color:var(--color-market-text-muted)]">
      <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 truncate">
        {listing.location} · {when}
      </span>
      {listing.urgent && (
        <span className="ml-auto shrink-0 rounded bg-red-50 px-1.5 text-xs font-semibold leading-5 text-red-700 dark:bg-red-950 dark:text-red-300">
          {t("card.urgent")}
        </span>
      )}
    </p>
  );
}

// Businesses only: logo (or initials) in a neutral ring, name, verified
// tick with what it means. Private sellers get a quiet text line instead.
function SellerLine({ listing }: { listing: AdCard }) {
  const t = useTranslations("listings");
  if (!listing.sellerName) {
    return (
      <p className="truncate text-[13px] text-[color:var(--color-market-text-muted)]">
        {listing.memberSince
          ? t("card.privateSellerSince", { year: String(listing.memberSince) })
          : t("card.privateSeller")}
      </p>
    );
  }
  const href = listing.sellerSlug
    ? `/business/${listing.sellerSlug}`
    : undefined;
  const inner = (
    <>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
        {listing.sellerLogo ? (
          <Image
            src={listing.sellerLogo}
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        ) : (
          listing.sellerName.slice(0, 2).toUpperCase()
        )}
      </span>
      <span className="truncate text-[13px] leading-5">
        {listing.sellerName}
      </span>
      {listing.sellerType === "verified" && (
        <BadgeCheck
          aria-label={t("card.verifiedTip")}
          className="h-4 w-4 shrink-0 fill-blue-600 text-white"
        >
          <title>{t("card.verifiedTip")}</title>
        </BadgeCheck>
      )}
    </>
  );
  return href ? (
    <Link
      href={href}
      className="relative z-20 flex min-w-0 items-center gap-2 text-[color:var(--color-market-text-secondary)] hover:text-blue-700"
    >
      {inner}
    </Link>
  ) : (
    <span className="flex min-w-0 items-center gap-2 text-[color:var(--color-market-text-secondary)]">
      {inner}
    </span>
  );
}

// Business ads: Call and WhatsApp. Private sellers: "Show phone" opens the
// ad's contact panel (their number sits behind the email check). Jobs:
// Apply.
function ContactButtons({
  listing,
  size,
}: {
  listing: AdCard;
  size: "sm" | "md";
}) {
  const t = useTranslations("listings");
  const h = size === "sm" ? "h-10" : "h-11";
  if (listing.categoryId === "jobs") {
    return (
      <Link
        href={detailHref(listing)}
        className={`btn-solid relative z-20 flex ${h} items-center gap-1.5 rounded-xl px-4 text-sm font-semibold`}
      >
        <Send aria-hidden className="h-4 w-4" />
        {t("card.apply")}
      </Link>
    );
  }
  const phone = listing.contactPhone;
  if (!phone) {
    return (
      <Link
        href={`${detailHref(listing)}#contact`}
        className={`btn-outline relative z-20 flex ${h} items-center gap-1.5 rounded-xl px-4 text-sm font-semibold`}
      >
        <Phone aria-hidden className="h-4 w-4" />
        {t("card.showPhone")}
      </Link>
    );
  }
  const message = encodeURIComponent(
    `Hi, I'm interested in your ${listing.title} on SLMarket.lk\n${SITE_URL}${detailHref(listing)}`,
  );
  return (
    <div className="flex items-center gap-2">
      <a
        href={`tel:+${phone}`}
        aria-label={t("card.call")}
        className={`btn-outline relative z-20 flex ${h} min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold`}
      >
        <Phone aria-hidden className="h-4 w-4" />
        <span className={size === "sm" ? "" : "hidden md:inline"}>
          {t("card.call")}
        </span>
      </a>
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("card.whatsapp")}
        className={`relative z-20 flex ${h} min-w-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-600/60 bg-[var(--color-market-surface)] px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950`}
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
        <span className={size === "sm" ? "" : "hidden md:inline"}>
          {t("card.whatsapp")}
        </span>
      </a>
    </div>
  );
}

function Photo({
  listing,
  sizes,
  priority,
}: {
  listing: AdCard;
  sizes: string;
  priority: boolean;
}) {
  return (
    <Image
      src={listing.image}
      alt={listing.title}
      fill
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR}
      style={{ objectPosition: objectPosition(listing) }}
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

const STRETCHED =
  "after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none";

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function ListingCard({
  listing,
  view = "grid",
  priority = false,
}: {
  listing: AdCard;
  view?: "grid" | "list";
  // Above-the-fold cards load their photo eagerly.
  priority?: boolean;
}) {
  const t = useTranslations("listings");
  const tier = listing.premium
    ? "premium"
    : listing.featured
      ? "featured"
      : undefined;
  const title = (
    <Link href={detailHref(listing)} className={STRETCHED}>
      {listing.title}
    </Link>
  );

  if (view === "list") {
    return (
      <article
        data-tier={tier}
        className="market-listing-card group relative p-3 md:p-4"
      >
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 md:grid-cols-[240px_minmax(0,1fr)_220px] md:gap-5">
          <div className="relative h-[90px] w-[120px] overflow-hidden rounded-xl bg-slate-100 md:h-[180px] md:w-[240px] dark:bg-slate-800">
            {hasPhoto(listing) ? (
              <Photo
                listing={listing}
                sizes="(min-width: 768px) 240px, 120px"
                priority={priority}
              />
            ) : (
              <NoPhoto listing={listing} />
            )}
            <div className="hidden md:block">
              <StatusBadges listing={listing} />
              <KindLabel
                listing={listing}
                className="absolute bottom-2 left-2"
              />
              <PhotoCount
                count={listing.photos ?? 1}
                className="absolute bottom-2 right-2"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="line-clamp-2 pr-10 text-[15px] font-semibold leading-5 text-[color:var(--color-market-text)] md:text-base">
              {title}
            </h3>
            <div className="md:hidden">
              <PriceBlock listing={listing} size="md" />
            </div>
            <SpecsLine listing={listing} />
            {listing.description && (
              <p className="hidden text-sm text-[color:var(--color-market-text-secondary)] md:line-clamp-2">
                {listing.description}
              </p>
            )}
            <MetaLine listing={listing} compact={false} />
            <div className="mt-auto hidden pt-1 md:block">
              <SellerLine listing={listing} />
            </div>
          </div>

          {/* Price and offer at the top, actions at the bottom. */}
          <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[var(--color-market-border)] pt-2 md:col-span-1 md:flex-col md:items-end md:justify-between md:border-0 md:pt-0">
            <div className="hidden w-full pr-10 md:block">
              <PriceBlock listing={listing} size="lg" />
            </div>
            <div className="min-w-0 md:hidden">
              <SellerLine listing={listing} />
            </div>
            <ContactButtons listing={listing} size="md" />
          </div>
        </div>
        <SaveButton listing={listing} className="absolute right-1 top-1" />
      </article>
    );
  }

  if (!hasPhoto(listing)) return <TextCard listing={listing} />;

  return (
    <article
      data-tier={tier}
      className="market-listing-card group relative flex h-full flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Photo
          listing={listing}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 250px"
          priority={priority}
        />
        <StatusBadges listing={listing} />
        <KindLabel
          listing={listing}
          className="absolute bottom-2 left-2 z-10 transition group-hover:opacity-0 group-focus-within:opacity-0"
        />
        <PhotoCount
          count={listing.photos ?? 1}
          className="absolute bottom-2 right-2 z-10 transition group-hover:opacity-0 group-focus-within:opacity-0"
        />
        {/* Quick contact on hover or keyboard focus (desktop). */}
        <div className="absolute inset-x-2 bottom-2 z-20 hidden translate-y-2 justify-center opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:hover)]:lg:flex">
          <ContactButtons listing={listing} size="sm" />
        </div>
        <SaveButton listing={listing} className="absolute right-0.5 top-0.5" />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 h-10 text-sm font-medium leading-5 text-[color:var(--color-market-text)]">
          {title}
        </h3>
        <div className="mt-1">
          <PriceBlock listing={listing} size="md" />
        </div>
        <div className="flex flex-col gap-0.5">
          <SpecsLine listing={listing} />
          <MetaLine listing={listing} compact />
        </div>
        {listing.sellerName ? (
          <div className="mt-auto pt-3">
            <div className="border-t border-[var(--color-market-border)] pt-2.5">
              <SellerLine listing={listing} />
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-2">
            <SellerLine listing={listing} />
          </div>
        )}
      </div>
      <span className="sr-only">{t("card.openAd")}</span>
    </article>
  );
}

// The photo slot of an ad without a photo (list view).
function NoPhoto({ listing }: { listing: AdCard }) {
  const Icon =
    listing.categoryId === "jobs"
      ? Briefcase
      : categoryIconFor(listing.categoryId);
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-market-blue-light)]">
      <Icon aria-hidden className="h-7 w-7 text-[var(--color-market-blue)]" />
    </div>
  );
}

/*
 * Grid card for an ad without a photo (most jobs): company, role, salary,
 * type and place, with no empty image box.
 */
function TextCard({ listing }: { listing: AdCard }) {
  const t = useTranslations("listings");
  const Icon =
    listing.categoryId === "jobs"
      ? Briefcase
      : categoryIconFor(listing.categoryId);
  const tier = listing.premium
    ? "premium"
    : listing.featured
      ? "featured"
      : undefined;
  return (
    <article
      data-tier={tier}
      className="market-listing-card group relative flex h-full flex-col p-3"
    >
      <div className="flex items-start gap-3 pr-10">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-market-blue-light)] text-[var(--color-market-blue)]">
          {listing.sellerLogo ? (
            <Image
              src={listing.sellerLogo}
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-contain"
            />
          ) : listing.sellerName ? (
            <span className="text-sm font-bold">
              {listing.sellerName.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <Icon aria-hidden className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-[color:var(--color-market-text-secondary)]">
            <span className="truncate">
              {listing.sellerName ?? t("card.privateSeller")}
            </span>
            {listing.sellerType === "verified" && (
              <BadgeCheck
                aria-label={t("card.verifiedTip")}
                className="h-4 w-4 shrink-0 fill-blue-600 text-white"
              >
                <title>{t("card.verifiedTip")}</title>
              </BadgeCheck>
            )}
          </p>
          <KindLabel
            listing={listing}
            className="mt-1 inline-block bg-[var(--color-market-blue-light)] shadow-none"
          />
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-5 text-[color:var(--color-market-text)]">
        <Link href={detailHref(listing)} className={STRETCHED}>
          {listing.title}
        </Link>
      </h3>
      <div className="mt-1.5">
        <PriceBlock listing={listing} size="md" />
      </div>
      <div className="flex flex-col gap-0.5">
        <SpecsLine listing={listing} />
        <MetaLine listing={listing} compact />
      </div>
      <div className="mt-auto pt-3">
        <ContactButtons listing={listing} size="sm" />
      </div>
      <SaveButton listing={listing} className="absolute right-1 top-1" />
    </article>
  );
}
