"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Award, BadgeCheck, Crown, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Rail } from "../../_components/Rail";
import type { SampleShop } from "./data";

const SHOP_TIER = {
  toprated: { icon: Award, cls: "text-amber-600 dark:text-amber-300" },
  premium: { icon: Crown, cls: "text-violet-600 dark:text-violet-300" },
  verified: { icon: BadgeCheck, cls: "text-emerald-600 dark:text-emerald-300" },
} as const;

function ShopMiniCard({ shop }: { shop: SampleShop }) {
  const t = useTranslations("listings");
  const tier = SHOP_TIER[shop.tier];
  const TierIcon = tier.icon;
  const initials = shop.name.slice(0, 2).toUpperCase();

  return (
    <Link
      href="/sellers"
      className="flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-[230px]"
    >
      <div className="relative h-20">
        <Image
          src={shop.cover}
          alt=""
          fill
          sizes="230px"
          className="object-cover"
        />
        <span
          className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold shadow-sm ${tier.cls}`}
        >
          <TierIcon className="h-3 w-3" />
          {t(`shops.tier.${shop.tier}`)}
        </span>
      </div>

      <div className="relative z-10 -mt-5 rounded-t-2xl bg-[var(--color-market-surface)] px-3 pb-3 pt-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-[var(--color-market-surface)]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-xs font-bold text-[var(--color-market-text)]">
              <span className="truncate">{shop.name}</span>
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            </p>
            <p className="truncate text-[11px] text-[var(--color-market-text-muted)]">
              {shop.category} &middot; {shop.location}
            </p>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1 text-[11px] text-[var(--color-market-text-muted)]">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-[var(--color-market-text)]">
            {shop.rating.toFixed(1)}
          </span>
          <span className="text-[var(--color-market-border-strong)]">|</span>
          {shop.listings} {t("shops.listings")}
        </p>

        <span className="mt-2.5 flex items-center gap-1 text-xs font-bold text-blue-600">
          {t("shops.visitShop")}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function FeaturedShopsRail({
  shops,
  heading,
}: {
  shops: SampleShop[];
  heading: string;
}) {
  const t = useTranslations("listings");
  if (shops.length === 0) return null;

  return (
    <Rail
      heading={heading}
      subheading={t("shops.subheading")}
      viewAllHref="/sellers"
      viewAllLabel={t("shops.viewAll")}
      dotsCount={shops.length}
    >
      {shops.map((shop) => (
        <ShopMiniCard key={shop.name} shop={shop} />
      ))}
    </Rail>
  );
}
