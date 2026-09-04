"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  Gem,
  Diamond,
  Layers,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
  Gavel,
  Sparkles,
  Crown,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
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

// Icon per top-level category for the "Browse Categories" modal's left rail
// — the config data has no icon field (it's shared with the mobile menu,
// which uses photo thumbnails instead), so it's mapped here by id.
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  gems: Gem,
  jewellery: Diamond,
  "precious-metals": Layers,
  services: Settings,
  sellers: Store,
};

// Premium ad rail in the mega-menu's third column — no ad-serving system
// exists yet, so this rotates through a few curated gem highlights built
// from the same category images used elsewhere, styled as a single
// full-bleed image with the copy overlaid directly on it (not a listing
// card) per the brand mockup.
// Last-resort fallback when there's neither a real boosted listing nor a
// premium shop to show — same slide shape as MegaMenuAdSlide (minus the
// server-only eyebrow-type distinction) so the render code doesn't need to
// branch on which source it came from.
const PREMIUM_AD_SLIDES = [
  {
    key: "sapphire",
    image: "/images/categories/gems/sapphire.webp",
    eyebrow: "Timeless. Rare. Exquisite.",
    title: "Royal Blue Sapphire",
    description:
      "A hand-selected Ceylon sapphire prized for its saturated cornflower blue and exceptional clarity.",
    href: "/gems?type=sapphire",
    categoryId: "gems" as const,
    categoryHref: "/gems",
  },
  {
    key: "ruby",
    image: "/images/categories/gems/ruby.png",
    eyebrow: "Bold. Vivid. Unmistakable.",
    title: "Vivid Ceylon Ruby",
    description:
      "A richly saturated ruby with excellent transparency, cut to maximise brilliance and fire.",
    href: "/gems?type=ruby",
    categoryId: "gems" as const,
    categoryHref: "/gems",
  },
  {
    key: "emerald",
    image: "/images/categories/gems/emerald.png",
    eyebrow: "Lush. Deep. Enduring.",
    title: "Colombian Emerald",
    description:
      "A deep green emerald with classic garden inclusions, the hallmark of a natural, untreated stone.",
    href: "/gems?type=emerald",
    categoryId: "gems" as const,
    categoryHref: "/gems",
  },
] as const;

const MEGA_MENU_QUICK_LINKS = [
  { key: "trending", icon: TrendingUp, href: "/gems" },
  { key: "verifiedSellers", icon: ShieldCheck, href: "/sellers" },
  { key: "rareAuctions", icon: Gavel, href: "/gems" },
  { key: "newlyListed", icon: Sparkles, href: "/gems" },
  { key: "certifiedGems", icon: BadgeCheck, href: "/gems" },
  { key: "premiumDealers", icon: Crown, href: "/sellers" },
] as const;

export default function Navigation({
  megaMenuAds,
}: {
  megaMenuAds?: MegaMenuAdSlide[];
}) {
  const t = useTranslations("nav");
  const tCategories = useTranslations("categories");
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState("gems");
  const [adSlideIndex, setAdSlideIndex] = useState(0);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Real boosted listings take priority (that's what sellers paid a boost
  // for); premium shops with priority reach are the fallback; the static
  // gem highlights only show if neither exists yet.
  const adSlideCount =
    megaMenuAds && megaMenuAds.length > 0
      ? megaMenuAds.length
      : PREMIUM_AD_SLIDES.length;

  // Auto-advance the mega-menu's premium ad rail only while the menu (and
  // therefore the carousel) is actually visible — no point ticking a
  // hidden slideshow in the background.
  useEffect(() => {
    if (activeCategory !== "allCategories") return;
    const id = setInterval(() => {
      setAdSlideIndex((prev) => (prev + 1) % adSlideCount);
    }, 4500);
    return () => clearInterval(id);
  }, [activeCategory, adSlideCount]);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

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

  // Close dropdowns when clicking outside. The desktop and mobile bells
  // render simultaneously (just CSS-hidden at different breakpoints), so
  // that one passes both refs — closing only fires once the click is
  // outside whichever of the two is actually visible.
  useOutsideClick([categoryMenuRef], () => setActiveCategory(null));
  useOutsideClick([profileMenuRef, mobileProfileMenuRef], () =>
    setIsProfileMenuOpen(false),
  );
  useOutsideClick(
    [notificationsRef, mobileNotificationsRef],
    closeNotificationsPanel,
  );
  useOutsideClick([messagesRef], closeMessagesPopover);

  const changeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toggleDarkMode();
    console.log(
      "zustand theme: ",
      toggleDarkMode,
      "ThemeProvider theme: ",
      theme,
    );
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Search for:", searchQuery);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      if (next) setIsProfileMenuOpen(false);
      return next;
    });
  };

  const toggleMobileProfileMenu = () => {
    setIsProfileMenuOpen((prev) => {
      const next = !prev;
      if (next) closeMobileMenu();
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setActiveCategory((prev) => {
      if (prev === category) return null;
      if (category === "allCategories") setHoveredCategory("gems");
      return category;
    });
  };

  const closeDropdown = () => {
    setActiveCategory(null);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setExpandedMobileCategory(null);
  };

  const toggleMobileCategory = (categoryId: string) => {
    if (expandedMobileCategory === categoryId) {
      setExpandedMobileCategory(null);
    } else {
      setExpandedMobileCategory(categoryId);
    }
  };

  const handleCategoryHover = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(categoryId);
    }, 100);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    // No redirectTo would default to the current page (window.location.href)
    // — on a protected page like /dashboard, that meant logging out just
    // landed you right back where middleware would otherwise have to
    // re-redirect you away from. Send straight to a safe public page.
    signOut({ redirectTo: "/" });
  };

  // "Start Selling" / "Seller Dashboard" link — shared with Footer and About
  // so the href/label rule lives in one place (lib/seller-cta.ts). Guests
  // land on /seller-registration too; proxy.ts redirects them to /login.
  const { isSeller, href: sellHref, labelKey: sellLabelKey } = useSellerCta();
  const sellLabel = t(sellLabelKey);

  // TODO: wire to real wishlist count once the wishlist API exists
  const wishlistCount = 0;

  // Resolve dynamic href/name for subcategory items that depend on auth state.
  // "sellers > new" = "Become a Seller" for guests/buyers, "New Listing" for sellers.
  const resolveSubcat = (
    catId: string,
    subcat: { id: string; name: string; href: string },
  ) => {
    const name = tCategories(`${catId}.subcategories.${subcat.id}`);
    if (catId === "sellers" && subcat.id === "new") {
      if (isSeller)
        return { href: "/dashboard/listings/new", name: t("newListing") };
      if (!session?.user)
        return { href: "/login?next=/seller-registration", name };
    }
    return { href: subcat.href, name };
  };

  // "allCategories" is the full Browse Categories modal: a category rail,
  // the hovered category's subcategories (+ a help box), and a premium ad
  // rail — every other top-level nav item (Gems, Jewellery, Precious
  // Metals, Services) reuses the simpler subcategory-grid layout below via
  // renderCategoryFlyout instead.
  const resolvedAdSlides =
    megaMenuAds && megaMenuAds.length > 0
      ? megaMenuAds.map((slide) => ({
          key: slide.key,
          image: slide.image,
          eyebrowText: t(`megaMenu.adEyebrow.${slide.eyebrow}`),
          title: slide.title,
          description: slide.description,
          href: slide.href,
          ctaText:
            slide.eyebrow === "boostedListing"
              ? t("megaMenu.viewListing")
              : t("megaMenu.visitShop"),
          categoryLabel: `${t("megaMenu.browseCategory")} ${tCategories(`${slide.categoryId}.name`)}`,
          categoryHref: slide.categoryHref,
        }))
      : PREMIUM_AD_SLIDES.map((slide) => ({
          key: slide.key,
          image: slide.image,
          eyebrowText: slide.eyebrow,
          title: slide.title,
          description: slide.description,
          href: slide.href,
          ctaText: t("megaMenu.viewListing"),
          categoryLabel: `${t("megaMenu.browseCategory")} ${tCategories(`${slide.categoryId}.name`)}`,
          categoryHref: slide.categoryHref,
        }));
  const activeAdSlide =
    resolvedAdSlides[adSlideIndex % resolvedAdSlides.length];
  const hoveredCategoryData = categories.find((c) => c.id === hoveredCategory);

  const subcatCount = hoveredCategoryData?.subcategories.length ?? 0;
  // Beyond ~8 items a single column runs past the fixed modal height, so it
  // splits into two CSS columns instead of scrolling — the reserved width
  // stays constant either way (see the fixed lg:w-[380px] below) so this
  // never changes the modal's footprint.
  const subcatNeedsSplit = subcatCount > 8;

  const allCategoriesFlyout = (
    <div className="flex flex-col p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:h-[520px] lg:min-h-0">
        {/* Column 1 — top-level category rail */}
        <div className="w-full lg:w-48 flex-shrink-0 border-b border-border pb-4 mb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:mb-0 lg:pr-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] ?? Gem;
            const isActive = hoveredCategory === category.id;
            return (
              <button
                key={category.id}
                onMouseEnter={() => handleCategoryHover(category.id)}
                onClick={() => handleCategoryHover(category.id)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-gold bg-gold/10 text-gold-hover dark:text-gold-champagne"
                    : "border-transparent text-text hover:bg-background"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 font-medium">
                  {tCategories(`${category.id}.name`)}
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-light-text" />
              </button>
            );
          })}

          <div className="mt-4 rounded-lg bg-gold/10 p-3.5">
            <Gem className="h-5 w-5 text-gold-hover dark:text-gold-champagne mb-1.5" />
            <p className="text-sm font-semibold text-text">
              {t("megaMenu.notSureTitle")}
            </p>
            <p className="text-xs text-light-text mt-0.5 mb-2">
              {t("megaMenu.notSureDesc")}
            </p>
            <Link
              href="/help-center/contact"
              onClick={closeDropdown}
              className="text-xs font-semibold text-gold-hover dark:text-gold-champagne hover:underline inline-flex items-center gap-1"
            >
              {t("megaMenu.contactExperts")}{" "}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Column 2 — hovered category's subcategories. Width is fixed
            regardless of item count (so switching categories never
            resizes the modal); categories with more than ~8 subcategories
            flow into a second CSS column instead of scrolling. */}
        <div className="w-full lg:w-[380px] flex-shrink-0 border-b border-border pb-4 mb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:mb-0 lg:px-4 lg:h-full lg:overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-hover dark:text-gold-champagne mb-3">
            {t("megaMenu.explorePrefix")}{" "}
            {hoveredCategoryData &&
              tCategories(`${hoveredCategoryData.id}.name`)}
          </p>
          <ul
            className={`space-y-0.5 ${subcatNeedsSplit ? "lg:columns-2 lg:gap-x-4" : ""}`}
          >
            {hoveredCategoryData?.subcategories.map((subcat) => {
              const resolved = resolveSubcat(hoveredCategory, subcat);
              return (
                <li key={subcat.id} className="break-inside-avoid">
                  <Link
                    href={resolved.href}
                    onClick={closeDropdown}
                    className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-text hover:bg-background hover:text-gold-hover dark:hover:text-gold-champagne transition-colors"
                  >
                    <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded skeleton-shimmer">
                      <Image
                        src={subcat.image}
                        alt=""
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                    <span className="flex-1 truncate">{resolved.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-light-text opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              );
            })}
          </ul>
          {hoveredCategoryData && (
            <Link
              href={hoveredCategoryData.subcategories[0]?.href ?? "/"}
              onClick={closeDropdown}
              className="mt-2 inline-flex items-center gap-1 px-2 text-sm font-semibold text-gold-hover dark:text-gold-champagne hover:underline"
            >
              {t("megaMenu.viewAllPrefix")}{" "}
              {tCategories(`${hoveredCategoryData.id}.name`)}{" "}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Column 3 — premium ad rail. Fills whatever width remains
            (flex-1) so there's never dead space on the right regardless of
            modal width. Real listing/shop copy with a clamped 2-line
            description, plus a dedicated two-button footer instead of
            floating text — reads as a card, not a stretched banner. */}
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col h-64 lg:h-full rounded-xl overflow-hidden border border-border lg:ml-4">
          <Link
            href={activeAdSlide.href}
            onClick={closeDropdown}
            className="group relative block flex-1 min-h-0"
          >
            <Image
              src={activeAdSlide.image}
              alt={activeAdSlide.title}
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute top-3 left-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold-champagne">
              {activeAdSlide.eyebrowText}
            </span>
            {resolvedAdSlides.length > 1 && (
              <div className="absolute top-3 right-3 flex gap-1.5">
                {resolvedAdSlides.map((slide, i) => (
                  <span
                    key={slide.key}
                    onClick={(e) => {
                      e.preventDefault();
                      setAdSlideIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === adSlideIndex ? "w-6 bg-gold" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-lg font-bold text-white leading-snug mb-1 line-clamp-2">
                {activeAdSlide.title}
              </h3>
              {activeAdSlide.description && (
                <p className="text-xs text-white/80 line-clamp-2">
                  {activeAdSlide.description}
                </p>
              )}
            </div>
          </Link>
          <div className="flex flex-shrink-0 divide-x divide-border border-t border-border bg-surface dark:bg-[#1a1d24]">
            <Link
              href={activeAdSlide.href}
              onClick={closeDropdown}
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-gold hover:bg-gold-hover transition-colors"
            >
              {activeAdSlide.ctaText} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={activeAdSlide.categoryHref}
              onClick={closeDropdown}
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-text hover:bg-background transition-colors"
            >
              {activeAdSlide.categoryLabel}{" "}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links row */}
      <div className="mt-4 grid grid-cols-3 lg:grid-cols-6 gap-2 border-t border-border pt-4">
        {MEGA_MENU_QUICK_LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            onClick={closeDropdown}
            className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-background transition-colors"
          >
            <link.icon className="h-5 w-5 flex-shrink-0 text-gold-hover dark:text-gold-champagne" />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-medium text-text truncate">
                {t(`megaMenu.quickLinks.${link.key}.title`)}
              </p>
              <p className="text-xs text-light-text truncate">
                {t(`megaMenu.quickLinks.${link.key}.subtitle`)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  const renderCategoryFlyout = (catId: string) => {
    if (catId === "allCategories") return allCategoriesFlyout;
    const category = categories.find((c) => c.id === catId);
    if (!category) return null;
    return (
      <div className="grid grid-cols-4 md:grid-cols-6 gap-6 py-4">
        {category.subcategories.map((subcat) => {
          const resolved = resolveSubcat(catId, subcat);
          return (
            <div key={subcat.id} className="flex flex-col items-center">
              <Link
                href={resolved.href}
                className="group"
                onClick={closeDropdown}
              >
                <div className="relative mb-2 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 group-hover:scale-105 skeleton-shimmer border-border group-hover:border-primary-light">
                  <Image
                    src={subcat.image}
                    alt={resolved.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              </Link>
              <Link
                href={resolved.href}
                className="text-center text-sm py-1 text-light-text hover:text-primary"
                onClick={closeDropdown}
              >
                {resolved.name}
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  // Top-level nav items for the category bar — the ones with subcategories
  // get a dropdown (reusing renderCategoryFlyout), Sellers/Deals/Collections
  // are direct links since there's nothing meaningful to expand into.
  const categoryNavItems = [
    { id: "gems", label: tCategories("gems.name") },
    { id: "jewellery", label: tCategories("jewellery.name") },
    { id: "precious-metals", label: tCategories("precious-metals.name") },
    { id: "services", label: tCategories("services.name") },
  ] as const;

  // Shared by the desktop and mobile profile triggers so the dropdown
  // markup (and its "Start Selling"/"Seller Dashboard" branching) isn't
  // duplicated between the two breakpoints.
  const profileDropdownContent = session?.user && (
    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden dark:bg-[#14161b] dark:border-[#2c2f36]">
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
            className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gold-hover hover:bg-background dark:text-gold-champagne"
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
          <MessageCircle className="h-4 w-4 text-gold-hover dark:text-gold-champagne" />
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

  return (
    <>
      <nav className="bg-surface text-text shadow-md transition-colors duration-300 dark:bg-[#0c0d10]">
        {/* Top bar with logo, search, and utilities */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/logo-nav-gold.png"
                alt="Lumevelo"
                width={1616}
                height={356}
                priority
                className="h-7 w-auto min-[375px]:h-8 sm:h-10"
              />
            </Link>

            {/* Search bar - always visible on desktop */}
            <div className="hidden md:flex flex-1 min-w-0 max-w-xl mx-4">
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full items-stretch rounded-full border border-border bg-background overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-primary/30"
              >
                <div className="relative flex flex-shrink-0 items-center border-r border-border">
                  <select
                    aria-label={t("allCategories")}
                    defaultValue=""
                    className="max-w-[90px] truncate appearance-none bg-transparent py-2 pl-3 pr-7 text-sm font-medium text-text focus:outline-none cursor-pointer lg:max-w-[140px]"
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-w-[48px] flex-1 bg-transparent px-4 py-2 text-sm text-text placeholder:text-light-text focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={t("searchPlaceholder")}
                  className="btn-gold-gradient flex w-11 flex-shrink-0 items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Right side navigation items - hidden on mobile. Messages has
              its own floating chat button (bottom-right) and "shop" is
              reachable via the profile dropdown / Start Selling, so this
              row stays to just wishlist + notifications + account. */}
            <div className="hidden md:flex items-center gap-1.5">
              {session?.user && (
                <Link
                  href="/wishlist"
                  aria-label={t("savedItems")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gold-hover hover:bg-gold/10 transition-colors dark:text-gold-champagne"
                >
                  <Heart className="h-5 w-5" />
                </Link>
              )}

              <LanguageSwitcher />

              {/* Dark Mode Toggle */}
              <button
                onClick={changeTheme}
                aria-label={t("toggleDarkMode")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gold-hover hover:bg-gold/10 transition-colors dark:text-gold-champagne"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {session?.user && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={toggleNotificationsPanel}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-gold-hover hover:bg-gold/10 transition-colors dark:text-gold-champagne"
                    aria-label={t("notifications")}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsTotal > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-premium text-[10px] text-white">
                        {unreadNotificationsTotal > 9
                          ? "9+"
                          : unreadNotificationsTotal}
                      </span>
                    )}
                  </button>
                  {isNotificationsPanelOpen && <NotificationsDropdown />}
                </div>
              )}

              <div className="h-5 w-px bg-border mx-1" />

              {/* Profile menu / Sign In */}
              {session?.user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-gold/10 transition-colors"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-hover dark:text-gold-champagne">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="max-w-[110px] truncate text-sm font-semibold text-text">
                        {session.user.name}
                      </span>
                      {session.user.role === USER_ROLES.SELLER && (
                        <span className="text-[10px] font-semibold text-gold-hover dark:text-gold-champagne">
                          {t("sellerBadge")}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-light-text transform transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileMenuOpen && profileDropdownContent}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="whitespace-nowrap text-sm font-medium text-text hover:text-gold-hover dark:hover:text-gold-champagne transition-colors"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="btn-gold-gradient whitespace-nowrap text-sm font-semibold px-4 py-1.5 rounded-full"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>

            {/* Right cluster - mobile: search toggle, notifications, profile
              (or sign in/register), hamburger — all grouped on the right so
              the bar reads left-to-right as brand → actions → menu. */}
            <div className="md:hidden flex items-center gap-0.5 sm:gap-1.5">
              <button
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                className="flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full text-gold-hover hover:bg-gold/10 transition-colors dark:text-gold-champagne"
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
                    className="relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-gold-hover hover:bg-gold/10 transition-colors dark:text-gold-champagne"
                    aria-label={t("notifications")}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsTotal > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-premium text-[10px] text-white">
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
                    onClick={toggleMobileProfileMenu}
                    className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gold/10 text-gold-hover dark:text-gold-champagne"
                    aria-label={t("accountMenu")}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {isProfileMenuOpen && profileDropdownContent}
                </div>
              )}

              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-1 sm:p-1.5 rounded-md text-text hover:bg-background focus:outline-none"
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

          {/* Guest sign in/register — its own row under the main bar rather
            than squeezed in among the icon buttons, so both stay easy to
            tap and easy to see for a new visitor. */}
          {!session?.user && (
            <div className="md:hidden flex items-center gap-2 pb-3">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-border py-2 text-center text-sm font-medium text-text hover:border-gold hover:text-gold-hover dark:hover:text-gold-champagne transition-colors"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/register"
                className="btn-gold-flat flex-1 rounded-full py-2 text-center text-sm font-semibold"
              >
                {t("register")}
              </Link>
            </div>
          )}

          {/* Expandable mobile search bar — mirrors the desktop pill so the
            same search UI is available once tapped, without permanently
            taking up bar space on small screens. */}
          {isMobileSearchOpen && (
            <div className="md:hidden pb-3">
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full items-stretch rounded-full border border-border bg-background overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-primary/30"
              >
                <div className="relative flex flex-shrink-0 items-center border-r border-border">
                  <select
                    aria-label={t("allCategories")}
                    defaultValue=""
                    className="max-w-[84px] truncate appearance-none bg-transparent py-2 pl-3 pr-7 text-sm font-medium text-text focus:outline-none cursor-pointer"
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-text placeholder:text-light-text focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={t("searchPlaceholder")}
                  className="btn-gold-gradient flex w-11 flex-shrink-0 items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Categories menu */}
        <div
          className="border-t bg-primary/5 dark:bg-[#0c0d10] border-border transition-colors duration-300"
          ref={categoryMenuRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="hidden md:flex items-center py-2 relative">
              {/* Left aligned menu items */}
              <div className="flex items-center gap-2 lg:gap-6">
                <div>
                  {/* Click-to-open, not hover — this is a floating modal that
                    overlaps its own trigger near the top of the viewport,
                    so a stationary cursor never gets a mouseenter on it and
                    hover-intent would just self-close on open. */}
                  <button
                    onClick={() => toggleCategory("allCategories")}
                    className="btn-gold-gradient flex items-center gap-2 whitespace-nowrap text-xs lg:text-sm font-semibold px-3 lg:px-4 py-1.5 rounded-full"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    {t("browseCategories")}
                  </button>
                </div>

                {/* Per-category dropdowns (Gems ▾, Jewellery ▾, ...) — the
                  Browse Categories button already covers this, so these are
                  a nice-to-have that gets dropped first when space is
                  tight: always in Tamil (longest labels, wraps/stacks even
                  at desktop widths), and below xl for en/si. */}
                {locale !== "ta" && (
                  <div className="hidden xl:flex items-center gap-2 lg:gap-6">
                    {categoryNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleCategory(item.id)}
                        className={`flex items-center whitespace-nowrap text-sm lg:text-base font-medium ${
                          activeCategory === item.id
                            ? "font-semibold text-primary"
                            : "text-light-text hover:text-text"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transform ${activeCategory === item.id ? "rotate-180" : ""}`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                <Link
                  href="/sellers"
                  className="whitespace-nowrap text-sm lg:text-base font-medium text-light-text hover:text-text"
                >
                  {t("sellers")}
                </Link>
                <Link
                  href="/deals"
                  className="whitespace-nowrap text-sm lg:text-base font-medium text-light-text hover:text-text"
                >
                  {t("deals")}
                </Link>
                <Link
                  href="/collections"
                  className="whitespace-nowrap text-sm lg:text-base font-medium text-light-text hover:text-text"
                >
                  {t("collections")}
                </Link>
              </div>

              {/* Right aligned menu items */}
              <div className="ml-auto flex items-center gap-3 lg:gap-6">
                <Link
                  href="/help-center/contact"
                  className="flex items-center gap-1.5 whitespace-nowrap text-sm lg:text-base font-medium text-light-text hover:text-text"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t("helpCenter")}
                </Link>
                <Link
                  href={sellHref}
                  className="btn-gold-outline whitespace-nowrap text-xs lg:text-sm font-semibold px-3 lg:px-4 py-1.5 rounded-full"
                >
                  {sellLabel}
                </Link>
              </div>
            </div>

            {/* Per-category dropdown (Gems ▾, Jewellery ▾, ...) — stays a
              plain attached panel, unlike Browse Categories below. */}
            {activeCategory && activeCategory !== "allCategories" && (
              <div className="absolute z-50 left-0 right-0 border-t border-b shadow-lg bg-surface border-border dark:bg-[#14161b] dark:border-[#2c2f36]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  {renderCategoryFlyout(activeCategory)}
                </div>
              </div>
            )}

            {/* Browse Categories — a true floating modal (backdrop + fixed,
              centered card) rather than a dropdown tethered to the nav bar,
              with a fixed footprint that doesn't resize as the hovered
              category changes. */}
            {activeCategory === "allCategories" && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                  onClick={closeDropdown}
                />
                <div className="fixed left-1/2 top-20 sm:top-24 z-50 w-[94vw] sm:w-[90vw] max-w-5xl -translate-x-1/2 max-h-[85vh] overflow-y-auto rounded-2xl bg-surface shadow-2xl dark:bg-[#14161b] dark:border dark:border-[#2c2f36]">
                  {allCategoriesFlyout}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 shadow-inner bg-primary/5 dark:bg-[#0c0d10]">
            {/* Language — moved here from the always-visible bar for the same
              reason as the theme toggle below: a set-once preference, not
              something checked frequently */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-border pb-3">
              <span className="text-base font-medium text-text">
                {t("language")}
              </span>
              <LanguageSwitcher />
            </div>

            {/* Theme toggle — moved here from the always-visible bar since it's
              a set-once preference, not something checked frequently */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-border pb-3">
              <span className="text-base font-medium text-text">
                {t("darkMode")}
              </span>
              <button
                onClick={changeTheme}
                role="switch"
                aria-checked={isDarkMode}
                aria-label={t("toggleDarkMode")}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
                  isDarkMode ? "bg-gray-700" : "bg-blue-100"
                }`}
              >
                <span
                  className={`absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transform transition-transform ${
                    isDarkMode ? "translate-x-7" : "translate-x-0"
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                </span>
              </button>
            </div>

            {/* Mobile Category Navigation */}
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => toggleMobileCategory(category.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
                      expandedMobileCategory === category.id
                        ? "bg-background text-text"
                        : "text-light-text hover:bg-background"
                    } font-medium`}
                  >
                    <span>{tCategories(`${category.id}.name`)}</span>
                    <ChevronDown
                      className={`h-4 w-4 transform ${expandedMobileCategory === category.id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedMobileCategory === category.id && (
                    <div className="mt-1 ml-4 space-y-1">
                      {category.subcategories.map((subcat) => {
                        const resolved = resolveSubcat(category.id, subcat);
                        return (
                          <Link
                            href={resolved.href}
                            key={subcat.id}
                            onClick={closeMobileMenu}
                            className="block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background"
                          >
                            {resolved.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Featured Links */}
            <div className={`border-t mt-3 pt-3 border-border`}>
              <Link
                href="/deals"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
              >
                {t("deals")}
              </Link>
              <Link
                href="/collections"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
              >
                {t("collections")}
              </Link>
            </div>

            {/* Mobile Main Links */}
            <div className={`border-t mt-3 pt-3 border-border`}>
              <Link
                href="/help-center/contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background"
              >
                <HelpCircle className="h-5 w-5" />
                {t("helpCenter")}
              </Link>
              <Link
                href={sellHref}
                onClick={closeMobileMenu}
                className="btn-gold-outline block mt-2 px-3 py-2 rounded-md text-base font-semibold text-center"
              >
                {sellLabel}
              </Link>
            </div>

            {/* Mobile Account Links */}
            <div className={`border-t mt-3 pt-3 border-border`}>
              {session?.user ? (
                <>
                  <Link
                    href="/wishlist"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                  >
                    <Heart className="h-5 w-5 mr-2 text-premium" />
                    {t("savedItems")}
                  </Link>
                  <Link
                    href="/messages"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background relative`}
                  >
                    <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                    {t("messages")}
                    {unreadMessagesTotal > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-premium text-xs text-white">
                        {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                      </span>
                    )}
                  </Link>
                  {session.user.role === USER_ROLES.SELLER ? (
                    <Link
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-2 text-light-text" />
                      {t("sellerDashboard")}
                    </Link>
                  ) : (
                    <Link
                      href="/seller-registration"
                      onClick={closeMobileMenu}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gold-hover hover:bg-background dark:text-gold-champagne"
                    >
                      <Store className="h-5 w-5 mr-2" />
                      {t("startSelling")}
                    </Link>
                  )}
                  <Link
                    href="/dashboard/settings"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                  >
                    <Settings className="h-5 w-5 mr-2 text-light-text" />
                    {t("editProfile")}
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className={`flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-left text-premium hover:bg-background`}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                  >
                    <User className="h-5 w-5 mr-2 text-secondary" />
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                  >
                    {t("register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating message button - logged-in users only */}
        {session?.user && (
          <div className="fixed bottom-6 right-6 z-[100]" ref={messagesRef}>
            <button
              onClick={toggleMessagesPopover}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
              aria-label={t("messages")}
            >
              <MessageCircle className="h-7 w-7" />
              {unreadMessagesTotal > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-premium text-xs text-white">
                  {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                </span>
              )}
            </button>
            {isMessagesPopoverOpen && <MessagesPopover />}
          </div>
        )}
      </nav>

      {/* Bottom sign-in/register bar — mobile only, guests only. Frees up
        the top bar (which was getting tight on longer translations) and
        keeps the two entry points reachable with a thumb the whole time
        you're browsing, not just at the very top of the page. */}
      {!session?.user && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[95] flex items-center gap-3 border-t border-border bg-surface px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] dark:bg-[#0c0d10]">
          <Link
            href="/login"
            className="btn-gold-outline flex-1 rounded-full py-2.5 text-center text-sm font-semibold"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            className="btn-gold-flat flex-1 rounded-full py-2.5 text-center text-sm font-semibold"
          >
            {t("register")}
          </Link>
        </div>
      )}
    </>
  );
}
