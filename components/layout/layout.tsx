"use client";

import React, { useEffect } from "react";

import { useThemeStore } from "@/store/themeStore";
import Navigation from "./navigation";
import Footer from "./footer";
import MessagingProvider from "@/components/messaging/MessagingProvider";
import type { MegaMenuAdSlide } from "@/lib/getMegaMenuAds";

interface LayoutProps {
  children: React.ReactNode;
  megaMenuAds?: MegaMenuAdSlide[];
}

export default function Layout({ children, megaMenuAds }: LayoutProps) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">
      <Navigation megaMenuAds={megaMenuAds} />

      <main className="min-h-0 flex-grow">{children}</main>

      <Footer />

      <MessagingProvider />
    </div>
  );
}
