import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Compass,
  House,
  LifeBuoy,
  Plus,
  Search,
  SearchX,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/config/const/navLinks";
import { categoryAccent, categoryGlyphSrc } from "@/config/const/categoryIcons";

/*
 * SLMarket 404s. Two variants, never a dead end:
 *   AdNotFound    anything under /ads or /ad: the ad is gone or never was;
 *                 search, all ads, post an ad, and a category picker
 *   PageNotFound  every other missing page: search plus the main areas
 */

// GET form: works without JavaScript and lands on the normal results page.
async function SearchForm({
  label,
  placeholder,
  button,
}: {
  label: string;
  placeholder: string;
  button: string;
}) {
  const locale = await getLocale();
  return (
    <form
      action={`/${locale}/ads`}
      method="get"
      role="search"
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-[0_8px_24px_rgba(15,50,120,0.08)]"
    >
      <label htmlFor="not-found-search" className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden
        className="ml-2.5 h-5 w-5 shrink-0 text-[color:var(--color-market-text-muted)]"
      />
      <input
        id="not-found-search"
        name="q"
        type="search"
        placeholder={placeholder}
        className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-[color:var(--color-market-text)] outline-none placeholder:text-[color:var(--color-market-text-muted)]"
      />
      <button
        type="submit"
        className="h-11 shrink-0 rounded-xl bg-[var(--color-market-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-market-blue-dark)]"
      >
        {button}
      </button>
    </form>
  );
}

export async function AdNotFound() {
  const t = await getTranslations("notFound.ad");
  const tCat = await getTranslations("categories");

  return (
    <section className="ads-page relative isolate overflow-hidden bg-[var(--color-market-background)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_70%_at_50%_0%,#dbe7ff_0%,transparent_70%)] dark:bg-[radial-gradient(60%_70%_at_50%_0%,#13284d_0%,transparent_70%)]"
      />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-16">
        <div className="relative mx-auto mb-7 h-24 w-24">
          <span className="absolute inset-0 rotate-6 rounded-[28px] bg-[#dbe7ff] dark:bg-[#1a2f55]" />
          <span className="relative flex h-full w-full items-center justify-center rounded-[28px] bg-gradient-to-br from-[#123fb2] via-[#1557d6] to-[#247be5] shadow-[0_18px_40px_rgba(21,87,214,0.35)]">
            <SearchX
              aria-hidden
              className="h-11 w-11 text-white"
              strokeWidth={1.75}
            />
          </span>
          <span className="absolute -bottom-2 -right-3 rounded-full bg-[image:var(--premium-gold)] px-2 py-0.5 text-[11px] font-bold text-[var(--premium-navy-1)] shadow-sm">
            404
          </span>
        </div>

        <p className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[color:var(--color-market-text)] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[color:var(--color-market-text-secondary)]">
          {t("body")}
        </p>

        <div className="mt-8">
          <SearchForm
            label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
            button={t("searchButton")}
          />
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/ads"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-market-blue)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(21,87,214,0.25)] transition hover:bg-[var(--color-market-blue-dark)] sm:w-auto"
          >
            {t("allAds")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link
            href="/post-ad"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] px-6 text-sm font-semibold text-[color:var(--color-market-text)] transition hover:border-blue-300 sm:w-auto"
          >
            <Plus aria-hidden className="h-4 w-4" />
            {t("postAd")}
          </Link>
        </div>

        <div className="mt-14 text-left">
          <h2 className="mb-4 text-center text-sm font-semibold text-[color:var(--color-market-text-secondary)]">
            {t("categoriesTitle")}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/ads/${c.id}`}
                  className="group flex min-h-14 items-center gap-2.5 rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_10px_24px_rgba(31,76,150,0.1)]"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${categoryAccent(c.id)}`}
                  >
                    <Image
                      src={categoryGlyphSrc(c.id)}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                    />
                  </span>
                  <span className="line-clamp-2 min-w-0 flex-1 py-2 text-sm font-medium leading-snug text-[color:var(--color-market-text)]">
                    {tCat(`${c.id}.name`)}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="hidden h-4 w-4 shrink-0 text-[color:var(--color-market-text-muted)] opacity-0 transition group-hover:opacity-100 sm:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const DESTINATIONS: {
  href: string;
  icon: LucideIcon;
  key: "home" | "ads" | "businesses" | "help";
}[] = [
  { href: "/", icon: House, key: "home" },
  { href: "/ads", icon: Compass, key: "ads" },
  { href: "/businesses", icon: Store, key: "businesses" },
  { href: "/help", icon: LifeBuoy, key: "help" },
];

export async function PageNotFound() {
  const t = await getTranslations("notFound.page");

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-market-background)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_70%_at_50%_0%,#e3ecff_0%,transparent_70%)] dark:bg-[radial-gradient(60%_70%_at_50%_0%,#13284d_0%,transparent_70%)]"
      />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-24 sm:pt-20">
        <p
          aria-hidden
          className="font-heading bg-gradient-to-b from-[#1557d6] to-[#9cbcf5] bg-clip-text text-[96px] font-extrabold leading-none tracking-tight text-transparent sm:text-[128px] dark:from-[#91b5ff] dark:to-[#2f4f86]"
        >
          404
        </p>
        <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--color-market-text)] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[color:var(--color-market-text-secondary)]">
          {t("body")}
        </p>

        <div className="mt-8">
          <SearchForm
            label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
            button={t("searchButton")}
          />
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {DESTINATIONS.map(({ href, icon: Icon, key }) => (
            <li key={key}>
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_10px_24px_rgba(31,76,150,0.1)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-market-blue-light)] text-[var(--color-market-blue)] dark:bg-[#132038]">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[color:var(--color-market-text)]">
                    {t(key)}
                  </span>
                  <span className="block truncate text-sm text-[color:var(--color-market-text-muted)]">
                    {t(`${key}Desc`)}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[color:var(--color-market-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
