import "../globals.css";
import { Inter, Noto_Sans_Tamil, Noto_Sans_Sinhala } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
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
    default: "Lumevelo: Global Gem & Jewellery Marketplace",
    template: "%s | Lumevelo",
  },
  description:
    "Lumevelo is a global online marketplace for certified gems, precious metals, and fine jewellery, connecting buyers and verified sellers worldwide, anytime.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com",
  ),
  openGraph: {
    type: "website",
    siteName: "Lumevelo",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/logo-mark.png",
    shortcut: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumevelo.com";

// Organization + WebSite JSON-LD, shared across locales — helps Google
// understand the brand/site as a single entity across /en, /ta, /si and
// improves how it can appear in search (knowledge panel, sitelinks). No
// SearchAction here since the nav search box isn't wired to a real search
// results page yet — a schema pointing at a non-functional URL would be
// invalid structured data.
function structuredData(locale: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Lumevelo",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-mark.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Lumevelo",
      url: `${SITE_URL}/${locale}`,
      inLanguage: locale,
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
        className={`${inter.variable} ${notoSansTamil.variable} ${notoSansSinhala.variable} font-sans`}
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
