"use client";

import { useEffect } from "react";
import {
  Award,
  BadgeCheck,
  Ban,
  Dog,
  FileWarning,
  Gavel,
  Image as ImageIcon,
  Info,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Tags,
  Users,
  Wrench,
  X,
} from "lucide-react";

type IconType = React.ComponentType<{ className?: string }>;

type Section = {
  icon: IconType;
  title: string;
  body: React.ReactNode;
  highlight?: boolean;
};

const SECTIONS: Section[] = [
  {
    icon: BadgeCheck,
    title: "1. Be honest and accurate",
    body: (
      <>
        <p>
          Listings must accurately represent what is actually being offered.
          Titles, descriptions, prices, specifications, condition and location
          information should be truthful and not misleading.
        </p>
        <p>
          Use clear photographs that genuinely represent the item, property,
          service or business being advertised. Material defects or important
          limitations should not be intentionally hidden.
        </p>
      </>
    ),
  },
  {
    icon: ImageIcon,
    title: "2. Use authentic and trustworthy listing images",
    body: (
      <>
        <p>
          Where an image represents the actual item being sold, sellers should
          use genuine photographs of that item wherever reasonably possible.
        </p>
        <p>
          Images must not intentionally misrepresent the appearance, condition,
          size, quantity or features of an item.
        </p>
        <p>
          AI-generated or artificially created images depicting humans or
          animals are not permitted as listing or promotional images. This helps
          buyers distinguish real products and services from simulated
          promotional content and supports a more authentic, transparent and
          trustworthy marketplace.
        </p>
        <p className="text-[var(--color-market-text-muted)]">
          AI-assisted graphics that do not depict humans or animals may be
          permitted, provided they do not misrepresent the product, service or
          seller (for example: abstract backgrounds, graphic layouts, icons or
          diagrams).
        </p>
      </>
    ),
  },
  {
    icon: Users,
    title: "3. Protect children's privacy and safety",
    body: (
      <>
        <p>
          Children should not be used as models or promotional subjects in
          listing images, advertisements or service promotions on SLMarket.lk.
        </p>
        <p>
          We maintain this standard to protect children&apos;s privacy, reduce
          unnecessary commercial use of children&apos;s images, and keep
          marketplace advertising focused on the product or service being
          offered.
        </p>
      </>
    ),
  },
  {
    icon: Megaphone,
    title: "4. Respectful representation in advertising",
    body: (
      <>
        <p>
          Promotional images must present people respectfully and appropriately
          for a general-audience marketplace.
        </p>
        <p>
          Images that sexualize, objectify or use unnecessarily revealing
          portrayals of women or other individuals solely to attract attention
          to an unrelated product or service are not permitted.
        </p>
        <p>
          SLMarket.lk encourages advertising that keeps the focus on the product
          or service while respecting the dignity and privacy of the people
          represented.
        </p>
      </>
    ),
  },
  {
    icon: Dog,
    title: "5. Responsible animal listings",
    body: (
      <>
        <p>
          SLMarket.lk supports responsible treatment of animals and protection
          of Sri Lanka&apos;s wildlife.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Dogs and cats may not be advertised for sale through SLMarket.lk.
          </li>
          <li>
            Wild animals may not be listed for sale, exchange, adoption or
            commercial transfer. This includes wild birds, parrots, squirrels,
            reptiles and other wildlife.
          </li>
          <li>
            Endangered, threatened, protected or legally restricted species, and
            products derived from protected wildlife, are prohibited.
          </li>
          <li>
            Listings involving wildlife must comply with applicable Sri Lankan
            wildlife laws and regulations, including the Fauna and Flora
            Protection Ordinance and, where relevant, CITES controls on
            international trade in protected species.
          </li>
        </ul>
        <p className="text-[var(--color-market-text-muted)]">
          Legitimate pet accessories, feed, cages and aquariums, and
          veterinary-related services remain welcome under Animals &amp; Pets.
        </p>
      </>
    ),
  },
  {
    icon: Ban,
    title: "6. Items that cannot be listed",
    highlight: true,
    body: (
      <>
        <p>
          Beyond the standards above, the following may not be listed, subject
          to applicable Sri Lankan law:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Illegal goods, stolen property, or counterfeit/pirated goods</li>
          <li>Prohibited drugs and controlled substances</li>
          <li>
            Weapons, ammunition and explosives where prohibited or restricted
          </li>
          <li>Obscene or sexually explicit material</li>
          <li>Protected wildlife and wildlife products</li>
          <li>Hazardous or dangerous materials</li>
          <li>
            Unauthorized prescription medicines or regulated medical products
          </li>
          <li>Human remains or body parts</li>
          <li>Products or services that facilitate unlawful activity</li>
          <li>
            Anything whose sale, possession or advertising is prohibited by Sri
            Lankan law
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: FileWarning,
    title: "7. No misleading, duplicate or spam listings",
    body: (
      <>
        <p>
          One physical item should not be repeatedly posted simply to dominate
          search results, and titles shouldn&apos;t be stuffed with unrelated
          keywords or brand names to chase visibility.
        </p>
        <p>
          Misleading categories, fake locations, fake discounts, unrealistic
          prices used only to generate enquiries, and unrelated images are not
          permitted.
        </p>
      </>
    ),
  },
  {
    icon: Tags,
    title: "8. Pricing and offers must be genuine",
    body: (
      <>
        <p>
          Displayed prices should reasonably represent the actual asking price.
          If Negotiable is enabled, buyers should be able to make reasonable
          offers.
        </p>
        <p>
          For Price Drops, the previous price shown must be a genuine,
          previously published price rather than an artificially inflated
          reference price, if you reduce a published price, SLMarket.lk
          calculates and applies the Price Drop badge automatically.
        </p>
        <p>
          For Coupons &amp; Offers, promotions should have clear conditions and
          must not create misleading savings claims.
        </p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "9. Respect intellectual property",
    body: (
      <p>
        Sellers should only upload photographs, logos, brand assets and other
        material they own or are authorized to use. Counterfeit products,
        unauthorized copies, fake branded goods, or infringement of another
        party&apos;s copyright or trademark rights are not permitted.
      </p>
    ),
  },
  {
    icon: Wrench,
    title: "10. Services must be genuine",
    body: (
      <p>
        Service listings should clearly explain what is offered, where it is
        available and any important conditions. Deceptive employment/business
        opportunities, impersonation, fraudulent investment schemes,
        pyramid-style schemes, or services involving unlawful activity are not
        permitted.
      </p>
    ),
  },
  {
    icon: Sparkles,
    title: "11. Keep listings appropriate for everyone",
    body: (
      <p>
        SLMarket.lk is a general-audience marketplace. Listing images, titles
        and descriptions must be suitable for a broad audience, free of
        explicit, disturbing or offensive material.
      </p>
    ),
  },
  {
    icon: Gavel,
    title: "12. Follow applicable laws and regulations",
    body: (
      <p>
        Sellers are responsible for ensuring that their listings, products and
        services comply with applicable Sri Lankan laws, licensing requirements
        and regulatory requirements. Certain categories may require additional
        verification or documentation.
      </p>
    ),
  },
  {
    icon: Info,
    title: "13. How SLMarket.lk handles violations",
    body: (
      <>
        <p>
          Enforcement is proportional to the severity and repetition of an
          issue:
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            "Listing needs changes",
            "Listing removed",
            "Warning",
            "Temporary restriction",
            "Suspension",
            "Account removal",
          ].map((stage, i, arr) => (
            <span key={stage} className="flex items-center gap-1.5">
              <span className="rounded-full bg-[var(--color-market-background)] px-2.5 py-1 text-[var(--color-market-text-secondary)]">
                {stage}
              </span>
              {i < arr.length - 1 && (
                <span className="text-[var(--color-market-text-muted)]">→</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-[var(--color-market-text-muted)]">
          Serious illegal or harmful content can skip the earlier stages and be
          removed immediately.
        </p>
      </>
    ),
  },
];

export function ListingPolicyDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
      />

      <div className="relative flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Listing Policy
            </p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
              Our Marketplace Standards
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-market-text-muted)]">
              SLMarket.lk is built to create a safe, trustworthy and
              professional marketplace for buyers, sellers and businesses across
              Sri Lanka. Every listing must meet these standards.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Listing Policy"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-market-text-muted)] transition hover:bg-background hover:text-[var(--color-market-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className={`rounded-2xl p-5 ${
                  section.highlight
                    ? "border border-[var(--color-market-warning)]/30 bg-[var(--color-market-warning)]/[0.06]"
                    : "border border-border bg-background"
                }`}
              >
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      section.highlight
                        ? "bg-[var(--color-market-warning)]/15 text-[var(--color-market-warning)]"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-[var(--color-market-text)]">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-2.5 text-sm leading-relaxed text-[var(--color-market-text-secondary)]">
                  {section.body}
                </div>
              </section>
            );
          })}

          <p className="text-center text-xs text-[var(--color-market-text-muted)]">
            Last updated September 2026 · Questions? Contact{" "}
            <a
              href="mailto:slmarkethq@gmail.com"
              className="font-semibold text-primary hover:underline"
            >
              slmarkethq@gmail.com
            </a>
          </p>
        </div>

        <div className="border-t border-border px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="btn-solid w-full rounded-xl py-3 text-sm font-semibold sm:w-auto sm:px-8"
          >
            <Award className="mr-1.5 inline h-4 w-4" />
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
