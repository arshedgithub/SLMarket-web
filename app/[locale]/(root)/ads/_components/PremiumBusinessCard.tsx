import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, Crown, Star, Truck, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";

/*
 * Paid storefront card for the ads grid. Navy surface, champagne gold
 * accents, one action: visit the shop. The whole card is a single link
 * (the shop name, stretched); nothing inside it is separately clickable.
 *
 *   sm and up  2 grid cells: shop info left (42%), showcase + CTA right
 *   below sm   full width, stacked: info, tiles, CTA
 *
 * Tokens and the border, hover and shine styles live in globals.css
 * (.premium-shop-card, --premium-*).
 */

export type PremiumShop = {
  name: string;
  logoUrl?: string;
  // The business's own banner. Without one the branded navy cover shows.
  coverUrl?: string;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
  category: string;
  city: string;
  // Already-translated trust facts; each is left out when not earned.
  replyTime?: string;
  delivery?: string;
  adsCount: number;
  href: string;
  isPaidPlacement: boolean;
};

export type PremiumProduct = {
  imageUrl: string;
  price: number;
  // Image alt only; product names are never shown on the card.
  alt: string;
};

const MAX_PRODUCTS = 3;

// Showcase grid from sm up: 3 = one tall tile and two stacked, fewer are
// centred side by side.
const SHOWCASE_GRID: Record<number, string> = {
  1: "sm:mx-auto sm:w-2/3 sm:grid-cols-1 sm:grid-rows-1",
  2: "sm:grid-cols-2 sm:grid-rows-1",
  3: "sm:grid-cols-2 sm:grid-rows-2",
};

function rupees(price: number) {
  return `Rs. ${price.toLocaleString("en-US")}`;
}

function Logo({ shop }: { shop: PremiumShop }) {
  const t = useTranslations("listings.premiumCard");
  return (
    <span className="relative z-[1] -mt-7 flex h-14 w-14 shrink-0 rounded-full bg-[image:var(--premium-gold)] p-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.28)]">
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[var(--premium-navy-1)] text-base font-bold text-[var(--premium-gold-1)]">
        {shop.logoUrl ? (
          <Image
            src={shop.logoUrl}
            alt={t("logoAlt", { name: shop.name })}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          shop.name.slice(0, 2).toUpperCase()
        )}
      </span>
    </span>
  );
}

// One line on phones. From sm up the info column is about 200px wide, so
// the two facts stack instead of wrapping around a stray separator.
function TrustLine({ shop }: { shop: PremiumShop }) {
  if (!shop.replyTime && !shop.delivery) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] leading-5 text-[var(--premium-meta)] sm:flex-col sm:items-start">
      {shop.replyTime && (
        <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap">
          <Zap
            aria-hidden
            className="h-3.5 w-3.5 shrink-0 fill-[var(--premium-gold-1)] text-[var(--premium-gold-1)]"
          />
          {shop.replyTime}
        </span>
      )}
      {shop.replyTime && shop.delivery && (
        <span aria-hidden className="sm:hidden">
          &middot;
        </span>
      )}
      {shop.delivery && (
        <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap">
          <Truck
            aria-hidden
            className="h-3.5 w-3.5 shrink-0 text-[var(--premium-gold-1)]"
          />
          {shop.delivery}
        </span>
      )}
    </p>
  );
}

function Showcase({ products }: { products: PremiumProduct[] }) {
  const count = products.length;
  return (
    <div
      className={`flex justify-center gap-2 sm:grid sm:min-h-0 sm:flex-1 ${SHOWCASE_GRID[count]}`}
    >
      {products.map((p, i) => (
        <span
          key={`${p.imageUrl}-${i}`}
          className={`relative aspect-square w-[calc((100%-1rem)/3)] shrink-0 overflow-hidden rounded-xl bg-white/10 sm:aspect-auto sm:min-h-24 sm:w-auto ${
            count === 3 && i === 0 ? "sm:row-span-2" : ""
          }`}
        >
          <Image
            src={p.imageUrl}
            alt={p.alt}
            fill
            sizes="(min-width: 640px) 160px, 33vw"
            className="object-cover"
          />
          <span className="absolute bottom-1.5 left-1.5 whitespace-nowrap rounded-md bg-[rgba(11,31,75,0.88)] px-1.5 py-0.5 text-[12px] font-bold leading-4 text-white">
            {rupees(p.price)}
          </span>
        </span>
      ))}
    </div>
  );
}

export function PremiumBusinessCard({
  shop,
  products,
}: {
  shop: PremiumShop;
  products: PremiumProduct[];
}) {
  const t = useTranslations("listings");
  const tiles = products.slice(0, MAX_PRODUCTS);
  const hasTiles = tiles.length > 0;
  const verifiedLabel = t("premiumCard.verified");

  return (
    <article
      className={`premium-shop-card flex h-full min-w-0 flex-col overflow-hidden ${
        hasTiles ? "sm:flex-row" : ""
      }`}
    >
      <span aria-hidden className="premium-shop-shine" />

      <span className="absolute left-3 top-3 z-[3] inline-flex items-center gap-1 rounded-full bg-[image:var(--premium-gold)] px-2.5 py-1 text-[11px] font-bold leading-none text-[var(--premium-navy-1)] shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
        <Crown aria-hidden className="h-3.5 w-3.5" />
        {t("premiumCard.premium")}
      </span>
      {shop.isPaidPlacement && (
        <span className="absolute right-3 top-3 z-[3] rounded bg-[rgba(11,31,75,0.7)] px-1.5 py-0.5 text-[11px] font-medium leading-4 text-[var(--premium-meta)]">
          {t("premiumCard.ad")}
        </span>
      )}

      <div
        className={`flex min-w-0 flex-col ${hasTiles ? "sm:w-[42%] sm:shrink-0" : ""}`}
      >
        <div className="premium-shop-cover relative h-24 shrink-0">
          {shop.coverUrl && (
            <>
              <Image
                src={shop.coverUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 220px, 100vw"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[rgba(11,31,75,0.65)] to-transparent" />
            </>
          )}
        </div>

        <div className="relative flex min-w-0 flex-col px-3.5 pb-3.5">
          <Logo shop={shop} />

          <h3 className="mt-2 flex min-w-0 items-center gap-1 text-[18px] font-bold leading-6">
            <Link
              href={shop.href}
              title={shop.name}
              className="min-w-0 truncate outline-none after:absolute after:inset-0 after:z-[4] after:content-['']"
            >
              {shop.name}
            </Link>
            {shop.verified && (
              <span title={verifiedLabel} className="shrink-0">
                <BadgeCheck
                  aria-hidden
                  className="h-[18px] w-[18px] fill-[var(--premium-gold-1)] text-[var(--premium-navy-1)]"
                />
                <span className="sr-only">{verifiedLabel}</span>
              </span>
            )}
          </h3>

          {shop.rating ? (
            <p className="mt-0.5 flex items-center gap-1 text-[13px] leading-5 text-[var(--premium-meta)]">
              <Star
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 fill-[var(--premium-gold-1)] text-[var(--premium-gold-1)]"
              />
              <span className="font-semibold text-white">
                {shop.rating.toFixed(1)}
              </span>
              {!!shop.reviewCount && (
                <span className="truncate">
                  ({t("card.reviews", { count: shop.reviewCount })})
                </span>
              )}
            </p>
          ) : null}

          <p className="mt-0.5 flex min-w-0 text-[13px] leading-5 text-[var(--premium-meta)]">
            <span className="shrink-0 whitespace-nowrap">
              {shop.category}&nbsp;&middot;&nbsp;
            </span>
            <span className="truncate">{shop.city}</span>
          </p>

          <TrustLine shop={shop} />
        </div>
      </div>

      <div
        className={`flex min-w-0 flex-col gap-2.5 px-3.5 pb-3.5 ${
          hasTiles ? "sm:flex-1 sm:py-3 sm:pl-0 sm:pr-3" : "mt-auto"
        }`}
      >
        {hasTiles && <Showcase products={tiles} />}
        <span className="flex h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[image:var(--premium-gold)] px-4 text-[14px] font-semibold text-[var(--premium-navy-1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:h-11">
          <span className="truncate">
            {t("premiumCard.visitShop", { count: shop.adsCount })}
          </span>
          <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
        </span>
      </div>
    </article>
  );
}

// Holds the slot while the sponsored picks load, in the card's own shape.
export function PremiumBusinessCardSkeleton() {
  const bar = "rounded-full bg-white/10 motion-safe:animate-pulse";
  return (
    <div
      aria-hidden
      className="premium-shop-card pointer-events-none flex h-full min-h-[280px] flex-col overflow-hidden sm:flex-row"
    >
      <div className="flex flex-col sm:w-[42%] sm:shrink-0">
        <div className="h-24 shrink-0 bg-white/[0.06]" />
        <div className="flex flex-col gap-2 px-3.5 pb-3.5">
          <span className="-mt-7 h-14 w-14 rounded-full border-2 border-[var(--premium-navy-1)] bg-[#1d3f86]" />
          <span className={`h-5 w-3/4 ${bar}`} />
          <span className={`h-3.5 w-1/2 ${bar}`} />
          <span className={`h-3.5 w-2/3 ${bar}`} />
          <span className={`h-3.5 w-4/5 ${bar}`} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-3.5 pb-3.5 sm:py-3 sm:pl-0 sm:pr-3">
        <div className="flex gap-2 sm:grid sm:flex-1 sm:grid-cols-2 sm:grid-rows-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`aspect-square flex-1 rounded-xl bg-white/[0.08] motion-safe:animate-pulse sm:aspect-auto sm:min-h-24 ${
                i === 0 ? "sm:row-span-2" : ""
              }`}
            />
          ))}
        </div>
        <span className="h-12 rounded-xl bg-white/10 sm:h-11" />
      </div>
    </div>
  );
}
