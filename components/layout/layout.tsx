"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  return (
    <div
      className={`flex flex-col min-h-screen ${isDarkMode ? "bg-gray-700" : "bg-white"} transition-colors duration-300`}
    >
      <Navigation megaMenuAds={megaMenuAds} />
      <main
        className={`flex-grow ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
      >
        {children}
      </main>
      <Footer />
      {/* Clears the fixed sign-in/register bar Navigation renders for
          guests on mobile, so it doesn't sit on top of the footer's last
          row of links. */}
      {!session?.user && <div className="md:hidden h-[68px]" aria-hidden />}
      <MessagingProvider />
    </div>
  );
}
