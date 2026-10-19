"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Banknote,
  Check,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Heart,
  Home,
  Leaf,
  Link2,
  MessageCircle,
  MessageSquare,
  Phone,
  RotateCcw,
  Send,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  MAX_HIGHLIGHT_CHIPS,
  type BusinessHighlight,
} from "@/lib/business/highlights";
import { labelForSurface, responseLabelFor } from "@/lib/business/responseTime";
import {
  nextChange,
  whatsappHref,
  type StorefrontBusiness,
} from "@/lib/business/storefront";
import { trackBusinessEvent } from "@/app/[locale]/(root)/businesses/_components/analytics";
import { Link } from "@/i18n/navigation";
import { cropStyle, scrollToSection, useNow } from "./format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

const HIGHLIGHT_ICONS: Record<BusinessHighlight, LucideIcon> = {
  delivery: Truck,
  warranty: ShieldCheck,
  easyPayments: CreditCard,
  cod: Banknote,
  returns: RotateCcw,
  inspection: ClipboardCheck,
  leasing: FileText,
  consultation: Home,
  siteVisits: CalendarCheck,
  assembly: Wrench,
  freshness: Leaf,
};

export function BusinessLogo({
  business,
  className,
}: {
  business: StorefrontBusiness;
  className: string;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white ring-4 ring-white dark:ring-[#111d30] ${className}`}
      style={{ backgroundColor: business.brandColor }}
    >
      {business.logo ? (
        <Image
          src={business.logo}
          alt={business.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      ) : (
        business.name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}

// A live follow needs an account and a backend; until then it is a saved
// preference on this device.
export function useFollow(business: StorefrontBusiness) {
  const key = `slm:follow:${business.slug}`;
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    try {
      setFollowing(localStorage.getItem(key) === "1");
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  const toggle = () => {
    setFollowing((f) => {
      const next = !f;
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  return { following, toggle, count: business.followers + (following ? 1 : 0) };
}

export function ShareMenu({
  business,
  buttonClassName,
}: {
  business: StorefrontBusiness;
  buttonClassName: string;
}) {
  const t = useTranslations("storefront");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));

  const url = `${SITE_URL}/business/${business.slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("hero.share")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
      >
        <Share2 className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-lg">
          <p className="px-2.5 py-1.5 text-xs font-semibold text-[var(--color-market-text-muted)]">
            {t("share.title")}
          </p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${business.name} on SLMarket.lk ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-[var(--color-market-blue-light)]"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            {t("share.whatsapp")}
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-[var(--color-market-blue-light)]"
          >
            <Send className="h-4 w-4 text-blue-600" />
            {t("share.facebook")}
          </a>
          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-[var(--color-market-blue-light)]"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Link2 className="h-4 w-4 text-slate-500" />
            )}
            {copied ? t("share.copied") : t("share.copy")}
          </button>
        </div>
      )}
    </div>
  );
}

// Each chip opens the policy behind it, so a claim is never just a claim.
function HighlightChip({
  highlight,
}: {
  highlight: StorefrontBusiness["highlights"][number];
}) {
  const t = useTranslations("listings");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));
  const Icon = HIGHLIGHT_ICONS[highlight.key];
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--color-market-border)] bg-[var(--color-market-surface-soft)] px-2.5 text-xs font-medium text-[var(--color-market-text-secondary)] transition hover:border-blue-300"
      >
        <Icon className="h-3.5 w-3.5 text-blue-600" />
        {t(`business.highlights.${highlight.key}`)}
      </button>
      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[80vw] rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-3 text-sm shadow-lg"
        >
          <p className="font-semibold text-[var(--color-market-text)]">
            {t(`business.highlights.${highlight.key}`)}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-market-text-secondary)]">
            {highlight.policy}
          </p>
        </div>
      )}
    </div>
  );
}

function OpenStatus({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const tl = useTranslations("listings");
  const now = useNow();
  if (!now) return null;
  const change = nextChange(business, now);
  if (!change) return null;
  return (
    <span
      className={`flex items-center gap-1 font-semibold ${
        change.open
          ? "text-emerald-600"
          : "text-[var(--color-market-text-muted)]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${change.open ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {change.open ? tl("business.openNow") : tl("business.closed")}
      <span className="font-normal text-[var(--color-market-text-muted)]">
        {change.open
          ? t("hero.closesAt", { time: change.time })
          : change.tomorrow
            ? t("hero.opensTomorrow", { time: change.time })
            : t("hero.opensAt", { time: change.time })}
      </span>
    </span>
  );
}

export function TrustLine({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const tl = useTranslations("listings");
  const follow = useFollow(business);
  const label = labelForSurface(responseLabelFor(business.response), "page");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-market-text-secondary)]">
      {business.isNew ? (
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {t("new.badge")}
        </span>
      ) : (
        <span className="flex items-center gap-1 font-semibold text-[var(--color-market-text)]">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {business.rating.average.toFixed(1)}
          <span className="font-normal text-[var(--color-market-text-muted)]">
            ({business.rating.count})
          </span>
        </span>
      )}
      {label && (
        <span
          className="flex items-center gap-1"
          title={tl("business.responseTooltip")}
        >
          <Zap className="h-3.5 w-3.5 text-blue-600" />
          {tl(`business.response.${label}`)}
        </span>
      )}
      <OpenStatus business={business} />
      {business.followers > 0 && (
        <span>{t("hero.followers", { count: follow.count })}</span>
      )}
      <span>{t("hero.since", { year: business.sinceYear })}</span>
    </div>
  );
}

export function Hero({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const follow = useFollow(business);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revealLimit, setRevealLimit] = useState<"guest" | "user" | null>(null);

  // A guest can reveal only a few numbers an hour, then has to sign in. If
  // the check itself can't be reached, the number is shown rather than
  // blocking a buyer.
  const reveal = async () => {
    try {
      const res = await fetch("/api/businesses/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: business.slug, source: "business-page" }),
      });
      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as {
          requiresSignIn?: boolean;
        };
        setRevealLimit(data.requiresSignIn ? "guest" : "user");
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { phone: string };
        setRevealed(data.phone);
        return;
      }
    } catch {
      /* fall through */
    }
    setRevealed(business.phone);
    trackBusinessEvent("contact_reveal", {
      slug: business.slug,
      source: "business-page",
    });
  };
  const chips = business.highlights.slice(0, MAX_HIGHLIGHT_CHIPS);
  const primary = business.primaryAction;

  const iconButton =
    "flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-2.5 text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:border-blue-300 hover:text-blue-600";
  const filled =
    "flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm transition";
  const outline =
    "flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-[var(--color-market-surface)] px-5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950";

  const whatsapp = (variant: "filled" | "outline") => (
    <a
      href={whatsappHref(business, SITE_URL)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackBusinessEvent("whatsapp_click", {
          slug: business.slug,
          source: "business-page",
        })
      }
      className={
        variant === "filled"
          ? `${filled} bg-[#16a34a] hover:bg-[#15803d]`
          : outline
      }
    >
      <MessageCircle className="h-4 w-4" />
      {t("hero.whatsapp")}
    </a>
  );
  const number = (variant: "filled" | "outline") => {
    const cls =
      variant === "filled"
        ? `${filled} bg-blue-600 hover:bg-blue-700`
        : outline;
    if (revealLimit) {
      return (
        <Link href={revealLimit === "guest" ? "/login" : "#"} className={cls}>
          <Phone className="h-4 w-4" />
          {revealLimit === "guest"
            ? t("hero.signInToSeeNumber")
            : t("hero.tryLater")}
        </Link>
      );
    }
    return revealed ? (
      <a
        href={`tel:+${revealed}`}
        onClick={() =>
          trackBusinessEvent("call_click", {
            slug: business.slug,
            source: "business-page",
          })
        }
        className={cls}
      >
        <Phone className="h-4 w-4" />
        {`+${revealed.slice(0, 2)} ${revealed.slice(2, 4)} ${revealed.slice(4, 7)} ${revealed.slice(7)}`}
      </a>
    ) : (
      <button type="button" onClick={reveal} className={cls}>
        <Phone className="h-4 w-4" />
        {t("hero.showNumber")}
      </button>
    );
  };
  const enquire = (
    <button
      type="button"
      onClick={() => scrollToSection("enquiry")}
      className={`${filled} bg-blue-600 hover:bg-blue-700`}
    >
      <Send className="h-4 w-4" />
      {t("hero.enquire")}
    </button>
  );

  return (
    <section
      id="top"
      className="overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)]"
    >
      {/* Photo only. No text, no overlay, no stat panel: anything a buyer
          should read is real page content below. */}
      <div
        className="relative h-[140px] md:h-[240px]"
        style={{ backgroundColor: business.brandColor }}
      >
        {business.cover && (
          <Image
            src={business.cover}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
            style={cropStyle(business.coverCrop)}
          />
        )}
      </div>

      <div className="px-4 pb-4 md:px-6 md:pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
          <BusinessLogo
            business={business}
            className="-mt-10 h-20 w-20 text-2xl md:-mt-14 md:h-28 md:w-28 md:text-4xl"
          />

          <div className="min-w-0 flex-1 md:pt-3">
            <h1 className="flex items-center gap-2 font-heading text-2xl font-extrabold text-[var(--color-market-text)] md:text-3xl">
              <span className="truncate">{business.name}</span>
              {business.verified && (
                <BadgeCheck
                  aria-label={t("hero.verified")}
                  className="h-6 w-6 shrink-0 fill-blue-600 text-white"
                />
              )}
            </h1>
            {business.tagline && (
              <p className="mt-0.5 text-sm text-[var(--color-market-text-secondary)]">
                {business.tagline}
              </p>
            )}
            <div className="mt-2">
              <TrustLine business={business} />
            </div>
            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((h) => (
                  <HighlightChip key={h.key} highlight={h} />
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 md:w-[220px] md:pt-3">
            {/* One filled primary, chosen by the business (WhatsApp by
                default); the second contact method is an outline. */}
            <div className="hidden flex-col gap-2 md:flex">
              {primary === "whatsapp" && (
                <>
                  {whatsapp("filled")}
                  {number("outline")}
                </>
              )}
              {primary === "call" && (
                <>
                  {number("filled")}
                  {whatsapp("outline")}
                </>
              )}
              {primary === "enquire" && (
                <>
                  {enquire}
                  {number("outline")}
                </>
              )}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                aria-label={t("hero.chat")}
                onClick={() => scrollToSection("enquiry")}
                className={iconButton}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-pressed={follow.following}
                aria-label={
                  follow.following ? t("hero.following") : t("hero.follow")
                }
                onClick={follow.toggle}
                className={`${iconButton} flex-1 ${follow.following ? "border-rose-200 text-rose-600" : ""}`}
              >
                <Heart
                  className={`h-4 w-4 ${follow.following ? "fill-rose-500" : ""}`}
                />
                <span>{follow.count.toLocaleString("en-US")}</span>
              </button>
              <ShareMenu business={business} buttonClassName={iconButton} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
