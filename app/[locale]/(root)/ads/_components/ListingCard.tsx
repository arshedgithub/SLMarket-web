"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Briefcase,
  Camera,
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
import { sampleShops, type SampleListing } from "./data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

const LOGO_COLORS = [
  "bg-[#0c1f5e]",
  "bg-blue-600",
  "bg-[#1557d6]",
  "bg-pink-600",
  "bg-[#0b5bd3]",
];

export function logoColorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

// Sample data has no photo count, so derive a stable one per ad.
function photoCount(id: string) {
  const n = Number(id.replace(/\D/g, "")) || 1;
  return ((n * 7) % 17) + 4;
}

// Grid uses the compact "5h ago"; list keeps the longer "5 hours ago".
function shortAgo(s: string) {
  return s.replace(/ hours?/, "h").replace(/ days?/, "d");
}

// Full digits everywhere — never "Rs. 18.5M". Salary ranges use an en
// dash and always say "/ month".
function priceParts(l: SampleListing): { main: string; suffix: string } {
  if (l.priceLabel.includes(" to ")) {
    return {
      main: l.priceLabel.replace(" to ", " \u2013 "),
      suffix: "/ month",
    };
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

function PriceLine({
  listing,
  size,
}: {
  listing: SampleListing;
  size: "sm" | "lg";
}) {
  const t = useTranslations("listings");
  const pct = dropPercent(listing);
  return (
    <p
      className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-0 font-bold text-[#1557d6] ${
        size === "lg" ? "text-xl" : "text-base"
      }`}
    >
      <span className="whitespace-nowrap">{priceParts(listing).main}</span>
      {priceParts(listing).suffix && (
        <span className="whitespace-nowrap text-xs font-medium text-[var(--color-market-text-muted)]">
          {priceParts(listing).suffix}
        </span>
      )}
      {listing.originalPriceLabel && (
        <span className="text-xs font-medium text-[var(--color-market-text-muted)] line-through">
          {listing.originalPriceLabel}
        </span>
      )}
      {pct && (
        <span className="text-xs font-bold text-emerald-600">
          &minus;{pct}%
        </span>
      )}
      {listing.negotiable && (
        <span className="text-xs font-medium text-[var(--color-market-text-muted)]">
          {t("card.negotiable")}
        </span>
      )}
    </p>
  );
}

// Attribute line: category icon in its own fixed slot, then text that is
// only ever cut off at the END (most important attribute first).
function AttrLine({ listing, max }: { listing: SampleListing; max: number }) {
  const Icon = categoryIconFor(listing.categoryId);
  return (
    <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--color-market-text-secondary)]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
      <span className="min-w-0 flex-1 truncate">
        {listing.attrs
          .filter((a) => a.toLowerCase() !== listing.location.toLowerCase())
          .slice(0, max)
          .join(" · ")}
      </span>
    </p>
  );
}

function OfferLine({ listing }: { listing: SampleListing }) {
  const t = useTranslations("listings");
  if (listing.deal !== "coupon") return null;
  return (
    <p className="flex min-w-0 items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <Tag className="h-3 w-3 shrink-0" />
      <span className="truncate">{listing.offer ?? t("card.coupon")}</span>
    </p>
  );
}

function MetaLine({ text }: { text: string }) {
  return (
    <p className="flex min-w-0 items-center gap-1 text-xs text-[var(--color-market-text-muted)]">
      <MapPin className="h-3 w-3 shrink-0" />
      <span className="truncate">{text}</span>
    </p>
  );
}

function SellerLine({ listing }: { listing: SampleListing }) {
  const t = useTranslations("listings");
  if (listing.sellerName) {
    return (
      <Link
        href="/businesses"
        className="relative z-10 flex min-w-0 items-center gap-2 text-[13px] font-medium leading-5 text-[var(--color-market-text)] hover:text-blue-600"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${logoColorFor(listing.sellerName)}`}
        >
          {listing.sellerName.slice(0, 2).toUpperCase()}
        </span>
        <span className="truncate">{listing.sellerName}</span>
        <BadgeCheck className="h-4 w-4 shrink-0 fill-blue-600 text-white" />
      </Link>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2 text-[13px] text-[var(--color-market-text-secondary)]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700">
        <User className="h-4 w-4" />
      </span>
      <span className="truncate">{t("card.individual")}</span>
    </span>
  );
}

function HeartButton({ className = "" }: { className?: string }) {
  const t = useTranslations("listings");
  return (
    <button
      type="button"
      aria-label={t("card.saveListing")}
      className={`z-10 flex h-11 w-11 items-center justify-center text-slate-500 transition hover:text-rose-500 ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm dark:bg-slate-900/90">
        <Heart className="h-4 w-4" />
      </span>
    </button>
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
  const t = useTranslations("listings");
  const detailHref = detailHrefFor(listing);
  const stretched =
    "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
  const isJob = listing.categoryId === "jobs";

  if (view === "list") {
    return (
      <article className="market-listing-card group relative overflow-hidden p-3 md:p-4">
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
              <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-500 dark:bg-blue-950">
                <Briefcase className="h-6 w-6 md:h-10 md:w-10" />
              </div>
            ) : (
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                sizes="(min-width: 768px) 240px, 120px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            )}
            {listing.featured && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {t("card.featured")}
              </span>
            )}
            {!isJob && (
              <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                <Camera className="h-3 w-3" />
                {photoCount(listing.id)}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate pr-10 text-[15px] font-semibold text-[var(--color-market-text)] md:text-base">
              <Link href={detailHref} className={stretched}>
                {listing.title}
              </Link>
            </h3>
            <div className="md:hidden">
              <PriceLine listing={listing} size="sm" />
            </div>
            <AttrLine listing={listing} max={3} />
            <OfferLine listing={listing} />
            {listing.description && (
              <p className="hidden line-clamp-2 text-sm text-[var(--color-market-text-secondary)] md:block">
                {listing.description}
              </p>
            )}
            <MetaLine text={`${listing.location} · ${listing.postedAgo}`} />
          </div>

          <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[var(--color-market-border)] pt-2 md:col-span-1 md:flex-col md:items-end md:justify-between md:border-0 md:pt-0">
            <div className="hidden text-right md:block md:pr-10">
              <PriceLine listing={listing} size="lg" />
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
    <article className="market-listing-card group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {isJob ? (
          <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-950">
            {listing.sellerName ? (
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white ${logoColorFor(listing.sellerName)}`}
              >
                {listing.sellerName.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-500 dark:bg-blue-900">
                <Briefcase className="h-7 w-7" />
              </span>
            )}
          </div>
        ) : (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {listing.featured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            {t("card.featured")}
          </span>
        )}
        {!isJob && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            <Camera className="h-3 w-3" />
            {photoCount(listing.id)}
          </span>
        )}
        <HeartButton className="absolute right-1 top-1" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate text-[15px] font-semibold text-[var(--color-market-text)]">
          <Link href={detailHref} className={stretched}>
            {listing.title}
          </Link>
        </h3>
        <PriceLine listing={listing} size="sm" />
        <OfferLine listing={listing} />
        <AttrLine listing={listing} max={3} />
        <MetaLine
          text={`${listing.location} · ${shortAgo(listing.postedAgo)}`}
        />
        <div className="mt-auto pt-2">
          <SellerLine listing={listing} />
        </div>
      </div>
    </article>
  );
}
