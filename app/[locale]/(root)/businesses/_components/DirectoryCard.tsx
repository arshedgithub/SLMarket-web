"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  X,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { DirectoryResult } from "@/lib/business/directory/query";
import { CLOSING_SOON_MINUTES } from "@/lib/business/directory/query";
import type {
  DirectoryBusiness,
  DirectoryItem,
} from "@/lib/business/directory/types";
import { labelForSurface, responseLabelFor } from "@/lib/business/responseTime";
import { nextChange, whatsappHref } from "@/lib/business/storefront";
import { trackBusinessEvent, useImpression } from "./analytics";
import { HIGHLIGHT_ICONS } from "./highlightIcons";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";
const rs = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

export type CardVariant = "grid" | "list" | "side" | "popup";

const cropStyle = (crop?: { x: number; y: number; zoom: number }) =>
  crop
    ? {
        objectPosition: `${crop.x}% ${crop.y}%`,
        transformOrigin: `${crop.x}% ${crop.y}%`,
        transform: `scale(${crop.zoom})`,
      }
    : undefined;

// What the three tiles show: the items that matched the search, else the
// business's pinned showcase, else its newest. Distinct photos only; fewer
// than three is fine, a repeated image never is.
export function tilesFor(
  b: DirectoryBusiness,
  matched: DirectoryItem[],
): DirectoryItem[] {
  const ordered = [
    ...matched,
    ...b.items.filter((i) => i.pinned),
    ...[...b.items].sort((x, y) => x.addedDaysAgo - y.addedDaysAgo),
  ];
  const seenImage = new Set<string>();
  const seenId = new Set<string>();
  const out: DirectoryItem[] = [];
  for (const item of ordered) {
    const photo = `${item.image}|${item.crop?.x}|${item.crop?.y}|${item.crop?.zoom}`;
    if (seenId.has(item.id) || seenImage.has(photo)) continue;
    seenId.add(item.id);
    seenImage.add(photo);
    out.push(item);
    if (out.length === 3) break;
  }
  return out;
}

function useSaved(slug: string) {
  const key = `slm:follow:${slug}`;
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      setSaved(localStorage.getItem(key) === "1");
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  const toggle = () =>
    setSaved((s) => {
      const next = !s;
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (next) trackBusinessEvent("follow", { slug });
      return next;
    });
  return { saved, toggle };
}

export function BizLogo({
  b,
  className,
}: {
  b: DirectoryBusiness;
  className: string;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white ring-4 ring-white dark:ring-[#111d30] ${className}`}
      style={{ backgroundColor: b.brandColor }}
    >
      {b.logo ? (
        <Image src={b.logo} alt="" fill sizes="64px" className="object-cover" />
      ) : (
        b.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      )}
    </span>
  );
}

function MetaLine({
  b,
  now,
  distanceKm,
}: {
  b: DirectoryBusiness;
  now: Date | null;
  distanceKm: number | null;
}) {
  const t = useTranslations("businesses");
  const change = now ? nextChange(b, now) : null;
  const closingSoon =
    change?.open &&
    change.remainingMinutes !== undefined &&
    change.remainingMinutes <= CLOSING_SOON_MINUTES;
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[12.5px] leading-[16px] text-[var(--color-market-text-secondary)]">
      {b.rating.count > 0 ? (
        <span className="flex items-center gap-1 font-bold text-[var(--color-market-text)]">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {b.rating.average.toFixed(1)}
          <span className="font-medium text-[var(--color-market-text-muted)]">
            ({b.rating.count})
          </span>
        </span>
      ) : (
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {t("directory.newBadge")}
        </span>
      )}
      {change && (
        <>
          <span aria-hidden>&middot;</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              change.open
                ? closingSoon
                  ? "text-amber-600"
                  : "text-emerald-600"
                : "text-[var(--color-market-text-muted)]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${change.open ? (closingSoon ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-400"}`}
            />
            {change.open
              ? closingSoon
                ? t("directory.closingSoon", {
                    minutes: change.remainingMinutes ?? 0,
                  })
                : t("directory.openNow")
              : t("directory.closed")}
          </span>
        </>
      )}
      {distanceKm !== null && (
        <>
          <span aria-hidden>&middot;</span>
          <span>
            {t("directory.km", {
              km:
                distanceKm < 10
                  ? distanceKm.toFixed(1)
                  : Math.round(distanceKm),
            })}
          </span>
        </>
      )}
    </p>
  );
}

function Chips({ b }: { b: DirectoryBusiness }) {
  const t = useTranslations("businesses");
  const tl = useTranslations("listings");
  const chips: { key: string; label: string; Icon: typeof ShieldCheck }[] = [];
  if (b.authorisedBrands.length > 0) {
    chips.push({
      key: "auth",
      Icon: ShieldCheck,
      label: t("directory.authorised", { brand: b.authorisedBrands[0] }),
    });
  }
  for (const h of b.highlights) {
    if (chips.length >= 2) break;
    chips.push({
      key: h,
      Icon: HIGHLIGHT_ICONS[h],
      label: tl(`business.highlights.${h}`),
    });
  }
  if (chips.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-1.5">
      {chips.map(({ key, Icon, label }) => (
        <li
          key={key}
          title={label}
          className="flex h-7 min-w-0 items-center gap-1 rounded-lg border border-[var(--color-market-border)] bg-[var(--color-market-surface-soft)] px-1.5 text-xs font-medium text-[var(--color-market-text-secondary)]"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span className="truncate">{label}</span>
        </li>
      ))}
    </ul>
  );
}

function ResponseLine({
  b,
  withCount = false,
}: {
  b: DirectoryBusiness;
  withCount?: boolean;
}) {
  const tl = useTranslations("listings");
  const t = useTranslations("businesses");
  // Only earned labels, and only the two fast ones on directory cards.
  const label = labelForSurface(responseLabelFor(b.response), "sponsored");
  if (!label && !withCount) return null;
  return (
    <p className="flex items-center justify-between gap-2 text-xs font-medium text-[var(--color-market-text-secondary)]">
      {label ? (
        <span
          className="flex min-w-0 items-center gap-1"
          title={tl("business.responseTooltip")}
        >
          <Zap className="h-3 w-3 shrink-0 text-blue-600" />
          <span className="truncate">{tl(`business.response.${label}`)}</span>
        </span>
      ) : (
        <span />
      )}
      {withCount && (
        <span className="shrink-0 font-normal text-[var(--color-market-text-muted)]">
          {t(`directory.count.${b.itemsKind}`, { count: b.itemCount })}
        </span>
      )}
    </p>
  );
}

function Tiles({
  b,
  matched,
  size,
}: {
  b: DirectoryBusiness;
  matched: DirectoryItem[];
  size: "sm" | "md" | "side";
}) {
  const tiles = tilesFor(b, matched);
  if (tiles.length === 0) return null;
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}
    >
      {tiles.map((item) => (
        <div key={item.id} className="min-w-0">
          <span
            className={`relative block overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 ${
              size === "sm"
                ? "aspect-[4/3]"
                : size === "md"
                  ? "aspect-[5/4]"
                  : "h-14"
            }`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="120px"
              className="object-cover"
              style={cropStyle(item.crop)}
            />
          </span>
          <span className="mt-1 block truncate text-[13px] font-bold tracking-tight text-[#1557d6]">
            {rs(item.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Footer({
  b,
  variant,
  source,
}: {
  b: DirectoryBusiness;
  variant: CardVariant;
  source: string;
}) {
  const t = useTranslations("businesses");
  const icon =
    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition";

  // Narrow map list: the action stack beside the tiles.
  if (variant === "side") {
    const small =
      "relative z-10 flex h-8 flex-1 items-center justify-center rounded-lg border transition";
    return (
      <>
        <span className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#1557d6] px-2 text-[13px] font-semibold text-white">
          <span className="truncate">{t("directory.viewBusiness")}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </span>
        <div className="flex gap-1.5">
          <a
            href={whatsappHref(b, SITE_URL)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("directory.whatsapp")}: ${b.name}`}
            onClick={() =>
              trackBusinessEvent("whatsapp_click", { slug: b.slug, source })
            }
            className={`${small} border-emerald-500/60 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950`}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={`tel:+${b.phone}`}
            aria-label={`${t("directory.call")}: ${b.name}`}
            onClick={() =>
              trackBusinessEvent("call_click", { slug: b.slug, source })
            }
            className={`${small} border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950`}
          >
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${variant === "list" ? "" : "mt-auto pt-1"}`}
    >
      <span className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1557d6] px-3 text-[13px] font-semibold text-white">
        <span className="truncate">{t("directory.viewBusiness")}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </span>
      <a
        href={whatsappHref(b, SITE_URL)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t("directory.whatsapp")}: ${b.name}`}
        onClick={() =>
          trackBusinessEvent("whatsapp_click", { slug: b.slug, source })
        }
        className={`${icon} border-emerald-500/60 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950`}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <a
        href={`tel:+${b.phone}`}
        aria-label={`${t("directory.call")}: ${b.name}`}
        onClick={() =>
          trackBusinessEvent("call_click", { slug: b.slug, source })
        }
        className={`${icon} border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950`}
      >
        <Phone className="h-4 w-4" />
      </a>
    </div>
  );
}

export function DirectoryCard({
  result,
  variant,
  sponsored = false,
  now,
  source,
  position,
  selected = false,
  onHover,
  onClose,
}: {
  result: DirectoryResult;
  variant: CardVariant;
  sponsored?: boolean;
  now: Date | null;
  source: string;
  position: number;
  selected?: boolean;
  onHover?: (id: string | null) => void;
  // Map popup: one close button, in place of the heart.
  onClose?: () => void;
}) {
  const t = useTranslations("businesses");
  const { business: b } = result;
  const ref = useRef<HTMLElement | null>(null);
  const { saved, toggle } = useSaved(b.slug);
  useImpression(ref, `${b.id}|${source}`, {
    slug: b.slug,
    position,
    sponsored,
    source,
  });

  const stretched = "after:absolute after:inset-0 after:content-['']";
  const nameLink = (
    <p className="flex items-center gap-1 text-[16px] font-bold leading-[19px] tracking-tight text-[var(--color-market-text)]">
      <Link
        href={`/business/${b.slug}`}
        onClick={() =>
          trackBusinessEvent("business_card_click", {
            slug: b.slug,
            position,
            sponsored,
            source,
          })
        }
        className={`truncate ${stretched}`}
      >
        {b.name}
      </Link>
      {b.verifiedLevel >= 2 && (
        <BadgeCheck
          aria-hidden
          className="h-4 w-4 shrink-0 fill-blue-600 text-white"
        />
      )}
    </p>
  );

  const matches =
    result.matchedItems.length > 0 && result.priceRange ? (
      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
        {t("directory.matches", {
          count: result.matchedItems.length,
          price: rs(result.priceRange.min),
        })}
      </p>
    ) : null;

  const heart = (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("directory.save", { name: b.name })}
      onClick={toggle}
      className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:text-rose-500 dark:bg-slate-900/90"
    >
      <Heart
        className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
      />
    </button>
  );

  const closeButton = (
    <button
      type="button"
      aria-label={t("directory.close")}
      onClick={onClose}
      className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <X className="h-4 w-4" />
    </button>
  );

  const pill = sponsored && (
    <span className="rounded-full bg-slate-900/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      {t("directory.sponsored")}
    </span>
  );

  const shell = `relative flex min-w-0 rounded-2xl border bg-[var(--color-market-surface)] transition ${
    selected
      ? "border-blue-500 shadow-[0_0_0_3px_rgba(21,87,214,0.15)]"
      : "border-[var(--color-market-border)] hover:border-blue-300 hover:shadow-md"
  }`;

  if (variant === "grid") {
    return (
      <article
        ref={ref}
        className={`${shell} h-full flex-col overflow-hidden`}
        onMouseEnter={() => onHover?.(b.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="relative h-[92px] shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {b.cover && (
            <Image
              src={b.cover}
              alt=""
              fill
              sizes="(min-width: 1280px) 340px, 50vw"
              className="object-cover"
              style={cropStyle(b.coverCrop)}
            />
          )}
          {pill && <span className="absolute left-2.5 top-2.5">{pill}</span>}
          <span className="absolute right-2 top-1.5">{heart}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
          {/* Logo overlaps the cover by under a quarter of its own height,
              leaving room for the identity block (fixed line-heights, sized
              to fit below the overlap) to bottom-align to the logo's
              bottom edge without its text painting over the photo. */}
          <div className="-mt-3 flex items-end gap-2.5">
            <BizLogo b={b} className="h-16 w-16 text-lg" />
            <div className="min-w-0 flex-1">
              {nameLink}
              <MetaLine b={b} now={now} distanceKm={result.distanceKm} />
              <p className="truncate text-[12.5px] font-medium leading-[16px] text-[var(--color-market-text-secondary)]">
                {b.typeLabel} &middot; {b.city}
              </p>
            </div>
          </div>
          <ResponseLine b={b} withCount />
          {matches}
          <Chips b={b} />
          <Tiles b={b} matched={result.matchedItems} size="sm" />
          <Footer b={b} variant={variant} source={source} />
        </div>
      </article>
    );
  }

  if (variant === "side") {
    // The narrow map list: logo, identity and the earned response label on
    // the left of the header; tiles beside the actions. No cover photo.
    return (
      <article
        ref={ref}
        className={`${shell} flex-col gap-2.5 p-3`}
        onMouseEnter={() => onHover?.(b.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="flex items-start gap-2.5">
          <BizLogo b={b} className="h-11 w-11 text-sm !ring-2" />
          <div className="min-w-0 flex-1">
            {nameLink}
            <MetaLine b={b} now={now} distanceKm={result.distanceKm} />
            <p className="truncate text-[12.5px] font-medium leading-[16px] text-[var(--color-market-text-secondary)]">
              {b.typeLabel} &middot; {b.city} &middot;{" "}
              {t(`directory.count.${b.itemsKind}`, { count: b.itemCount })}
            </p>
            <ResponseLine b={b} />
            {matches}
          </div>
          <span className="flex shrink-0 items-center gap-1">
            {pill}
            {heart}
          </span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_150px] items-end gap-3">
          <Tiles b={b} matched={result.matchedItems} size="side" />
          <div className="flex flex-col gap-1.5">
            <Footer b={b} variant="side" source={source} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "popup") {
    return (
      <article
        ref={ref}
        className={`${shell} flex-col gap-2 p-3`}
        onMouseEnter={() => onHover?.(b.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="flex items-start gap-2.5">
          <BizLogo b={b} className="h-11 w-11 text-sm !ring-2" />
          <div className="min-w-0 flex-1">
            {nameLink}
            <MetaLine b={b} now={now} distanceKm={result.distanceKm} />
            <p className="truncate text-[12.5px] font-medium leading-[16px] text-[var(--color-market-text-secondary)]">
              {b.typeLabel} &middot; {b.city}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1">
            {pill}
            {onClose ? closeButton : heart}
          </span>
        </div>
        <ResponseLine b={b} withCount />
        {matches}
        <Chips b={b} />
        <Tiles b={b} matched={result.matchedItems} size="side" />
        <Footer b={b} variant={variant} source={source} />
      </article>
    );
  }

  // list: one wide row
  return (
    <article
      ref={ref}
      className={`${shell} flex-col gap-3 p-4 md:flex-row md:items-center md:gap-5`}
      onMouseEnter={() => onHover?.(b.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <BizLogo b={b} className="h-16 w-16 text-xl !ring-2" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {nameLink}
            {pill}
            <span className="ml-auto">{heart}</span>
          </div>
          <MetaLine b={b} now={now} distanceKm={result.distanceKm} />
          <p className="truncate text-[12.5px] font-medium leading-[16px] text-[var(--color-market-text-secondary)]">
            {b.typeLabel} &middot; {b.city} &middot;{" "}
            {t(`directory.count.${b.itemsKind}`, { count: b.itemCount })}
          </p>
          <ResponseLine b={b} />
          {matches}
          <Chips b={b} />
        </div>
      </div>
      <div className="w-full md:w-[300px] md:shrink-0">
        <Tiles b={b} matched={result.matchedItems} size="md" />
      </div>
      <div className="md:w-[260px] md:shrink-0">
        <Footer b={b} variant={variant} source={source} />
      </div>
    </article>
  );
}
