import "../globals.css";
import {
  Inter,
  Plus_Jakarta_Sans,
  Noto_Sans_Tamil,
  Noto_Sans_Sinhala,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// A distinct, more premium display face for section headings only — the
// body keeps Inter for readability.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading-face",
});
const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
});
const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-sinhala",
});

export const metadata: Metadata = {
  title: {
    default: "SLMarket.lk: Sri Lanka's Trusted Marketplace to Buy & Sell",
    template: "%s | SLMarket.lk",
  },
  description:
    "SLMarket.lk is Sri Lanka's trusted online marketplace for vehicles, property, electronics, home and garden, fashion, food, agriculture, pets, services, jobs and everyday essentials, connecting buyers and verified local sellers.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk",
  ),
  openGraph: {
    type: "website",
    siteName: "SLMarket.lk",
  },
  twitter: { card: "summary_large_image" },
  // Favicon / touch icon come from the app/icon.png, app/apple-icon.png and
  // app/favicon.ico file conventions (auto-discovered by Next.js) rather
  // than being declared here.
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";

// Organization + WebSite JSON-LD, shared across locales. Helps Google
// understand the brand/site as a single entity across /en, /ta, /si and
// improves how it can appear in search (knowledge panel, sitelinks, and —
// via the SearchAction below — a sitelinks search box). The search target
// is /ads?q={query}, which the homepage search bar actually submits to.
function structuredData(locale: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SLMarket.lk",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [
        "https://www.facebook.com/profile.php?id=100084445023354",
        "https://www.instagram.com/slmarketlk/",
        "https://www.tiktok.com/@slmarketlk",
        "https://www.linkedin.com/company/slmarket",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "SLMarket.lk",
      url: `${SITE_URL}/${locale}`,
      inLanguage: locale,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/${locale}/ads?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale's request-config lookups.
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${notoSansTamil.variable} ${notoSansSinhala.variable} font-sans`}
      >
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData(locale)),
          }}
        />
        <NextIntlClientProvider>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
