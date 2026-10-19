"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowUp,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { WhatsAppFollow, WHATSAPP_CHANNEL_URL } from "./WhatsAppFollow";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100084445023354";
const SUPPORT_EMAIL = "support@slmarket.lk";
const SUPPORT_PHONE = { display: "+94 78 521 7472", digits: "94785217472" };

const SOCIALS = [
  {
    src: "/images/social/facebook.webp",
    label: "Facebook",
    href: FACEBOOK_URL,
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
  {
    src: "/images/social/linkedin.webp",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/slmarket",
  },
];

type FooterLinkItem = { label: string; href: string; strong?: boolean };

/*
 * Site footer: the WhatsApp channel (news and new listings), link columns
 * on a solid background, how to reach support, and the legal links. One
 * layout, with the link columns as accordions on phones.
 */
export default function Footer() {
  const t = useTranslations("footer");
  const tCategories = useTranslations("categories");

  const columns: { title: string; links: FooterLinkItem[] }[] = [
    {
      title: t("browse.title"),
      links: [
        ...categories
          .slice(0, 8)
          .map((c) => ({ label: tCategories(`${c.id}.name`), href: c.href })),
        { label: t("browse.allCategories"), href: "/ads", strong: true },
      ],
    },
    {
      title: t("sell.title"),
      links: [
        { label: t("sell.postAd"), href: "/post-ad" },
        { label: t("sell.businessPage"), href: "/business/new" },
        { label: t("sell.plans"), href: "/subscription" },
        { label: t("sell.advertise"), href: "/help/contact" },
        { label: t("sell.deals"), href: "/ads/deals" },
      ],
    },
    {
      title: t("help.title"),
      links: [
        { label: t("help.centre"), href: "/help" },
        { label: t("help.safety"), href: "/help/safety" },
        { label: t("help.faq"), href: "/help/faq" },
        { label: t("help.complaints"), href: "/help/complaints" },
        { label: t("help.contact"), href: "/help/contact" },
      ],
    },
  ];

  const legal: FooterLinkItem[] = [
    { label: t("legal.about"), href: "/about" },
    { label: t("legal.terms"), href: "/help/terms" },
    { label: t("legal.privacy"), href: "/help/privacy-policy" },
    { label: t("legal.listingPolicy"), href: "/help/faq" },
    { label: t("legal.contact"), href: "/help/contact" },
  ];

  return (
    <footer className="mt-8 border-t border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* WhatsApp channel: one-way news and new listings (support is below). */}
        <section
          aria-labelledby="wa-channel-heading"
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-background)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-4">
            <Image
              src="/images/social/whatsapp-message.webp"
              alt=""
              width={48}
              height={48}
              className="h-11 w-11 shrink-0"
            />
            <div>
              <h2
                id="wa-channel-heading"
                className="text-base font-bold sm:text-lg"
              >
                {t("channel.title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-market-text-secondary)]">
                {t("channel.desc")}
              </p>
            </div>
          </div>
          <WhatsAppFollow className="w-full shrink-0 sm:w-auto" />
        </section>

        <div className="grid gap-8 py-10 lg:grid-cols-12 lg:gap-6">
          {/* Brand */}
          <div className="lg:col-span-3">
            <Link href="/" aria-label="SLMarket.lk" className="inline-flex">
              <Image
                src="/logo.webp"
                alt="SLMarket.lk"
                width={760}
                height={147}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-market-text-secondary)]">
              {t("about")}
            </p>
            <ul className="mt-4 flex gap-3">
              {SOCIALS.map(({ src, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <Image
                      src={src}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns: accordions on phones, columns from tablet up */}
          <div className="grid gap-0 sm:grid-cols-3 sm:gap-6 lg:col-span-6">
            {columns.map((col) => (
              <FooterColumn
                key={col.title}
                title={col.title}
                links={col.links}
              />
            ))}
          </div>

          {/* Support */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold">{t("contact.title")}</h2>
            <ul className="mt-4 grid gap-4">
              <ContactRow
                icon={MessageCircle}
                title={t("contact.whatsapp")}
                sub={t("contact.whatsappDesc")}
                href={`https://wa.me/${SUPPORT_PHONE.digits}`}
              />
              <ContactRow
                icon={Phone}
                title={SUPPORT_PHONE.display}
                sub={t("contact.phoneDesc")}
                href={`tel:+${SUPPORT_PHONE.digits}`}
              />
              <ContactRow
                icon={Mail}
                title={SUPPORT_EMAIL}
                sub={t("contact.emailDesc")}
                href={`mailto:${SUPPORT_EMAIL}`}
              />
              <ContactRow
                icon={MapPin}
                title={t("contact.place")}
                sub={t("contact.placeDesc")}
              />
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-market-border)] bg-[var(--color-market-background)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:justify-between">
          <p className="text-sm text-[var(--color-market-text-secondary)]">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <nav aria-label={t("legal.label")}>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
              {legal.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-[var(--color-market-text-secondary)] hover:text-blue-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[var(--color-market-text-secondary)] hover:bg-[var(--color-market-surface)] hover:text-blue-700"
          >
            <ArrowUp aria-hidden className="h-4 w-4" />
            {t("backToTop")}
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLinkItem[];
}) {
  const [open, setOpen] = useState(false);
  const list = (
    <ul className="grid gap-2.5 text-sm">
      {links.map((l) => (
        <li key={l.href + l.label}>
          <Link
            href={l.href}
            className={
              l.strong
                ? "font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300"
                : "text-[var(--color-market-text-secondary)] hover:text-blue-700"
            }
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="border-b border-[var(--color-market-border)] sm:border-0">
      {/* Phones: an accordion (the links stay in the HTML either way). */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between text-left text-sm font-bold sm:hidden"
      >
        {title}
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <h2 className="mb-4 hidden text-sm font-bold sm:block">{title}</h2>
      <div className={`${open ? "block pb-4" : "hidden"} sm:block`}>{list}</div>
    </div>
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
  const external = href?.startsWith("https://");
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-market-background)] text-blue-700 ring-1 ring-[var(--color-market-border)]">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="block break-words text-sm font-semibold hover:text-blue-700"
          >
            {title}
          </a>
        ) : (
          <span className="block text-sm font-semibold">{title}</span>
        )}
        <span className="block text-sm text-[var(--color-market-text-secondary)]">
          {sub}
        </span>
      </span>
    </li>
  );
}
