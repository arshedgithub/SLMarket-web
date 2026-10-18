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
  Tag,
  User,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/config/const/navLinks";
import { categoryIcon } from "@/config/const/categoryIcons";
import { businessHref } from "@/lib/business/slug";
import { sampleShops, type SampleListing } from "./data";
import { AVATAR_TONE } from "./avatarTone";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

// Sample data has no photo count, so derive a stable one per ad.
function photoCount(id: string) {
  const n = Number(id.replace(/\D/g, "")) || 1;
  return ((n * 7) % 17) + 4;
}

// Grid uses the compact "5h ago"; list keeps the longer "5 hours ago".
function shortAgo(s: string) {
  return s.replace(/ hours?/, "h").replace(/ days?/, "d");
}

// Full digits everywhere, never "Rs. 18.5M". Salary ranges keep their
// "from to to" label and always say "/ month".
function priceParts(l: SampleListing): { main: string; suffix: string } {
  if (l.priceLabel.includes(" to ")) {
    return { main: l.priceLabel, suffix: "/ month" };
  }
  const monthly = l.priceLabel.includes("/ month");
  return {
    main: `Rs. ${l.price.toLocaleString("en-US")}`,
    suffix: monthly ? "/ month" : "",
  };
}

export function dropPercent(l: SampleListing) {
  if (!l.originalPriceLabel) return null;
  const old = Number(l.originalPriceLabel.replace(/[^\d]/g, ""));
  if (!old || old <= l.price) return null;
  return Math.round(((old - l.price) / old) * 100);
}

type Tier = "premium" | "featured";

// One tier badge per card: Premium outranks Featured.
function tierFor(l: SampleListing): Tier | null {
  if (l.premium) return "premium";
  if (l.featured) return "featured";
  return null;
}

type Cue = "job" | "rent" | "sale";

// What kind of ad this is, where it isn't obvious from the photo.
function cueFor(l: SampleListing): Cue | null {
  if (l.categoryId === "jobs") return "job";
  if (l.categoryId === "property") {
    return l.priceLabel.includes("/ month") ? "rent" : "sale";
  }
  return null;
}

function categoryIconFor(categoryId: string) {
  const name = categories.find((c) => c.id === categoryId)?.icon ?? "Package";
  return categoryIcon(name);
}

function shopFor(listing: SampleListing) {
  return listing.sellerName
    ? sampleShops.find((s) => s.name === listing.sellerName)
    : undefined;
}

function detailHrefFor(listing: SampleListing) {
  return `/ads/${listing.categoryId}?q=${encodeURIComponent(listing.title)}`;
}

function TierBadge({ tier, className }: { tier: Tier; className: string }) {
  const t = useTranslations("listings");
  if (tier === "premium") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-[image:var(--premium-gold)] px-2.5 py-1 text-[11px] font-bold leading-none text-[color:var(--premium-navy-1)] shadow-sm ${className}`}
      >
        <Crown aria-hidden className="h-3 w-3" />
        {t("premiumCard.premium")}
      </span>
    );
  }
  return (
    <span
      className={`rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold leading-none text-amber-950 shadow-sm ${className}`}
    >
      {t("card.featured")}
    </span>
  );
}

function CueLabel({ cue, className }: { cue: Cue; className: string }) {
  const t = useTranslations("listings");
  return (
    <span
      className={`rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-slate-800 shadow-sm ${className}`}
    >
      {t(`card.cue.${cue}`)}
    </span>
  );
}

function PhotoCount({ id, className }: { id: string; className: string }) {
  return (
    <span
      className={`flex items-center gap-1 rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-white ${className}`}
    >
      <Camera aria-hidden className="h-3 w-3" />
      {photoCount(id)}
    </span>
  );
}

const isRange = (l: SampleListing) => l.priceLabel.includes(" to ");

// `rangeSuffixBelow`: grid cards move a salary range's "/ month" into the
// deal row (jobs never carry a deal) so the price stays on one line.
function PriceLine({
  listing,
  size,
  rangeSuffixBelow = false,
}: {
  listing: SampleListing;
  size: "sm" | "lg";
  rangeSuffixBelow?: boolean;
}) {
  const { main, suffix: rawSuffix } = priceParts(listing);
  const suffix = rangeSuffixBelow && isRange(listing) ? "" : rawSuffix;
  return (
    <p
      className={`flex flex-wrap items-baseline gap-x-1.5 font-bold leading-6 text-[color:var(--color-market-price)] ${
        size === "lg" ? "text-xl" : "text-base"
      }`}
    >
      <span className="whitespace-nowrap">{main}</span>
      {suffix && (
        <span className="whitespace-nowrap text-xs font-medium text-[color:var(--color-market-text-muted)]">
          {suffix}
        </span>
      )}
    </p>
  );
}

// Under the price: the one discount pattern (old price struck through plus
// a percentage chip) and/or the promo code as a small tag. `reserve` keeps
// the row's height on cards without a deal so grid cards line up.
function DealLine({
  listing,
  reserve,
}: {
  listing: SampleListing;
  reserve: boolean;
}) {
  const t = useTranslations("listings");
  const pct = dropPercent(listing);
  const promo = listing.deal === "coupon";
  if (!pct && !promo) {
    if (!reserve) return null;
    return isRange(listing) ? (
      <p className="h-5 text-xs font-medium leading-5 text-[color:var(--color-market-text-muted)]">
        {priceParts(listing).suffix}
      </p>
    ) : (
      <div aria-hidden className="h-5" />
    );
  }
  return (
    <div className="flex h-5 min-w-0 items-center gap-1.5">
      {pct && (
        <>
          <span className="whitespace-nowrap text-xs text-[color:var(--color-market-text-muted)] line-through">
            {listing.originalPriceLabel}
          </span>
          <span className="shrink-0 rounded bg-emerald-50 px-1 text-[11px] font-bold leading-4 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            &minus;{pct}%
          </span>
        </>
      )}
      {promo && (
        <span className="flex min-w-0 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[11px] font-semibold leading-4 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          <Tag aria-hidden className="h-3 w-3 shrink-0" />
          <span className="truncate">{listing.offer ?? t("card.coupon")}</span>
        </span>
      )}
    </div>
  );
}

// Attribute row: category icon in its own fixed slot, then text that is
// only ever cut off at the END (attrs are stored most important first).
function AttrLine({ listing, max }: { listing: SampleListing; max: number }) {
  const Icon = categoryIconFor(listing.categoryId);
  return (
    <p className="flex h-5 min-w-0 items-center gap-1.5 text-[13px] text-[color:var(--color-market-text-secondary)]">
      <Icon aria-hidden className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="min-w-0 flex-1 truncate">
        {listing.attrs
          .filter((a) => a.toLowerCase() !== listing.location.toLowerCase())
          .slice(0, max)
          .join(" · ")}
      </span>
    </p>
  );
}

// Location row, with the Negotiable chip on the right where it applies.
function MetaLine({ listing, text }: { listing: SampleListing; text: string }) {
  const t = useTranslations("listings");
  return (
    <p className="flex h-5 min-w-0 items-center gap-1 text-xs text-[color:var(--color-market-text-muted)]">
      <MapPin aria-hidden className="h-3 w-3 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{text}</span>
      {listing.negotiable && (
        <span className="shrink-0 rounded bg-slate-100 px-1.5 text-[11px] font-medium leading-4 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {t("card.negotiable")}
        </span>
      )}
    </p>
  );
}

function SellerLine({ listing }: { listing: SampleListing }) {
  const t = useTranslations("listings");
  if (listing.sellerName) {
    return (
      <Link
        href={businessHref(listing.sellerName)}
        className="relative z-10 flex min-w-0 items-center gap-2 text-[color:var(--color-market-text-muted)] hover:text-blue-600"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${AVATAR_TONE}`}
        >
          {listing.sellerName.slice(0, 2).toUpperCase()}
        </span>
        {/* Sized on the span: the global `a { font: inherit }` reset in
            globals.css is unlayered and overrides size utilities on links. */}
        <span className="truncate text-[13px] leading-5">
          {listing.sellerName}
        </span>
        <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
      </Link>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2 text-[13px] leading-5 text-[color:var(--color-market-text-muted)]">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${AVATAR_TONE}`}
      >
        <User aria-hidden className="h-4 w-4" />
      </span>
      <span className="truncate">{t("card.individual")}</span>
    </span>
  );
}

// 44px hit area; the dark translucent disc stays visible on white photos.
function HeartButton({ className = "" }: { className?: string }) {
  const t = useTranslations("listings");
  return (
    <button
      type="button"
      aria-label={t("card.saveListing")}
      className={`group/heart z-10 flex h-11 w-11 items-center justify-center ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/45 text-white shadow-sm backdrop-blur-sm transition group-hover/heart:bg-slate-900/60 group-hover/heart:text-rose-300">
        <Heart className="h-4 w-4" />
      </span>
    </button>
  );
}

// Jobs have no photo: a tinted header with a briefcase keeps the card's
// top edge defined (the company name is already in the seller row).
function JobHeader({ iconClass }: { iconClass: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-market-blue-light)] dark:bg-[#132038]">
      <span className="flex items-center justify-center rounded-2xl bg-white p-3 text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
        <Briefcase aria-hidden className={iconClass} />
      </span>
    </div>
  );
}

// Business ads get direct contact (that's what they pay for); private
// sellers keep contact on the ad page. Jobs get a single Apply action.
function ContactActions({ listing }: { listing: SampleListing }) {
  const t = useTranslations("listings");
  const shop = shopFor(listing);
  if (!shop) return null;

  if (listing.categoryId === "jobs") {
    return (
      <Link
        href={detailHrefFor(listing)}
        className="btn-solid relative z-10 flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold"
      >
        <Send className="h-4 w-4" />
        {t("card.apply")}
      </Link>
    );
  }

  const message = encodeURIComponent(
    `Hi, I'm interested in your ${listing.title} on SLMarket.lk\n${SITE_URL}${detailHrefFor(listing)}`,
  );
  return (
    <div className="flex items-center gap-2">
      <a
        href={`tel:+${shop.phone}`}
        aria-label={t("card.call")}
        className="btn-outline relative z-10 flex h-11 w-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold md:h-10 md:w-auto md:px-4"
      >
        <Phone className="h-4 w-4" />
        <span className="hidden md:inline">{t("card.call")}</span>
      </a>
      <a
        href={`https://wa.me/${shop.phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("card.whatsapp")}
        className="relative z-10 flex h-11 w-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/60 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-950 md:h-10 md:w-auto md:px-4"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden md:inline">{t("card.whatsapp")}</span>
      </a>
    </div>
  );
}

export function ListingCard({
  listing,
  view = "grid",
}: {
  listing: SampleListing;
  view?: "grid" | "list";
}) {
  const detailHref = detailHrefFor(listing);
  const stretched =
    "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
  const isJob = listing.categoryId === "jobs";
  const tier = tierFor(listing);
  const cue = cueFor(listing);

  if (view === "list") {
    return (
      <article
        data-tier={tier ?? undefined}
        className="market-listing-card group relative overflow-hidden p-3 md:p-4"
      >
        <div
          className={`grid gap-3 md:gap-5 ${
            isJob
              ? "grid-cols-[56px_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)_240px]"
              : "grid-cols-[120px_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)_240px]"
          }`}
        >
          <div
            className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ${
              isJob
                ? "h-14 w-14 md:h-[180px] md:w-[240px]"
                : "h-[90px] w-[120px] md:h-[180px] md:w-[240px]"
            }`}
          >
            {isJob ? (
              <JobHeader iconClass="h-5 w-5 md:h-8 md:w-8" />
            ) : (
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                sizes="(min-width: 768px) 240px, 120px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            )}
            {tier && (
              <TierBadge
                tier={tier}
                className="absolute left-1.5 top-1.5 hidden md:inline-flex"
              />
            )}
            {!isJob && (
              <PhotoCount
                id={listing.id}
                className="absolute bottom-1.5 left-1.5"
              />
            )}
            {cue && (
              <CueLabel
                cue={cue}
                className="absolute bottom-1.5 right-1.5 hidden md:block"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            {tier && <TierBadge tier={tier} className="self-start md:hidden" />}
            <h3 className="line-clamp-2 pr-10 text-[15px] font-semibold leading-5 text-[color:var(--color-market-text)] md:text-base">
              <Link href={detailHref} className={stretched}>
                {listing.title}
              </Link>
            </h3>
            <div className="md:hidden">
              <PriceLine listing={listing} size="sm" />
              <DealLine listing={listing} reserve={false} />
            </div>
            <AttrLine listing={listing} max={3} />
            {listing.description && (
              <p className="hidden line-clamp-2 text-sm text-[color:var(--color-market-text-secondary)] md:block">
                {listing.description}
              </p>
            )}
            <MetaLine
              listing={listing}
              text={`${listing.location} · ${listing.postedAgo}`}
            />
          </div>

          <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[var(--color-market-border)] pt-2 md:col-span-1 md:flex-col md:items-end md:justify-between md:border-0 md:pt-0">
            <div className="hidden flex-col items-end text-right md:flex md:pr-10">
              <PriceLine listing={listing} size="lg" />
              <DealLine listing={listing} reserve={false} />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 md:flex-none md:flex-col md:items-end md:gap-2">
              <SellerLine listing={listing} />
              <ContactActions listing={listing} />
            </div>
          </div>
        </div>
        <HeartButton className="absolute right-1 top-1" />
      </article>
    );
  }

  return (
    <article
      data-tier={tier ?? undefined}
      className="market-listing-card group relative flex h-full flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--color-market-border)] bg-slate-100 dark:bg-slate-800">
        {isJob ? (
          <JobHeader iconClass="h-7 w-7" />
        ) : (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {tier && (
          <TierBadge tier={tier} className="absolute left-2.5 top-2.5" />
        )}
        {!isJob && (
          <PhotoCount id={listing.id} className="absolute bottom-2 left-2" />
        )}
        {cue && <CueLabel cue={cue} className="absolute bottom-2 right-2" />}
        <HeartButton className="absolute right-1 top-1" />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 h-10 text-[15px] font-semibold leading-5 text-[color:var(--color-market-text)]">
          <Link href={detailHref} className={stretched}>
            {listing.title}
          </Link>
        </h3>
        <div className="mt-1.5">
          <PriceLine listing={listing} size="sm" rangeSuffixBelow />
          <DealLine listing={listing} reserve />
        </div>
        <div className="mt-1.5 flex flex-col gap-0.5">
          <AttrLine listing={listing} max={3} />
          <MetaLine
            listing={listing}
            text={`${listing.location} · ${shortAgo(listing.postedAgo)}`}
          />
        </div>
        <div className="mt-auto pt-3">
          <div className="border-t border-[var(--color-market-border)] pt-2.5">
            <SellerLine listing={listing} />
          </div>
        </div>
      </div>
    </article>
  );
}
