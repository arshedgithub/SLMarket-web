"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  ExternalLink,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Spotlight } from "@/lib/spotlight/types";
import { useSpotlightTracking } from "./useSpotlights";

/*
 * A spotlight slot, in the grid (2 columns on laptop and desktop, a full-row
 * banner below that) or in the list view (a full-width row in the same
 * rhythm as ad rows). Every slot says "Sponsored", and the one link is the
 * call to action, stretched over the whole card.
 */

type Layout = "grid" | "list";

const STRETCH = "after:absolute after:inset-0 after:z-10 after:content-['']";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function SpotlightCard({
  spot,
  layout,
}: {
  spot: Spotlight;
  layout: Layout;
}) {
  const tracking = useSpotlightTracking(spot);
  return spot.kind === "business" && spot.business ? (
    <BusinessSpot spot={spot} layout={layout} tracking={tracking} />
  ) : (
    <ImageSpot spot={spot} layout={layout} tracking={tracking} />
  );
}

type Tracking = ReturnType<typeof useSpotlightTracking>;

function SponsoredPill({ className = "" }: { className?: string }) {
  const t = useTranslations("listings.spotlight");
  return (
    <span
      className={`z-20 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ${className}`}
    >
      {t("sponsored")}
    </span>
  );
}

// The one real link of a slot. External links open in a new tab, say so,
// and carry rel="sponsored".
function SpotLink({
  spot,
  onClick,
  className,
  children,
  label,
}: {
  spot: Spotlight;
  onClick: () => void;
  className: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const t = useTranslations("listings.spotlight");
  if (spot.external) {
    return (
      <a
        href={spot.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={onClick}
        aria-label={label}
        className={className}
      >
        {children}
        {children && <span className="sr-only"> ({t("opensNewTab")})</span>}
      </a>
    );
  }
  return (
    <Link
      href={spot.href}
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Admin image campaign                                                */
/* ------------------------------------------------------------------ */

function ImageSpot({
  spot,
  layout,
  tracking,
}: {
  spot: Spotlight;
  layout: Layout;
  tracking: Tracking;
}) {
  const image = spot.image!;
  const list = layout === "list";
  const alt = spot.imageOnly ? (spot.altText ?? "") : "";
  const imgCls =
    "object-cover transition-transform duration-500 group-hover:scale-[1.03]";

  return (
    <article
      ref={tracking.ref as React.RefObject<HTMLElement>}
      className={`spotlight-slot group relative isolate col-span-full overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-[color:var(--color-market-gold-line)] dark:bg-slate-800 ${
        list
          ? "aspect-[2/1] md:aspect-auto md:h-[196px]"
          : "aspect-[2/1] lg:col-span-2 lg:aspect-auto lg:h-full lg:min-h-[300px]"
      }`}
    >
      {/* The wide crop below the breakpoint, the grid or list crop above. */}
      <Image
        src={image.wide}
        alt={alt}
        fill
        unoptimized
        sizes="100vw"
        style={{ objectPosition: image.position }}
        className={`-z-10 ${imgCls} ${list ? "md:hidden" : "lg:hidden"}`}
      />
      <Image
        src={list ? image.list : image.grid}
        alt={alt}
        fill
        unoptimized
        sizes={list ? "1000px" : "520px"}
        style={{ objectPosition: image.position }}
        className={`-z-10 hidden ${imgCls} ${list ? "md:block" : "lg:block"}`}
      />

      <SponsoredPill className="absolute left-3 top-3" />
      {spot.logo && (
        <span className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm">
          <Image
            src={spot.logo}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-9 w-9 object-contain"
          />
        </span>
      )}

      {spot.imageOnly ? (
        <SpotLink
          spot={spot}
          onClick={tracking.onClick}
          label={spot.altText ?? undefined}
          className={`absolute inset-0 z-10 rounded-2xl ${FOCUS} focus-visible:outline-blue-600`}
        />
      ) : (
        <>
          {/* Scrim: white text stays readable on any photo. */}
          <div
            aria-hidden
            className={`absolute inset-0 -z-[5] ${
              list
                ? "bg-gradient-to-t from-black/75 via-black/35 to-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/40 md:to-transparent"
                : "bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_30%,transparent_55%)]"
            }`}
          />
          <div
            className={`absolute inset-x-0 bottom-0 flex gap-3 p-4 sm:p-5 ${
              list
                ? "flex-col md:inset-y-0 md:flex-row md:items-center md:justify-between md:pr-6"
                : "flex-col"
            }`}
          >
            <div className="max-w-[34rem] text-white">
              {spot.headline && (
                <h3 className="font-heading text-lg font-bold leading-tight sm:text-xl">
                  {spot.headline}
                </h3>
              )}
              {spot.subline && (
                <p className="mt-1 text-sm text-white/90">{spot.subline}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1">
              <SpotLink
                spot={spot}
                onClick={tracking.onClick}
                className={`inline-flex h-11 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 ${STRETCH} ${FOCUS} focus-visible:outline-white`}
              >
                {spot.ctaLabel}
                {spot.external ? (
                  <ExternalLink aria-hidden className="h-4 w-4" />
                ) : (
                  <ArrowRight aria-hidden className="h-4 w-4" />
                )}
              </SpotLink>
              {spot.domain && (
                <span className="text-xs text-white/85">{spot.domain}</span>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Premium business                                                    */
/* ------------------------------------------------------------------ */

function Logo({
  name,
  logo,
  className,
}: {
  name: string;
  logo: string | null;
  className: string;
}) {
  return (
    <span
      className={`flex items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-slate-900 ${className}`}
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={56}
          height={56}
          unoptimized
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function BusinessHeader({ spot }: { spot: Spotlight }) {
  const t = useTranslations("listings");
  const b = spot.business!;
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <h3 className="truncate text-base font-bold text-[color:var(--color-market-text)]">
          {b.name}
        </h3>
        {b.verified && (
          <BadgeCheck
            aria-label={t("card.verifiedTip")}
            className="h-4 w-4 shrink-0 fill-blue-600 text-white"
          >
            <title>{t("card.verifiedTip")}</title>
          </BadgeCheck>
        )}
        {b.premium && <PremiumPill />}
      </div>
      <p className="mt-0.5 truncate text-[13px] text-[color:var(--color-market-text-secondary)]">
        {b.category}
        {b.city ? ` · ${b.city}` : ""}
      </p>
      {b.tagline && (
        <p className="mt-1 line-clamp-2 text-sm text-[color:var(--color-market-text-secondary)]">
          {b.tagline}
        </p>
      )}
    </div>
  );
}

export function PremiumPill() {
  const t = useTranslations("listings");
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-market-gold-soft)] px-2 py-0.5 text-xs font-bold text-[color:var(--color-market-gold-text)]">
      <Crown aria-hidden className="h-3 w-3" />
      {t("premiumCard.premium")}
    </span>
  );
}

function Thumbs({ spot }: { spot: Spotlight }) {
  const b = spot.business!;
  if (b.thumbs.length === 0) return null;
  return (
    <ul className="flex items-center gap-1.5" aria-hidden>
      {b.thumbs.map((t) => (
        <li
          key={t.slug}
          className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <Image
            src={t.image}
            alt=""
            fill
            unoptimized
            sizes="48px"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

function BusinessSpot({
  spot,
  layout,
  tracking,
}: {
  spot: Spotlight;
  layout: Layout;
  tracking: Tracking;
}) {
  const t = useTranslations("listings");
  const b = spot.business!;
  const cover = spot.image?.wide ?? b.cover;
  const visit = (
    <SpotLink
      spot={spot}
      onClick={tracking.onClick}
      className={`relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-market-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-market-blue-dark)] ${STRETCH} ${FOCUS} focus-visible:outline-blue-600`}
    >
      {spot.ctaLabel || t("spotlight.visitShop")}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </SpotLink>
  );

  if (layout === "list") {
    const message = encodeURIComponent(
      `Hi ${b.name}, I found you on SLMarket.lk`,
    );
    return (
      <article
        ref={tracking.ref as React.RefObject<HTMLElement>}
        className="spotlight-slot group relative col-span-full flex gap-3 rounded-2xl border border-[color:var(--color-market-gold-line)] bg-[color:var(--color-market-gold-tint)] p-3 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,33,63,0.12)] md:gap-5 md:p-4"
      >
        <div className="relative h-[90px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-slate-200 md:h-[150px] md:w-[220px] dark:bg-slate-800">
          {cover && (
            <Image
              src={cover}
              alt=""
              fill
              unoptimized
              sizes="220px"
              className="object-cover"
            />
          )}
          <Logo
            name={b.name}
            logo={b.logo}
            className="absolute bottom-2 left-2 h-10 w-10 md:h-12 md:w-12"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <BusinessHeader spot={spot} />
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-black/5">
              {t("spotlight.sponsored")}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Thumbs spot={spot} />
              <span className="text-[13px] font-medium text-[color:var(--color-market-text-secondary)]">
                {t("card.adsCount", { count: b.adsCount })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {b.phone && (
                <>
                  <a
                    href={`tel:+${b.phone}`}
                    aria-label={t("card.call")}
                    className="btn-outline relative z-20 flex h-11 w-11 items-center justify-center rounded-xl md:w-auto md:gap-1.5 md:px-3 md:text-sm md:font-semibold"
                  >
                    <Phone aria-hidden className="h-4 w-4" />
                    <span className="hidden md:inline">{t("card.call")}</span>
                  </a>
                  <a
                    href={`https://wa.me/${b.phone}?text=${message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("card.whatsapp")}
                    className="relative z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-600/60 text-emerald-700 transition hover:bg-emerald-50 md:w-auto md:gap-1.5 md:px-3 md:text-sm md:font-semibold dark:text-emerald-300 dark:hover:bg-emerald-950"
                  >
                    <MessageCircle aria-hidden className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {t("card.whatsapp")}
                    </span>
                  </a>
                </>
              )}
              {visit}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid: a full-row banner below laptop width, two columns above.
  return (
    <article
      ref={tracking.ref as React.RefObject<HTMLElement>}
      className="spotlight-slot group relative col-span-full flex flex-col overflow-hidden rounded-2xl border border-[color:var(--color-market-gold-line)] bg-[var(--color-market-surface)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,33,63,0.12)] sm:flex-row lg:col-span-2 lg:h-full lg:flex-col"
    >
      <SponsoredPill className="absolute left-3 top-3" />
      <div className="relative aspect-[16/7] shrink-0 bg-slate-200 sm:aspect-auto sm:w-2/5 lg:h-36 lg:w-full dark:bg-slate-800">
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <Logo
          name={b.name}
          logo={b.logo}
          className="absolute -bottom-6 left-4 h-14 w-14 sm:bottom-3 lg:-bottom-6"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4 pt-8 sm:pt-4 lg:pt-8">
        <BusinessHeader spot={spot} />
        <div className="flex items-center justify-between gap-3">
          <Thumbs spot={spot} />
          {visit}
        </div>
      </div>
    </article>
  );
}
