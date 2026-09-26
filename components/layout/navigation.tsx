"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  BadgeCheck,
  Store,
  Settings,
  LogOut,
  MessageCircle,
  Heart,
  LayoutGrid,
  HelpCircle,
  Plus,
  Search,
  Tag,
  Package,
  Home,
  Languages,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { categoryIcon } from "@/config/const/categoryIcons";
import { POPULAR_SEARCHES } from "@/config/const/popularSearches";
import { SAMPLE_USER_SHOPS } from "@/lib/sampleUserShops";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import { useThemeStore } from "@/store/themeStore";
import { useTheme } from "next-themes";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useMessagingStore } from "@/store/messagingStore";
import MessagesPopover from "@/components/messaging/MessagesPopover";
import NotificationsDropdown from "@/components/messaging/NotificationsDropdown";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import type { MegaMenuAdSlide } from "@/lib/getMegaMenuAds";

export default function Navigation({
  megaMenuAds,
}: {
  megaMenuAds?: MegaMenuAdSlide[];
}) {
  const t = useTranslations("nav");
  const tCategories = useTranslations("categories");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCatModalOpen = useCategoryModalStore((s) => s.isOpen);
  const openCatModalStore = useCategoryModalStore((s) => s.open);
  const closeCatModal = useCategoryModalStore((s) => s.close);
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");
  const [adIndex, setAdIndex] = useState(0);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(
    null,
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isBottomAccountOpen, setIsBottomAccountOpen] = useState(false);

  const catModalRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const tabletProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const bottomAccountRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const tabletNotificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const catHoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  // Listing pages carry their own one-row mobile header (logo mark +
  // search + location), so the global top bar is desktop/tablet only there.
  const onListingPage = pathname.startsWith("/ads");
  const [hideBottomNav, setHideBottomNav] = useState(false);

  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const adSlides = megaMenuAds && megaMenuAds.length > 0 ? megaMenuAds : [];
  const activeAd = adSlides[adIndex % Math.max(adSlides.length, 1)];

  const isMessagesPopoverOpen = useMessagingStore(
    (s) => s.isMessagesPopoverOpen,
  );
  const isNotificationsPanelOpen = useMessagingStore(
    (s) => s.isNotificationsPanelOpen,
  );
  const toggleMessagesPopover = useMessagingStore(
    (s) => s.toggleMessagesPopover,
  );
  const closeMessagesPopover = useMessagingStore((s) => s.closeMessagesPopover);
  const toggleNotificationsPanel = useMessagingStore(
    (s) => s.toggleNotificationsPanel,
  );
  const closeNotificationsPanel = useMessagingStore(
    (s) => s.closeNotificationsPanel,
  );
  const unreadMessagesTotal = useMessagingStore((s) => s.unreadMessagesTotal());
  const unreadNotificationsTotal = useMessagingStore((s) =>
    s.unreadNotificationsTotal(),
  );

  useOutsideClick([catModalRef], () => closeCatModal());
  useOutsideClick(
    [profileMenuRef, tabletProfileMenuRef, mobileProfileMenuRef],
    () => setIsProfileMenuOpen(false),
  );
  useOutsideClick(
    [notificationsRef, tabletNotificationsRef, mobileNotificationsRef],
    closeNotificationsPanel,
  );
  useOutsideClick([messagesRef], closeMessagesPopover);
  useOutsideClick([bottomAccountRef], () => setIsBottomAccountOpen(false));

  // Auto-advance the modal's promo rail only while the modal is open.
  useEffect(() => {
    if (!isCatModalOpen || adSlides.length < 2) return;
    const id = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % adSlides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [isCatModalOpen, adSlides.length]);

  // Lock body scroll while the category modal is open.
  useEffect(() => {
    if (!isCatModalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isCatModalOpen]);

  // Reset the modal's inner state whenever it opens — it can be opened
  // from the navbar button or the homepage "View all" link.
  useEffect(() => {
    if (!isCatModalOpen) return;
    setActiveCat(categories[0]?.id ?? "");
    setAdIndex(0);
    setIsMenuOpen(false);
  }, [isCatModalOpen]);

  // Bottom tab bar hides while scrolling down and returns on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 8 && y > 80) setHideBottomNav(true);
      else if (y < lastY - 8 || y <= 80) setHideBottomNav(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const changeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toggleDarkMode();
  };

  const openCatModal = () => {
    if (isCatModalOpen) {
      closeCatModal();
      return;
    }
    openCatModalStore();
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setExpandedMobileCat(null);
  };

  const hoverCat = (id: string) => {
    if (catHoverTimeout.current) clearTimeout(catHoverTimeout.current);
    catHoverTimeout.current = setTimeout(() => setActiveCat(id), 80);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    signOut({ redirectTo: "/" });
  };

  const wishlistCount = 0;

  const activeCategory = categories.find((c) => c.id === activeCat);
  const activeSubcats = activeCategory?.subcategories ?? [];

  /* ============================================================
     PROFILE DROPDOWN (shared desktop + mobile)
     ============================================================ */

  function renderProfileDropdown(position: "below" | "above" = "below") {
    if (!session?.user) return null;
    return (
      <div
        className={`absolute right-0 z-50 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-lg dark:bg-[#111d30] ${
          position === "below" ? "top-full mt-2" : "bottom-full mb-2"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {session.user.name}
            </p>
            <p className="truncate text-xs text-light-text">
              {session.user.email}
            </p>
          </div>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-light-text">
              {t("yourBusinesses")}
            </p>
            <Link
              href="/dashboard"
              onClick={() => setIsProfileMenuOpen(false)}
              className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline"
            >
              {t("manageAll")}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {SAMPLE_USER_SHOPS.map((shop, i) => (
              <Link
                key={shop.id}
                href="/dashboard"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-text hover:bg-background"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {shop.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{shop.name}</span>
                {shop.verified && (
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
                {i === 0 && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {t("active")}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/business/new"
              onClick={() => setIsProfileMenuOpen(false)}
              className="mt-1.5 flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 px-2 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("createBusinessProfile")}
            </Link>
          </div>
        </div>

        <div className="py-1">
          <Link
            href="/dashboard"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <User className="h-4 w-4 text-light-text" />
            {t("viewProfile")}
          </Link>

          <Link
            href="/dashboard/ads"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <Package className="h-4 w-4 text-light-text" />
            {t("myListings")}
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <Heart className="h-4 w-4 text-premium" />
            {t("savedItems")}
            {wishlistCount > 0 && (
              <span className="ml-auto rounded-full bg-premium px-1.5 py-0.5 text-xs text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/messages"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            {t("messages")}
            {unreadMessagesTotal > 0 && (
              <span className="ml-auto rounded-full bg-premium px-1.5 py-0.5 text-xs text-white">
                {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <Settings className="h-4 w-4 text-light-text" />
            {t("editProfile")}
          </Link>
        </div>
        <div className="border-t border-border py-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-premium hover:bg-background"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-40 border-b border-border bg-surface text-text transition-colors duration-300 dark:bg-[#0c1422] ${
          onListingPage ? "hidden md:block" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex flex-shrink-0 flex-col justify-center"
            >
              <Image
                src="/logo.webp"
                alt="SLMarket.lk"
                width={760}
                height={147}
                priority
                className="relative -top-1.25 h-7 w-auto sm:h-8"
              />
              <span className="hidden -mt-0.5 text-[10px] font-medium italic text-light-text lg:block">
                {t("tagline")}
              </span>
            </Link>

            {/* Center nav (tablet — a condensed row: no Deals) */}
            <div className="hidden items-center gap-2.5 md:flex lg:hidden">
              <button
                type="button"
                onClick={openCatModal}
                className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <LayoutGrid className="h-4 w-4" />
                {t("categories")}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <Link
                href="/businesses"
                className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <Store className="h-4 w-4" />
                {t("businesses")}
              </Link>
              <Link
                href="/help/contact"
                className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <HelpCircle className="h-4 w-4" />
                {t("help")}
              </Link>
            </div>

            {/* Center nav (desktop) */}
            <div className="hidden items-center gap-5 lg:flex lg:gap-7">
              <button
                type="button"
                onClick={openCatModal}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <LayoutGrid className="h-4 w-4" />
                {t("categories")}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <Link
                href="/ads/deals"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <Tag className="h-4 w-4" />
                {t("deals")}
              </Link>
              <Link
                href="/businesses"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <Store className="h-4 w-4" />
                {t("businesses")}
              </Link>
              <Link
                href="/help/contact"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <HelpCircle className="h-4 w-4" />
                {t("help")}
              </Link>
            </div>

            {/* Right cluster (tablet) */}
            <div className="hidden items-center gap-1 md:flex lg:hidden">
              <LanguageSwitcher compact />

              <button
                onClick={changeTheme}
                aria-label={t("toggleDarkMode")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background hover:text-primary"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {session?.user && (
                <div className="relative" ref={tabletNotificationsRef}>
                  <button
                    onClick={toggleNotificationsPanel}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background hover:text-primary"
                    aria-label={t("notifications")}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsTotal > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-premium text-[10px] text-white">
                        {unreadNotificationsTotal > 9
                          ? "9+"
                          : unreadNotificationsTotal}
                      </span>
                    )}
                  </button>
                  {isNotificationsPanelOpen && <NotificationsDropdown />}
                </div>
              )}

              {session?.user && (
                <Link
                  href="/post-ad"
                  className="btn-solid flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {t("postAd")}
                </Link>
              )}

              <div className="mx-0.5 h-5 w-px bg-border" />

              {session?.user ? (
                <div className="relative" ref={tabletProfileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/15"
                    aria-label={t("accountMenu")}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {isProfileMenuOpen && renderProfileDropdown("below")}
                </div>
              ) : (
                <div className="flex items-center gap-0.5">
                  <Link
                    href="/login"
                    className="whitespace-nowrap px-1.5 py-1.5 text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="btn-outline whitespace-nowrap rounded-xl px-2 py-2 text-sm font-semibold"
                  >
                    {t("register")}
                  </Link>
                  <Link
                    href="/post-ad"
                    aria-label={t("postFreeAd")}
                    className="btn-solid flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right cluster (desktop) */}
            <div className="hidden items-center gap-2 lg:flex">
              <LanguageSwitcher />

              <button
                onClick={changeTheme}
                aria-label={t("toggleDarkMode")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background hover:text-primary"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {session?.user && (
                <>
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={toggleNotificationsPanel}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background hover:text-primary"
                      aria-label={t("notifications")}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotificationsTotal > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-premium text-[10px] text-white">
                          {unreadNotificationsTotal > 9
                            ? "9+"
                            : unreadNotificationsTotal}
                        </span>
                      )}
                    </button>
                    {isNotificationsPanelOpen && <NotificationsDropdown />}
                  </div>
                </>
              )}

              {session?.user && (
                <Link
                  href="/post-ad"
                  className="btn-solid flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {t("postAd")}
                </Link>
              )}

              <div className="mx-1 h-5 w-px bg-border" />

              {session?.user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-background"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-light-text transition-transform ${
                        isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isProfileMenuOpen && renderProfileDropdown("below")}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="whitespace-nowrap px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="btn-outline whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    {t("register")}
                  </Link>
                  <Link
                    href="/post-ad"
                    className="btn-solid flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    {t("postFreeAd")}
                  </Link>
                </div>
              )}
            </div>

            {/* Right cluster (mobile) — Chats/Account/Favourites now live
                in the bottom tab bar, so this stays a slim search +
                secondary-links trigger. */}
            <div className="flex items-center gap-0.5 md:hidden sm:gap-1">
              <Link
                href="/ads"
                aria-label={t("searchPlaceholder")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background"
              >
                <Search className="h-5 w-5" />
              </Link>

              <button
                onClick={() => {
                  setIsMenuOpen((prev) => !prev);
                  setIsProfileMenuOpen(false);
                }}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-text hover:bg-background focus:outline-none"
                aria-label={t("toggleMenu")}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            MOBILE MENU
            ==================================================== */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="space-y-1 border-t border-border bg-background px-3 pb-6 pt-3 dark:bg-[#0c1422]">
            {/* Preferences */}
            <div className="mb-2 flex items-center justify-between border-b border-border px-2 pb-3">
              <span className="text-sm font-medium text-text">
                {t("language")}
              </span>
              <LanguageSwitcher />
            </div>
            <div className="mb-2 flex items-center justify-between border-b border-border px-2 pb-3">
              <span className="text-sm font-medium text-text">
                {t("darkMode")}
              </span>
              <button
                onClick={changeTheme}
                role="switch"
                aria-checked={isDarkMode}
                aria-label={t("toggleDarkMode")}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
                  isDarkMode ? "bg-slate-700" : "bg-primary/15"
                }`}
              >
                <span
                  className={`absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-transform ${
                    isDarkMode ? "translate-x-7" : "translate-x-0"
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </span>
              </button>
            </div>

            {/* Categories accordion */}
            <p className="px-2 pt-1 text-xs font-semibold uppercase tracking-wider text-light-text">
              {t("categories")}
            </p>
            <Link
              href="/ads"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-primary hover:bg-surface"
            >
              <LayoutGrid className="h-4 w-4 flex-shrink-0" />
              {t("megaMenu.allListings")}
            </Link>
            {categories.map((category) => {
              const Icon = categoryIcon(category.icon);
              const isOpen = expandedMobileCat === category.id;
              return (
                <div key={category.id}>
                  <button
                    onClick={() =>
                      setExpandedMobileCat(isOpen ? null : category.id)
                    }
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium ${
                      isOpen
                        ? "bg-surface text-text"
                        : "text-light-text hover:bg-surface"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="flex-1 text-left">
                      {tCategories(`${category.id}.name`)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-9 mt-1 space-y-0.5">
                      <Link
                        href={category.href}
                        onClick={closeMobileMenu}
                        className="block rounded-md px-2 py-2 text-sm font-semibold text-primary hover:bg-surface"
                      >
                        {t("megaMenu.viewAllPrefix")}{" "}
                        {tCategories(`${category.id}.name`)}
                      </Link>
                      {category.subcategories.map((subcat) => (
                        <Link
                          key={subcat.id}
                          href={subcat.href}
                          onClick={closeMobileMenu}
                          className="block rounded-md px-2 py-2 text-sm text-light-text hover:bg-surface"
                        >
                          {tCategories(
                            `${category.id}.subcategories.${subcat.id}`,
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick links */}
            <div className="mt-3 space-y-0.5 border-t border-border pt-3">
              <Link
                href="/ads/deals"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
              >
                <Tag className="h-4 w-4 text-primary" />
                {t("deals")}
              </Link>
              <Link
                href="/businesses"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
              >
                <Store className="h-4 w-4 text-primary" />
                {t("businesses")}
              </Link>
              <Link
                href="/help/contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                {t("help")}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating message button — desktop/tablet only; mobile uses the
            bottom tab bar's Chats tab instead. */}
        {session?.user && (
          <div
            className="fixed bottom-6 right-6 z-[100] hidden md:block"
            ref={messagesRef}
          >
            <button
              onClick={toggleMessagesPopover}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-dark"
              aria-label={t("messages")}
            >
              <MessageCircle className="h-7 w-7" />
              {unreadMessagesTotal > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-premium text-xs text-white">
                  {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                </span>
              )}
            </button>
            {isMessagesPopoverOpen && <MessagesPopover />}
          </div>
        )}
      </nav>

      {/* ======================================================
          MOBILE BOTTOM TAB BAR — the real mobile nav: Chats,
          Account and Favourites all live here instead of the top
          bar, so nothing is duplicated between the two.
          ====================================================== */}
      <nav
        aria-label="Mobile navigation"
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-200 dark:bg-[#0c1422] md:hidden ${
          hideBottomNav && !isBottomAccountOpen ? "translate-y-full" : ""
        }`}
      >
        <div className="grid grid-cols-5 items-end">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              pathname === "/" ? "text-primary" : "text-light-text"
            }`}
          >
            <Home className="h-5 w-5" />
            {t("bottomNav.home")}
          </Link>

          <Link
            href="/ads"
            aria-current={pathname.startsWith("/ads") ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              pathname.startsWith("/ads") ? "text-primary" : "text-light-text"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            {t("bottomNav.browse")}
          </Link>

          <Link
            href="/post-ad"
            aria-label={t("bottomNav.post")}
            className="flex flex-col items-center gap-0.5 py-1.5"
          >
            <span className="btn-solid flex h-11 w-11 -translate-y-2 items-center justify-center rounded-full shadow-lg">
              <Plus className="h-5 w-5" />
            </span>
          </Link>

          <Link
            href="/messages"
            aria-current={pathname.startsWith("/messages") ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              pathname.startsWith("/messages")
                ? "text-primary"
                : "text-light-text"
            }`}
          >
            <span className="relative">
              <MessageCircle className="h-5 w-5" />
              {unreadMessagesTotal > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-premium text-[9px] text-white">
                  {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                </span>
              )}
            </span>
            {t("bottomNav.chats")}
          </Link>

          <div className="relative" ref={bottomAccountRef}>
            <button
              type="button"
              onClick={() => setIsBottomAccountOpen((prev) => !prev)}
              aria-expanded={isBottomAccountOpen}
              className={`flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isBottomAccountOpen ||
                pathname.startsWith("/dashboard") ||
                pathname.startsWith("/account")
                  ? "text-primary"
                  : "text-light-text"
              }`}
            >
              <User className="h-5 w-5" />
              {t("bottomNav.account")}
            </button>

            {isBottomAccountOpen &&
              (session?.user ? (
                renderProfileDropdown("above")
              ) : (
                <div className="absolute bottom-full right-0 z-50 mb-2 w-64 space-y-3 rounded-xl border border-border bg-surface p-4 shadow-lg dark:bg-[#111d30]">
                  <p className="text-xs text-light-text">
                    {t("bottomNav.guestPrompt")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsBottomAccountOpen(false)}
                      className="btn-outline flex-1 rounded-xl py-2 text-center text-sm font-semibold"
                    >
                      {t("signIn")}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsBottomAccountOpen(false)}
                      className="btn-solid flex-1 rounded-xl py-2 text-center text-sm font-semibold"
                    >
                      {t("register")}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="flex items-center gap-1.5 text-sm text-text">
                      <Languages className="h-4 w-4 text-primary" />
                      {t("language")}
                    </span>
                    <LanguageSwitcher />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </nav>

      {/* ======================================================
          BROWSE CATEGORIES MODAL
          ====================================================== */}
      {isCatModalOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => closeCatModal()}
          />
          <div
            ref={catModalRef}
            className="fixed left-1/2 top-20 z-[70] max-h-[82vh] w-[94vw] max-w-5xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl dark:bg-[#111d30] sm:top-24"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-sm font-bold text-text">
                  {t("megaMenu.title")}
                </h2>
                <p className="text-xs text-light-text">
                  {t("megaMenu.subtitle")}
                </p>
              </div>
              <button
                onClick={() => closeCatModal()}
                aria-label={t("toggleMenu")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-light-text hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex max-h-[calc(82vh-118px)] flex-col lg:h-[440px] lg:flex-row">
              {/* Rail */}
              <div className="w-full flex-shrink-0 overflow-y-auto border-b border-border p-2 lg:w-56 lg:border-b-0 lg:border-r">
                <Link
                  href="/ads"
                  onClick={() => closeCatModal()}
                  className="mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-transparent px-3 py-2.5 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">
                    {t("megaMenu.allListings")}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                </Link>
                {categories.map((category) => {
                  const Icon = categoryIcon(category.icon);
                  const isActive = activeCat === category.id;
                  return (
                    <button
                      key={category.id}
                      onMouseEnter={() => hoverCat(category.id)}
                      onClick={() => setActiveCat(category.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-transparent text-text hover:bg-background"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate">
                        {tCategories(`${category.id}.name`)}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-light-text" />
                    </button>
                  );
                })}
              </div>

              {/* Subcategories */}
              <div className="w-full flex-shrink-0 overflow-y-auto border-b border-border p-5 lg:w-[360px] lg:border-b-0 lg:border-r">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                  {t("megaMenu.explorePrefix")}{" "}
                  {activeCategory && tCategories(`${activeCategory.id}.name`)}
                </p>
                <ul className="space-y-0.5 sm:columns-2 sm:gap-x-4 lg:columns-1">
                  {activeSubcats.map((subcat) => (
                    <li key={subcat.id} className="break-inside-avoid">
                      <Link
                        href={subcat.href}
                        onClick={() => closeCatModal()}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text transition-colors hover:bg-background hover:text-primary"
                      >
                        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-light-text group-hover:bg-primary" />
                        <span className="flex-1 truncate">
                          {tCategories(
                            `${activeCategory?.id}.subcategories.${subcat.id}`,
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {activeCategory && (
                  <Link
                    href={activeCategory.href}
                    onClick={() => closeCatModal()}
                    className="mt-3 inline-flex items-center gap-1 px-2 text-sm font-semibold text-primary hover:underline"
                  >
                    {t("megaMenu.viewAllPrefix")}{" "}
                    {tCategories(`${activeCategory.id}.name`)}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* Promo rail */}
              {activeAd && (
                <div className="hidden flex-1 flex-col overflow-hidden lg:flex">
                  <Link
                    href={activeAd.href}
                    onClick={() => closeCatModal()}
                    className="group relative block min-h-0 flex-1"
                  >
                    <Image
                      src={activeAd.image}
                      alt={activeAd.title}
                      fill
                      sizes="360px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                      {t("megaMenu.sponsored")}
                    </span>
                    {adSlides.length > 1 && (
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        {adSlides.map((slide, i) => (
                          <span
                            key={slide.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setAdIndex(i);
                            }}
                            className={`h-1.5 cursor-pointer rounded-full transition-all ${
                              i === adIndex
                                ? "w-6 bg-white"
                                : "w-1.5 bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-snug text-white">
                        {activeAd.title}
                      </h3>
                      {activeAd.subtitle && (
                        <p className="line-clamp-2 text-xs text-white/80">
                          {activeAd.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                  <Link
                    href={activeAd.href}
                    onClick={() => closeCatModal()}
                    className="flex flex-shrink-0 items-center justify-center gap-1.5 border-t border-border bg-primary py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    {activeAd.cta ?? t("megaMenu.viewListing")}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Popular searches */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
              <span className="text-xs font-medium text-light-text">
                {t("megaMenu.popularSearches")}:
              </span>
              {POPULAR_SEARCHES.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  onClick={() => closeCatModal()}
                  className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-light-text transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
