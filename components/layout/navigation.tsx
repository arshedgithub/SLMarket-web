"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Search,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  Store,
  Settings,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Heart,
  LayoutGrid,
  HelpCircle,
  Tag,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { categoryIcon } from "@/config/const/categoryIcons";
import { useCategoryModalStore } from "@/store/categoryModalStore";
import { useThemeStore } from "@/store/themeStore";
import { useTheme } from "next-themes";
import { USER_ROLES } from "@/types/enums/role.enum";
import { useSellerCta } from "@/hooks/useSellerCta";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useMessagingStore } from "@/store/messagingStore";
import MessagesPopover from "@/components/messaging/MessagesPopover";
import NotificationsDropdown from "@/components/messaging/NotificationsDropdown";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import type { MegaMenuAdSlide } from "@/lib/getMegaMenuAds";

// Static "popular searches" shown in the category modal footer. These are
// search queries, not categories, so they live here rather than in the
// category config.
const POPULAR_SEARCHES = [
  { label: "Toyota Aqua", href: "/search?q=Toyota%20Aqua" },
  {
    label: "House for rent Colombo",
    href: "/search?q=house%20for%20rent%20Colombo",
  },
  { label: "iPhone", href: "/search?q=iPhone" },
  { label: "Land for sale", href: "/search?q=land%20for%20sale" },
  { label: "Part time jobs", href: "/search?q=part%20time%20jobs" },
];

export default function Navigation({
  megaMenuAds,
}: {
  megaMenuAds?: MegaMenuAdSlide[];
}) {
  const t = useTranslations("nav");
  const tCategories = useTranslations("categories");
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isCatModalOpen = useCategoryModalStore((s) => s.isOpen);
  const openCatModalStore = useCategoryModalStore((s) => s.open);
  const closeCatModal = useCategoryModalStore((s) => s.close);
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");
  const [adIndex, setAdIndex] = useState(0);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(
    null,
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const catModalRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const tabletProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const catHoverTimeout = useRef<NodeJS.Timeout | null>(null);

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
    [notificationsRef, mobileNotificationsRef],
    closeNotificationsPanel,
  );
  useOutsideClick([messagesRef], closeMessagesPopover);

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

  const changeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toggleDarkMode();
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search results page isn't wired yet.
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

  const { href: sellHref } = useSellerCta();
  const wishlistCount = 0;

  const activeCategory = categories.find((c) => c.id === activeCat);
  const activeSubcats = activeCategory?.subcategories ?? [];

  /* ============================================================
     PROFILE DROPDOWN (shared desktop + mobile)
     ============================================================ */

  const profileDropdownContent = session?.user && (
    <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg dark:bg-[#111d30]">
      <div className="border-b border-border px-4 py-3">
        <p className="truncate text-sm font-semibold text-text">
          {session.user.name}
        </p>
        <p className="truncate text-xs text-light-text">{session.user.email}</p>
      </div>
      <div className="py-1">
        {session.user.role === USER_ROLES.SELLER ? (
          <Link
            href="/dashboard"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <LayoutDashboard className="h-4 w-4 text-light-text" />
            {t("sellerDashboard")}
          </Link>
        ) : (
          <Link
            href="/seller-registration"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-primary hover:bg-background"
          >
            <Store className="h-4 w-4" />
            {t("startSelling")}
          </Link>
        )}

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

  /* ============================================================
     SEARCH PILL (desktop non-home + mobile)
     ============================================================ */

  const searchPill = (autoFocus = false) => (
    <form
      onSubmit={handleSearchSubmit}
      className="flex w-full items-stretch overflow-hidden rounded-full border border-border bg-background transition-shadow focus-within:ring-2 focus-within:ring-primary/30"
    >
      <div className="relative flex flex-shrink-0 items-center border-r border-border">
        <select
          aria-label={t("allCategories")}
          defaultValue=""
          className="max-w-[92px] cursor-pointer appearance-none truncate bg-transparent py-2 pl-3 pr-7 text-sm font-medium text-text focus:outline-none lg:max-w-[150px]"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {tCategories(`${category.id}.name`)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-light-text" />
      </div>
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={searchQuery}
        autoFocus={autoFocus}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-text placeholder:text-light-text focus:outline-none"
      />
      <button
        type="submit"
        aria-label={t("searchPlaceholder")}
        className="market-primary flex w-11 flex-shrink-0 items-center justify-center"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border bg-surface text-text transition-colors duration-300 dark:bg-[#0c1422]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex flex-shrink-0 items-center">
              <Image
                src="/logo.webp"
                alt="SLMarket.lk"
                width={760}
                height={147}
                priority
                className="h-7 w-auto sm:h-8"
              />
            </Link>

            {/* Center nav (tablet — a condensed row: no Deals, short Sell label) */}
            <div className="hidden items-center gap-4 md:flex lg:hidden">
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
                href={sellHref}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <Store className="h-4 w-4" />
                {t("sell")}
              </Link>
              <Link
                href="/help-center/contact"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
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
                href="/deals"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <Tag className="h-4 w-4" />
                {t("deals")}
              </Link>
              <Link
                href={sellHref}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <Store className="h-4 w-4" />
                {t("sellWithUs")}
              </Link>
              <Link
                href="/help-center/contact"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                <HelpCircle className="h-4 w-4" />
                {t("help")}
              </Link>
            </div>

            {/* Right cluster (tablet) */}
            <div className="hidden items-center gap-2 md:flex lg:hidden">
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

              <div className="mx-1 h-5 w-px bg-border" />

              {session?.user ? (
                <div className="relative" ref={tabletProfileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/15"
                    aria-label={t("accountMenu")}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {isProfileMenuOpen && profileDropdownContent}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/login"
                    className="whitespace-nowrap px-2 py-1.5 text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="btn-solid whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold"
                  >
                    {t("register")}
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
                  <Link
                    href="/wishlist"
                    aria-label={t("savedItems")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background hover:text-primary"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>

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
                    <span className="hidden max-w-[110px] truncate text-sm font-semibold text-text lg:block">
                      {session.user.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-light-text transition-transform ${
                        isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isProfileMenuOpen && profileDropdownContent}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/login"
                    className="whitespace-nowrap px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="btn-solid whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>

            {/* Right cluster (mobile) */}
            <div className="flex items-center gap-0.5 md:hidden sm:gap-1">
              <button
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background"
                aria-label={t("searchPlaceholder")}
                aria-expanded={isMobileSearchOpen}
              >
                {isMobileSearchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>

              {session?.user && (
                <div className="relative" ref={mobileNotificationsRef}>
                  <button
                    onClick={toggleNotificationsPanel}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-light-text transition-colors hover:bg-background"
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
                <div className="relative" ref={mobileProfileMenuRef}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen((prev) => !prev);
                      closeMobileMenu();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-label={t("accountMenu")}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {isProfileMenuOpen && profileDropdownContent}
                </div>
              )}

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

          {/* Desktop search, only off the homepage (homepage hero has its own) */}
          {!isHomePage && (
            <div className="hidden pb-3 md:block">
              <div className="mx-auto max-w-2xl">{searchPill()}</div>
            </div>
          )}

          {/* Mobile expandable search */}
          {isMobileSearchOpen && (
            <div className="pb-3 md:hidden">{searchPill(true)}</div>
          )}
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
                href="/deals"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
              >
                <Tag className="h-4 w-4 text-primary" />
                {t("deals")}
              </Link>
              <Link
                href={sellHref}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
              >
                <Store className="h-4 w-4 text-primary" />
                {t("sellWithUs")}
              </Link>
              <Link
                href="/help-center/contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                {t("help")}
              </Link>
            </div>

            {/* Account */}
            <div className="mt-3 border-t border-border pt-3">
              {session?.user ? (
                <div className="space-y-0.5">
                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
                  >
                    <Heart className="h-4 w-4 text-premium" />
                    {t("savedItems")}
                  </Link>
                  <Link
                    href="/messages"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
                  >
                    <MessageCircle className="h-4 w-4 text-primary" />
                    {t("messages")}
                  </Link>
                  {session.user.role === USER_ROLES.SELLER ? (
                    <Link
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
                    >
                      <LayoutDashboard className="h-4 w-4 text-light-text" />
                      {t("sellerDashboard")}
                    </Link>
                  ) : (
                    <Link
                      href="/seller-registration"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-primary hover:bg-surface"
                    >
                      <Store className="h-4 w-4" />
                      {t("startSelling")}
                    </Link>
                  )}
                  <Link
                    href="/dashboard/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-light-text hover:bg-surface"
                  >
                    <Settings className="h-4 w-4 text-light-text" />
                    {t("editProfile")}
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-premium hover:bg-surface"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="btn-outline flex-1 rounded-full py-2.5 text-center text-sm font-semibold"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="btn-solid flex-1 rounded-full py-2.5 text-center text-sm font-semibold"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating message button */}
        {session?.user && (
          <div className="fixed bottom-6 right-6 z-[100]" ref={messagesRef}>
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
