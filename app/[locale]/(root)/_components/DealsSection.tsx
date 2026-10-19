import Image from "next/image";
import { ArrowRight, Clock, Store, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionEyebrow } from "./SectionHeader";

type IconComponent = React.ComponentType<{ className?: string }>;

// Ads with a coupon code or a special offer (a two-type mix rides on
// ?deal= params, in the order the proxy keeps).
const COUPONS_AND_OFFERS_HREF = "/ads/deals?deal=coupon&deal=offer";

const DEAL_ICON_DIR = "/images/marketplace/deals/icons";
const DEAL_ICON = {
  gift: `${DEAL_ICON_DIR}/gift.webp`,
  trendingUp: `${DEAL_ICON_DIR}/trending-up.webp`,
  percent: `${DEAL_ICON_DIR}/percent.webp`,
};

type DealsCopy = {
  eyebrow: string;
  headingStart: string;
  headingHighlight: string;
  desc: string;
  cta: string;
  couponsTitle: string;
  couponsDesc: string;
  couponsCta: string;
  couponsCount: string;
  priceTitle: string;
  priceDesc: string;
  priceCta: string;
  priceCount: string;
};

function DealFeatureCard({
  image,
  tint,
  iconWrap,
  icon,
  title,
  description,
  noteIcon: NoteIcon,
  note,
  cta,
  href,
}: {
  image: string;
  tint: string;
  iconWrap: string;
  icon: string;
  title: string;
  description: string;
  noteIcon: IconComponent;
  note: string;
  cta: string;
  href: string;
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border border-black/[0.04] shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${tint}`}
    >
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 90vw, 340px"
          className="object-contain object-bottom px-4 pt-3 transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
          >
            <Image
              src={icon}
              alt=""
              width={40}
              height={40}
              className="h-5 w-5"
            />
          </span>
          <h3 className="text-base font-bold text-[var(--color-market-text)]">
            {title}
          </h3>
        </div>

        <p className="mt-2 flex-1 text-sm leading-6 text-[var(--color-market-text-secondary)]">
          {description}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/70 p-3 text-xs leading-5 text-[var(--color-market-text-muted)] dark:bg-white/10">
          <NoteIcon className="h-4 w-4 shrink-0 text-blue-500" />
          {note}
        </div>

        <Link
          href={href}
          className="mt-3.5 flex items-center justify-center gap-1.5 self-center whitespace-nowrap text-[15px] font-bold tracking-tight text-blue-600 hover:text-blue-700"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function DealsSection({
  t,
  priceDropCount,
  offerCount,
}: {
  t: DealsCopy;
  priceDropCount: number;
  offerCount: number;
}) {
  // Genuine data only — an empty tile looks broken, so it's hidden rather
  // than shown with a "0" count, and the whole section disappears once
  // there's nothing real to show in either tile. See lib/deals/priceDrops.ts
  // and lib/deals/offers.ts for what "genuine" means here.
  if (priceDropCount === 0 && offerCount === 0) return null;

  const tiles = [
    offerCount > 0 && {
      tint: "bg-[#fdf4e7] dark:bg-[#2a2418]",
      iconWrap: "bg-orange-500",
      icon: DEAL_ICON.gift,
      title: t.couponsTitle,
      tag: t.couponsCount,
      href: COUPONS_AND_OFFERS_HREF,
    },
    priceDropCount > 0 && {
      tint: "bg-[#eef4fd] dark:bg-[#17263c]",
      iconWrap: "bg-blue-500",
      icon: DEAL_ICON.trendingUp,
      title: t.priceTitle,
      tag: t.priceCount,
      href: "/ads/deals/price-drops",
    },
  ].filter((tile): tile is Exclude<typeof tile, false> => Boolean(tile));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 shadow-[0_20px_55px_-24px_rgba(16,33,63,0.2)] sm:p-7 lg:p-9">
        <Image
          src="/images/marketplace/deals/background.webp"
          alt=""
          fill
          sizes="(max-width: 1320px) 100vw, 1240px"
          className="-z-10 object-cover object-bottom opacity-90 dark:opacity-20"
        />

        {/* Mobile — its own compact layout (not the desktop/tablet header) */}
        <div className="sm:hidden">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1557d6]">
                <Image
                  src={DEAL_ICON.percent}
                  alt=""
                  width={40}
                  height={40}
                  className="h-5 w-5"
                />
              </span>
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-extrabold leading-tight tracking-tight text-[var(--color-market-text)]">
                  {t.eyebrow}
                </h2>
                <p className="truncate text-xs text-[var(--color-market-text-muted)]">
                  {t.headingStart} {t.headingHighlight}
                </p>
              </div>
            </div>
            <Link
              href="/ads/deals"
              className="shrink-0 whitespace-nowrap pt-1 text-sm font-semibold text-blue-600"
            >
              {t.cta}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tiles.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className={`flex flex-col gap-2 rounded-2xl border border-black/[0.04] p-3 ${c.tint}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${c.iconWrap}`}
                >
                  <Image
                    src={c.icon}
                    alt=""
                    width={36}
                    height={36}
                    className="h-4.5 w-4.5"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[12px] font-bold leading-tight text-[var(--color-market-text)]">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs leading-tight text-[var(--color-market-text-muted)]">
                    {c.tag}
                  </p>
                </div>
                <ArrowRight className="mt-auto h-3.5 w-3.5 self-end text-[var(--color-market-text-muted)]" />
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden gap-8 sm:grid lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
          <div className="flex flex-col items-start justify-center">
            <SectionEyebrow icon={Tag}>{t.eyebrow}</SectionEyebrow>
            <h2 className="font-heading mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-market-text)] sm:text-4xl">
              {t.headingStart}{" "}
              <span className="text-[#1557d6]">{t.headingHighlight}</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-market-text-secondary)]">
              {t.desc}
            </p>

            <Link
              href="/ads/deals"
              className="btn-solid mt-6 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {offerCount > 0 && (
              <DealFeatureCard
                image="/images/marketplace/deals/coupons.webp"
                tint="bg-[#fdf4e7] dark:bg-[#2a2418]"
                iconWrap="bg-orange-500"
                icon={DEAL_ICON.gift}
                title={t.couponsTitle}
                description={t.couponsDesc}
                noteIcon={Store}
                note={t.couponsCount}
                cta={t.couponsCta}
                href={COUPONS_AND_OFFERS_HREF}
              />
            )}
            {priceDropCount > 0 && (
              <DealFeatureCard
                image="/images/marketplace/deals/price-drops.webp"
                tint="bg-[#eef4fd] dark:bg-[#17263c]"
                iconWrap="bg-blue-500"
                icon={DEAL_ICON.trendingUp}
                title={t.priceTitle}
                description={t.priceDesc}
                noteIcon={Clock}
                note={t.priceCount}
                cta={t.priceCta}
                href="/ads/deals/price-drops"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
