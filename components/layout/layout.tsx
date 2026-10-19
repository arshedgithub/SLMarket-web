"use client";

import React, { useEffect } from "react";

import { useThemeStore } from "@/store/themeStore";
import Navigation from "./navigation";
import Footer from "./footer";
import MessagingProvider from "@/components/messaging/MessagingProvider";
import type { MegaMenuAdSlide } from "@/lib/getMegaMenuAds";
import type { PopularSearch } from "@/lib/listings/popularSearches";

interface LayoutProps {
  children: React.ReactNode;
  megaMenuAds?: MegaMenuAdSlide[];
  popularSearches?: PopularSearch[];
}

export default function Layout({
  children,
  megaMenuAds,
  popularSearches = [],
}: LayoutProps) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:shadow-lg focus:outline-none dark:focus:bg-[#0c1422] dark:focus:text-blue-300"
      >
        Skip to main content
      </a>

      <Navigation megaMenuAds={megaMenuAds} popularSearches={popularSearches} />

      {/* pb clears the fixed mobile bottom tab bar (see navigation.tsx)
          so it never covers the last bit of page content. */}
      <main
        id="main-content"
        className="min-h-0 flex-grow pb-[calc(90px+env(safe-area-inset-bottom))] md:pb-0"
      >
        {children}
      </main>

      <Footer />

      <MessagingProvider />
    </div>
  );
}
