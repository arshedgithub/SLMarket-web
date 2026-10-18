"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Phone, Send } from "lucide-react";
import {
  whatsappHref,
  type StorefrontBusiness,
} from "@/lib/business/storefront";
import { trackBusinessEvent } from "@/app/[locale]/(root)/businesses/_components/analytics";
import { scrollToSection } from "./format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://slmarket.lk";

// On phones contact is the whole point of the page: the primary action is
// full width with Call and Enquire beside it. It replaces the bottom tab
// bar on business pages.
export function MobileBar({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const primary = business.primaryAction;
  const icon =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-[var(--color-market-surface)] text-blue-700 dark:border-blue-800 dark:text-blue-300";
  const big =
    "flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 md:hidden">
      {primary === "call" ? (
        <a
          href={`tel:+${business.phone}`}
          onClick={() =>
            trackBusinessEvent("call_click", {
              slug: business.slug,
              source: "mobile-bar",
            })
          }
          className={`${big} bg-blue-600`}
        >
          <Phone className="h-5 w-5" />
          {t("hero.call")}
        </a>
      ) : primary === "enquire" ? (
        <button
          type="button"
          onClick={() => scrollToSection("enquiry")}
          className={`${big} bg-blue-600`}
        >
          <Send className="h-5 w-5" />
          {t("hero.enquire")}
        </button>
      ) : (
        <a
          href={whatsappHref(business, SITE_URL)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackBusinessEvent("whatsapp_click", {
              slug: business.slug,
              source: "mobile-bar",
            })
          }
          className={`${big} bg-[#16a34a]`}
        >
          <MessageCircle className="h-5 w-5" />
          {t("hero.whatsapp")}
        </a>
      )}
      {primary !== "call" && (
        <a
          href={`tel:+${business.phone}`}
          aria-label={t("hero.call")}
          onClick={() =>
            trackBusinessEvent("call_click", {
              slug: business.slug,
              source: "mobile-bar",
            })
          }
          className={icon}
        >
          <Phone className="h-5 w-5" />
        </a>
      )}
      {primary !== "enquire" && (
        <button
          type="button"
          aria-label={t("hero.enquire")}
          onClick={() => scrollToSection("enquiry")}
          className={icon}
        >
          <Send className="h-5 w-5" />
        </button>
      )}
      {primary === "call" && (
        <a
          href={whatsappHref(business, SITE_URL)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("hero.whatsapp")}
          className={icon}
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}
