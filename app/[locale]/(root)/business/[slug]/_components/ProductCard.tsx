"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { instalmentQuote, priceDropPercent } from "@/lib/business/pricing";
import {
  whatsappHref,
  type Availability,
  type StorefrontBusiness,
  type StorefrontProduct,
} from "@/lib/business/storefront";
import { trackBusinessEvent } from "@/app/[locale]/(root)/businesses/_components/analytics";
import { cropStyle, rs } from "./format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

const AVAILABILITY_DOT: Record<Availability, string> = {
  "in-stock": "bg-emerald-500",
  "few-left": "bg-amber-500",
  "pre-order": "bg-blue-500",
  sold: "bg-slate-400",
};

const AVAILABILITY_TEXT: Record<Availability, string> = {
  "in-stock": "text-emerald-700 dark:text-emerald-400",
  "few-left": "text-amber-700 dark:text-amber-400",
  "pre-order": "text-blue-700 dark:text-blue-400",
  sold: "text-slate-500",
};

export function warrantyDuration(
  t: ReturnType<typeof useTranslations>,
  months: number,
) {
  return months % 12 === 0
    ? t("duration.years", { count: months / 12 })
    : t("duration.months", { count: months });
}

// Quiet by design: text lines, one icon (the availability dot). Condition
// and warranty type are always stated; a drop percentage appears only when
// the price is genuinely below its 30-day low; the instalment line names the
// provider and the number of months and only exists when the business
// offers that provider.
export function ProductCard({
  business,
  product,
}: {
  business: StorefrontBusiness;
  product: StorefrontProduct;
}) {
  const t = useTranslations("storefront");
  const sold = product.availability === "sold";
  const drop = priceDropPercent(product.price, product.lowestPrice30d);
  const quote = instalmentQuote(
    product.price,
    product.instalment,
    business.about.instalmentProviders,
  );

  return (
    <article
      className={`market-listing-card group relative flex flex-col ${
        sold ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.image && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 260px"
            className={`object-cover transition duration-500 group-hover:scale-105 ${
              sold ? "grayscale" : ""
            }`}
            style={cropStyle(product.crop)}
          />
        )}
        <button
          type="button"
          aria-label={t("product.save")}
          className="absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center text-slate-500 transition hover:text-rose-500"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm dark:bg-slate-900/90">
            <Heart className="h-4 w-4" />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {(product.condition || product.warranty) && (
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[var(--color-market-text-muted)]">
            {product.condition && (
              <span className="rounded bg-[var(--color-market-blue-light)] px-1.5 py-0.5 font-semibold text-blue-700 dark:text-blue-300">
                {t(`condition.${product.condition}`)}
              </span>
            )}
            {product.warranty && (
              <span className="whitespace-nowrap">
                {t(`warranty.${product.warranty.kind}`)} &middot;{" "}
                {warrantyDuration(t, product.warranty.months)}
              </span>
            )}
          </p>
        )}

        <h3 className="text-[15px] font-semibold leading-snug text-[var(--color-market-text)]">
          <Link
            href={product.href}
            className="line-clamp-2 after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        <p className="flex flex-wrap items-baseline gap-x-1.5 font-bold text-[#1557d6]">
          <span className="whitespace-nowrap text-base">
            {rs(product.price)}
          </span>
          {drop && product.lowestPrice30d && (
            <>
              <span className="text-xs font-medium text-[var(--color-market-text-muted)] line-through">
                {rs(product.lowestPrice30d)}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                &minus;{drop}%
              </span>
            </>
          )}
          {product.negotiable && (
            <span className="text-xs font-medium text-[var(--color-market-text-muted)]">
              {t("product.negotiable")}
            </span>
          )}
        </p>

        {quote && (
          <p className="text-xs text-[var(--color-market-text-secondary)]">
            {t("product.instalment", {
              amount: rs(quote.perMonth),
              months: quote.months,
              provider: quote.providerName,
            })}
          </p>
        )}

        {product.specs.length > 0 && (
          <p className="truncate text-[13px] text-[var(--color-market-text-secondary)]">
            {product.specs.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p
              className={`flex items-center gap-1.5 text-xs font-semibold ${AVAILABILITY_TEXT[product.availability]}`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${AVAILABILITY_DOT[product.availability]}`}
              />
              <span className="truncate">
                {t(`availability.${product.availability}`)}
              </span>
            </p>
            {product.deliveryDays && !sold && (
              <p className="truncate pl-3.5 text-[11px] text-[var(--color-market-text-muted)]">
                {t("product.delivery", {
                  min: product.deliveryDays[0],
                  max: product.deliveryDays[1],
                })}
              </p>
            )}
          </div>
          {!sold && (
            <a
              href={whatsappHref(business, SITE_URL, product)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackBusinessEvent("whatsapp_click", {
                  slug: business.slug,
                  source: "product-card",
                })
              }
              aria-label={t("product.whatsappAbout", { title: product.title })}
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/60 text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
