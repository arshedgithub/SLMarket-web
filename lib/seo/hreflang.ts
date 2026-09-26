import { routing } from "@/i18n/routing";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";

// Builds the `alternates.languages` object for a page's generateMetadata,
// given the pathname it lives at *without* a locale prefix (e.g. "/about").
// Use in any (server-component) page/layout that defines its own metadata,
// so its /en/, /ta/, /si/ variants are linked as translations for SEO —
// mirrors the per-path grouping already done in app/sitemap.ts.
export function localeAlternates(pathname: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${BASE}/${locale}${pathname}`]),
  );
}
