"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Store,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Users,
  Leaf,
  Globe2,
  Heart,
  Tag,
  Gift,
  Bell,
} from "lucide-react";
import { useSellerCta } from "@/hooks/useSellerCta";
import { categories } from "@/config/const/navLinks";
import { WhatsAppFollow, WHATSAPP_CHANNEL_URL } from "./WhatsAppFollow";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100084445023354";
const FACEBOOK_ID = "100084445023354";

// On a phone, try to hand off to the native Facebook app; fall back to the
// web profile if the app is not installed (the page stays foregrounded, so
// the timer fires).
function openFacebook(e: React.MouseEvent<HTMLAnchorElement>) {
  if (typeof navigator === "undefined") return;
  if (!/android|iphone|ipad|ipod/i.test(navigator.userAgent)) return;
  e.preventDefault();
  const start = Date.now();
  setTimeout(() => {
    if (Date.now() - start < 1600) window.location.href = FACEBOOK_URL;
  }, 900);
  window.location.href = `fb://facewebmodal/f?href=${encodeURIComponent(
    FACEBOOK_URL,
  )}`;
  // also works on newer app builds
  window.location.href = `fb://profile/${FACEBOOK_ID}`;
}

const SOCIALS: {
  src: string;
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}[] = [
  {
    src: "/images/social/facebook.webp",
    label: "Facebook",
    href: FACEBOOK_URL,
    onClick: openFacebook,
  },
  {
    src: "/images/social/instagram.webp",
    label: "Instagram",
    href: "https://www.instagram.com/slmarketlk/",
  },
  {
    src: "/images/social/tiktok.webp",
    label: "TikTok",
    href: "https://www.tiktok.com/@slmarketlk",
  },
  {
    src: "/images/social/whatsapp.webp",
    label: "WhatsApp",
    href: WHATSAPP_CHANNEL_URL,
  },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Categories", href: "/categories" },
  { label: "Deals & Offers", href: "/deals" },
  { label: "Premium Shops", href: "/sellers" },
  { label: "Post a Free Listing", href: "/sell" },
  { label: "How It Works", href: "/help-center" },
  { label: "Help & Support", href: "/help-center/contact" },
];

const BUSINESS_LINKS = [
  { label: "Open a Shop", href: "/seller-registration" },
  { label: "Premium Plans", href: "/subscription" },
  { label: "Advertising", href: "/help-center/contact" },
  { label: "Business Solutions", href: "/help-center/contact" },
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    desc: "Your safety is our priority",
  },
  {
    icon: Users,
    title: "Trusted Community",
    desc: "Real people, real opportunities",
  },
  {
    icon: Leaf,
    title: "Support Local",
    desc: "Empowering Sri Lankan businesses",
  },
  { icon: Globe2, title: "Nationwide Reach", desc: "From cities to villages" },
  {
    icon: Heart,
    title: "Better Tomorrow",
    desc: "Building stronger communities",
  },
];

const LEGAL_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Terms of Service", href: "/help-center/privacy-policy" },
  { label: "Privacy Policy", href: "/help-center/privacy-policy" },
  { label: "Listing Policy", href: "/help-center/faq" },
  { label: "Contact Us", href: "/help-center/contact" },
];

const WHATSAPP_PERKS = [
  { icon: Tag, label: "New Listings" },
  { icon: Gift, label: "Exclusive Offers" },
  { icon: Bell, label: "Important Updates" },
];

export default function Footer() {
  const tCategories = useTranslations("categories");
  const { href: sellerHref } = useSellerCta();
  const topCategories = categories.slice(0, 10);

  return (
    <footer className="relative isolate mt-4 overflow-hidden text-[var(--color-market-text)]">
      <Image
        src="/images/footer/footer-bg.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-bottom dark:opacity-25"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* WhatsApp channel band */}
        <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 to-white/70 p-5 backdrop-blur-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-white/5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-start gap-4">
            <Image
              src="/images/social/whatsapp-message.webp"
              alt=""
              width={52}
              height={52}
              className="h-12 w-12 shrink-0 drop-shadow-sm"
            />
            <div>
              <h3 className="text-lg font-bold">
                Get the Latest Updates on{" "}
                <span className="text-[#128C7E] dark:text-[#25D366]">
                  WhatsApp
                </span>
              </h3>
              <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
                Join our WhatsApp Channel for new listings, special offers and
                important updates.
              </p>
            </div>
          </div>

          <div className="hidden self-stretch border-l border-emerald-200/70 lg:block dark:border-emerald-900/40" />

          <div className="flex gap-5 lg:px-2">
            {WHATSAPP_PERKS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex flex-col items-center gap-1.5 text-center text-xs font-medium text-[var(--color-market-text-muted)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100 dark:bg-white/10 dark:ring-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <WhatsAppFollow />
            <p className="text-center text-xs text-[var(--color-market-text-muted)]">
              No spam. Only important updates.
            </p>
          </div>
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-12 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/footer/logo.webp"
                alt="SLMarket.lk, Sri Lanka's Trusted Marketplace"
                width={1030}
                height={292}
                className="h-16 w-auto max-w-full sm:h-20"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-market-text-secondary)]">
              Sri Lanka&apos;s trusted marketplace for people, businesses and
              communities. Find it. List it. Grow together.
            </p>

            <div className="mt-5 flex gap-3">
              {SOCIALS.map(({ src, label, href, onClick }) => (
                <a
                  key={label}
                  href={href}
                  onClick={onClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  <Image
                    src={src}
                    alt={label}
                    width={40}
                    height={40}
                    className="h-9 w-9 drop-shadow-sm"
                  />
                </a>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">Download Our Mobile App</p>
              <p className="text-xs text-[var(--color-market-text-muted)]">
                Coming soon on iOS and Android
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/#mobile-app"
                  aria-label="Get the app on the App Store"
                >
                  <Image
                    src="/images/app-badges/app-store.webp"
                    alt="Download on the App Store"
                    width={480}
                    height={157}
                    className="h-10 w-auto transition hover:-translate-y-0.5"
                  />
                </Link>
                <Link
                  href="/#mobile-app"
                  aria-label="Get the app on Google Play"
                >
                  <Image
                    src="/images/app-badges/google-play.webp"
                    alt="Get it on Google Play"
                    width={480}
                    height={139}
                    className="h-10 w-auto transition hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <FooterCol title="Quick Links" className="lg:col-span-2">
            {QUICK_LINKS.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Popular Categories */}
          <FooterCol title="Popular Categories" className="lg:col-span-2">
            {topCategories.map((c) => (
              <FooterLink key={c.id} href={c.href}>
                {tCategories(`${c.id}.name`)}
              </FooterLink>
            ))}
            <Link
              href="/categories"
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Categories
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </FooterCol>

          {/* For Businesses */}
          <FooterCol title="For Businesses" className="lg:col-span-2">
            {BUSINESS_LINKS.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
            <div className="mt-3 -mx-3.5 rounded-xl border border-border bg-[var(--color-market-surface)]/70 p-3.5">
              <Store className="h-5 w-5 text-blue-600" />
              <p className="mt-1.5 text-sm font-bold leading-snug">
                Grow Your Business with SLMarket.lk
              </p>
              <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
                Reach more customers across Sri Lanka.
              </p>
              <Link
                href={sellerHref}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Explore Business Plans
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </FooterCol>

          {/* Get in Touch */}
          <FooterCol
            title="Get in Touch"
            className="col-span-2 md:col-span-1 lg:col-span-2"
          >
            <ContactRow
              icon={Phone}
              title="+94 78 521 7472"
              sub="Mon - Sat, 9.00 AM - 6.00 PM"
              href="tel:+94785217472"
            />
            <ContactRow
              icon={Mail}
              title="slmarkethq@gmail.com"
              sub="We reply within 24 hours"
              href="mailto:slmarkethq@gmail.com"
            />
            <ContactRow
              icon={MapPin}
              title="Galle, Sri Lanka"
              sub="Serving islandwide"
            />
          </FooterCol>
        </div>

        {/* Trust strip — one contained card, subtle vertical dividers */}
        <div className="mb-10 flex flex-col divide-y divide-[var(--color-market-border)] overflow-hidden rounded-3xl border border-black/[0.04] bg-[var(--color-market-surface)]/90 shadow-[0_16px_45px_-24px_rgba(16,33,63,0.18)] backdrop-blur-sm sm:flex-row sm:divide-x sm:divide-y-0">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-1 items-center gap-3 px-5 py-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100/70 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-[var(--color-market-text-muted)]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#0b1c3a] text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-5 text-sm sm:px-6 lg:flex-row lg:justify-between">
          <p className="order-2 lg:order-1">
            &copy; {new Date().getFullYear()} SLMarket.lk. All rights reserved.
          </p>

          <div className="order-1 flex flex-col items-center gap-4 lg:order-2 lg:flex-row lg:justify-end">
            <nav className="flex flex-wrap items-center justify-center">
              {LEGAL_LINKS.map((l, i) => (
                <span key={l.label} className="flex items-center">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="mx-3 h-3.5 w-px bg-white/20"
                    />
                  )}
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </span>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h3 className="mb-4 text-sm font-bold text-[var(--color-market-text)]">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-[var(--color-market-text-secondary)] transition-colors hover:text-blue-600"
      >
        {children}
      </Link>
    </li>
  );
}

function ContactRow({
  icon: Icon,
  title,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  href?: string;
}) {
  const titleEl = href ? (
    <a
      href={href}
      className="block text-sm font-semibold text-[var(--color-market-text)] transition-colors hover:text-blue-600"
    >
      {title}
    </a>
  ) : (
    <span className="block text-sm font-semibold text-[var(--color-market-text)]">
      {title}
    </span>
  );

  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-market-surface)] text-blue-600 shadow-sm ring-1 ring-border">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        {titleEl}
        <span className="block text-xs text-[var(--color-market-text-muted)]">
          {sub}
        </span>
      </span>
    </li>
  );
}
