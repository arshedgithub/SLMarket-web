import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ClipboardCheck,
  Flag,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const TIPS = [
  { icon: Wallet, key: "tip1" },
  { icon: Users, key: "tip2" },
  { icon: ClipboardCheck, key: "tip3" },
  { icon: Flag, key: "tip4" },
] as const;

/*
 * The four safety tips: a panel on the homepage, a compact list next to the
 * Call and WhatsApp buttons on ad pages. Advice only: nothing here claims
 * SLMarket.lk checks every seller or guarantees a sale.
 */
export async function SafetyTips({
  locale,
  variant,
}: {
  locale: string;
  variant: "strip" | "compact";
}) {
  const t = await getTranslations({ locale, namespace: "home.safety" });

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-background)] p-4">
        <p className="text-sm font-bold text-[var(--color-market-text)]">
          {t("heading")}
        </p>
        <ul className="mt-2 grid gap-1.5">
          {TIPS.map(({ icon: Icon, key }) => (
            <li
              key={key}
              className="flex items-start gap-2 text-sm text-[var(--color-market-text-secondary)]"
            >
              <Icon
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-market-text-secondary)]"
              />
              {t(`${key}Title`)}
            </li>
          ))}
        </ul>
        <Link
          href="/help/safety"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          {t("cta")}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="safety-heading"
      className="grid gap-6 rounded-3xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-6 shadow-[0_8px_24px_-18px_rgba(16,33,63,0.2)] sm:p-8 xl:grid-cols-[300px_1fr] xl:items-center xl:gap-0"
    >
      <div className="flex items-start gap-4 xl:pr-8">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1557d6] text-white shadow-[0_10px_24px_-10px_rgba(21,87,214,0.6)]">
          <ShieldCheck aria-hidden className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1557d6] dark:text-blue-300">
            {t("eyebrow")}
          </p>
          <h2
            id="safety-heading"
            className="font-heading mt-1 text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-market-text)]"
          >
            {t("heading")}
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-[var(--color-market-text-secondary)]">
            {t("desc")}
          </p>
          <Link
            href="/help/safety"
            className="mt-2 inline-flex h-10 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            {t("cta")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <ul className="grid gap-5 border-t border-[var(--color-market-border)] pt-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0 xl:divide-x xl:divide-[var(--color-market-border)] xl:border-l xl:border-t-0 xl:pt-0">
        {TIPS.map(({ icon: Icon, key }) => (
          <li
            key={key}
            className="flex items-start gap-3 xl:flex-col xl:items-center xl:gap-2.5 xl:px-5 xl:text-center"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1557d6] dark:bg-blue-950 dark:text-blue-300">
              <Icon aria-hidden className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--color-market-text)]">
                {t(`${key}Title`)}
              </p>
              <p className="mt-0.5 text-sm leading-5 text-[var(--color-market-text-secondary)]">
                {t(`${key}Desc`)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
