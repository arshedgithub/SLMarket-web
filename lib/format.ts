/*
 * Numbers as people read them, in the page's language. Counts use the
 * message files' plural rules ("1 ad", "2 ads"); these only format the
 * number itself.
 */

const INTL_LOCALE: Record<string, string> = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

const intlLocale = (locale: string) => INTL_LOCALE[locale] ?? "en-LK";

// 1234 -> "1.2K", 999 -> "999".
export function compactNumber(n: number, locale = "en"): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    notation: n >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);
}

// 1250000 -> "1,250,000" (grouped, never abbreviated: prices and totals).
export function groupedNumber(n: number, locale = "en"): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(n);
}

// "Rs. 1,250,000". Prices always show full digits.
export function rupees(n: number, locale = "en"): string {
  return `Rs. ${groupedNumber(n, locale)}`;
}
