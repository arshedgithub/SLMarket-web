"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe, MapPin, Navigation, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  directionsHref,
  type StorefrontBusiness,
} from "@/lib/business/storefront";
import { formatDate, scrollToSection, useNow } from "./format";

const CARD =
  "rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 md:p-5";
const COLOMBO_OFFSET_MS = 330 * 60 * 1000;

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-heading text-lg font-extrabold text-[var(--color-market-text)]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[13px] text-[var(--color-market-text-muted)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ---------------- questions and answers ---------------- */

export function QuestionsSection({
  business,
  full = false,
}: {
  business: StorefrontBusiness;
  full?: boolean;
}) {
  const t = useTranslations("storefront");
  const locale = useLocale();
  const shown = full ? business.questions : business.questions.slice(0, 3);
  return (
    <section id="questions" className={`${CARD} scroll-mt-32`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <Heading title={t("qa.title")} />
        <button
          type="button"
          onClick={() => scrollToSection("enquiry")}
          className="btn-outline h-10 shrink-0 rounded-xl px-4 text-sm font-semibold"
        >
          {t("qa.ask")}
        </button>
      </div>
      {business.questions.length === 0 ? (
        <p className="text-sm text-[var(--color-market-text-muted)]">
          {t("qa.empty", { name: business.name })}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-market-border)]">
          {shown.map((q) => (
            <article key={q.id} className="py-3 first:pt-0">
              <p className="text-sm font-semibold text-[var(--color-market-text)]">
                {q.question}
              </p>
              {q.answer && (
                <p className="mt-1 text-sm text-[var(--color-market-text-secondary)]">
                  {q.answer.text}
                  <span className="mt-0.5 block text-xs text-[var(--color-market-text-muted)]">
                    {business.name} &middot; {formatDate(q.answer.date, locale)}
                  </span>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      {!full && business.questions.length > 3 && (
        <Link
          href={`/business/${business.slug}/questions`}
          className="mt-2 inline-flex text-sm font-semibold text-blue-600"
        >
          {t("qa.seeAll", { count: business.questions.length })}
        </Link>
      )}
    </section>
  );
}

/* ---------------- about ---------------- */

// lucide-react 1.0 dropped brand logos; these are its former outline icons.
function BrandIcon({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function FacebookIcon({ className }: { className: string }) {
  return (
    <BrandIcon className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </BrandIcon>
  );
}

function InstagramIcon({ className }: { className: string }) {
  return (
    <BrandIcon className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </BrandIcon>
  );
}

function YoutubeIcon({ className }: { className: string }) {
  return (
    <BrandIcon className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </BrandIcon>
  );
}

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  website: Globe,
} as const;

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-market-border)] py-2 text-sm last:border-b-0">
      <dt className="shrink-0 text-[var(--color-market-text-muted)]">
        {label}
      </dt>
      <dd className="text-right font-medium text-[var(--color-market-text)]">
        {children}
      </dd>
    </div>
  );
}

export function hasAboutContent(b: StorefrontBusiness) {
  const a = b.about;
  return !!(
    a.story ||
    a.team.length ||
    a.warrantyPolicy ||
    a.returnsPolicy ||
    a.faq.length ||
    a.languages.length ||
    a.payments.length
  );
}

export function AboutSection({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const a = business.about;
  return (
    <section id="about" className={`${CARD} scroll-mt-32`}>
      <Heading title={t("about.title", { name: business.name })} />
      {a.story && (
        <p className="text-sm leading-relaxed text-[var(--color-market-text-secondary)]">
          {a.story}
        </p>
      )}

      <dl className="mt-4 rounded-xl bg-[var(--color-market-surface-soft)] px-4 py-1">
        {business.establishedYear && (
          <Fact label={t("about.established")}>{business.establishedYear}</Fact>
        )}
        {a.teamSize && <Fact label={t("about.teamSize")}>{a.teamSize}</Fact>}
        {a.languages.length > 0 && (
          <Fact label={t("about.languages")}>{a.languages.join(", ")}</Fact>
        )}
        {a.payments.length > 0 && (
          <Fact label={t("about.payments")}>{a.payments.join(", ")}</Fact>
        )}
        {a.instalmentProviders.length > 0 && (
          <Fact label={t("about.instalments")}>
            {a.instalmentProviders
              .map((p) =>
                p === "epp" ? "Card EPP" : p === "koko" ? "KOKO" : "Mintpay",
              )
              .join(", ")}
          </Fact>
        )}
        {a.deliveryAreas && (
          <Fact label={t("about.deliveryAreas")}>{a.deliveryAreas}</Fact>
        )}
        {a.deliveryFee && (
          <Fact label={t("about.deliveryFee")}>{a.deliveryFee}</Fact>
        )}
      </dl>

      {a.team.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
            {t("about.team")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {a.team.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--color-market-border)] px-3 py-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-market-blue-light)] text-sm font-bold text-blue-700 dark:text-blue-300">
                  {m.name.slice(0, 1)}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-[var(--color-market-text)]">
                    {m.name}
                  </span>
                  <span className="block text-xs text-[var(--color-market-text-muted)]">
                    {m.role}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(a.warrantyPolicy || a.returnsPolicy) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {a.warrantyPolicy && (
            <div className="rounded-xl border border-[var(--color-market-border)] p-3">
              <h3 className="text-sm font-bold text-[var(--color-market-text)]">
                {t("about.warranty")}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-market-text-secondary)]">
                {a.warrantyPolicy}
              </p>
            </div>
          )}
          {a.returnsPolicy && (
            <div className="rounded-xl border border-[var(--color-market-border)] p-3">
              <h3 className="text-sm font-bold text-[var(--color-market-text)]">
                {t("about.returns")}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-market-text-secondary)]">
                {a.returnsPolicy}
              </p>
            </div>
          )}
        </div>
      )}

      {a.faq.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-bold text-[var(--color-market-text)]">
            {t("about.faq")}
          </h3>
          <div className="flex flex-col gap-2">
            {a.faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-[var(--color-market-border)] px-3 py-2.5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-market-text)]">
                  {f.q}
                </summary>
                <p className="mt-1.5 text-[13px] text-[var(--color-market-text-secondary)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {a.social.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-market-text)]">
            {t("about.social")}
          </span>
          {a.social.map((s) => {
            const Icon = SOCIAL_ICONS[s.kind];
            return (
              <a
                key={s.kind}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={s.kind}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300 hover:text-blue-600"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------------- location ---------------- */

// A drawn placeholder, not a live map: the interactive map loads only on
// tap ("Get directions" opens Google Maps).
export function MapPreview({
  label,
  className = "h-32",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#e8f0fb] dark:bg-[#172d4d] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(21,87,214,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(21,87,214,.08) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <MapPin className="h-8 w-8 fill-rose-500 text-white drop-shadow" />
        <span className="mt-0.5 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
          {label}
        </span>
      </span>
    </div>
  );
}

export function HoursTable({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const now = useNow();
  const today = now
    ? new Date(now.getTime() + COLOMBO_OFFSET_MS).getUTCDay()
    : -1;
  if (business.hoursTable.length === 0) {
    return (
      <p className="text-sm text-[var(--color-market-text-muted)]">
        {t("visit.hoursNotSet")}
      </p>
    );
  }
  return (
    <table className="w-full text-sm">
      <tbody>
        {business.hoursTable.map((row) => {
          const isToday = !!row.days?.includes(today);
          return (
            <tr
              key={row.label}
              className={
                isToday
                  ? "font-bold text-blue-700 dark:text-blue-300"
                  : "text-[var(--color-market-text-secondary)]"
              }
            >
              <th scope="row" className="py-1 pr-3 text-left font-[inherit]">
                {row.label}
                {isToday && (
                  <span className="ml-1.5 rounded bg-blue-50 px-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {t("location.today")}
                  </span>
                )}
              </th>
              <td className="py-1 text-right">{row.value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function LocationSection({
  business,
}: {
  business: StorefrontBusiness;
}) {
  const t = useTranslations("storefront");
  return (
    <section id="location" className={`${CARD} scroll-mt-32`}>
      <Heading title={t("location.title")} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <MapPreview
            label={business.branches[0]?.label ?? business.city}
            className="h-40"
          />
          <h3 className="mb-1 mt-4 text-sm font-bold text-[var(--color-market-text)]">
            {t("location.hours")}
          </h3>
          <HoursTable business={business} />
        </div>
        <div className="flex flex-col gap-3">
          {business.branches.map((b) => (
            <article
              key={b.id}
              className="rounded-xl border border-[var(--color-market-border)] p-3"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-market-text)]">
                {b.label}
                {b.main && (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {t("location.mainBranch")}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-[13px] text-[var(--color-market-text-secondary)]">
                {b.address}, {b.district}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={directionsHref(b)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  <Navigation className="h-4 w-4" />
                  {t("location.directions")}
                </a>
                {b.phone && (
                  <a
                    href={`tel:+${b.phone}`}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-market-border)] px-3 text-sm font-semibold text-[var(--color-market-text-secondary)] hover:border-blue-300"
                  >
                    <Phone className="h-4 w-4" />
                    {t("hero.call")}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- seller information + report ---------------- */

// The disclosure a buyer is entitled to: who the seller legally is.
export function SellerInfo({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const missing = t("seller.notProvided");
  return (
    <section id="seller-info" className={`${CARD} scroll-mt-32`}>
      <Heading title={t("seller.title")} />
      <dl className="grid gap-x-8 gap-y-1 md:grid-cols-2">
        <Fact label={t("seller.legalName")}>
          {business.legalName ?? missing}
        </Fact>
        <Fact label={t("seller.regNo")}>
          {business.registrationNumber ?? missing}
        </Fact>
        <Fact label={t("seller.address")}>
          {business.registeredAddress ?? missing}
        </Fact>
        <Fact label={t("seller.contact")}>+{business.phone}</Fact>
      </dl>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
        <Link href="/help/complaints" className="text-rose-600 hover:underline">
          {t("seller.report")}
        </Link>
        <Link href="/help/faq" className="text-blue-600 hover:underline">
          {t("seller.tips")}
        </Link>
      </div>
    </section>
  );
}
