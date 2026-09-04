"use client";

import { ArrowRight, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSellerCta } from "@/hooks/useSellerCta";

// Home page CTAs that depend on the viewer's session (guest vs. seller).
// Pulled out as client components so the home page itself has no
// per-request auth() call and can be safely served as static/ISR HTML —
// otherwise whichever visitor's session triggered the first render would
// get baked into the cached page for everyone until the next revalidation.
export function HeroSellerLink() {
  const t = useTranslations("home");
  const { isSeller, href } = useSellerCta();
  return (
    <Link
      href={href}
      className="btn-gold-outline inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg"
    >
      <Store className="w-4 h-4" />{" "}
      {isSeller ? t("hero.goToSellerDashboard") : t("hero.becomeASeller")}
    </Link>
  );
}

// Sits on the "Ready to Begin Your Journey" photo band (home-cta.png), which
// is always dark regardless of site theme — text colors here are fixed
// light values rather than the theme-flipping luxury tokens used elsewhere.
export function BottomSellerCta() {
  const t = useTranslations("home");
  const { isSeller, href } = useSellerCta();
  return (
    <>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
        {isSeller ? t("journeyCta.sellerHeading") : t("journeyCta.heading")}
      </h2>
      <p className="text-gray-300 mb-6 sm:mb-8 max-w-md">
        {isSeller ? t("journeyCta.sellerDesc") : t("journeyCta.description")}
      </p>
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <Link
          href="/gems"
          className="btn-gold-gradient inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-lg"
        >
          {t("journeyCta.exploreMarketplace")}{" "}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 border-2 border-white/70 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Store className="w-4 h-4" />
          {isSeller
            ? t("journeyCta.goToDashboard")
            : t("journeyCta.becomeASeller")}
        </Link>
      </div>
    </>
  );
}
