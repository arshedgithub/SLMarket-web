"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Check, ChevronDown, Loader2, MapPin, Navigation } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { labelForSurface, responseLabelFor } from "@/lib/business/responseTime";
import {
  directionsHref,
  nextChange,
  todayHoursLabel,
  type StorefrontBusiness,
} from "@/lib/business/storefront";
import { HoursTable, MapPreview } from "./InfoSections";
import { formatDate, scrollToSection, useNow } from "./format";

const CARD =
  "rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4";
const SL_MOBILE = /^(?:\+?94|0)7\d{8}$/;

/* ---------------- 1. trust ---------------- */

// `anchor` false for the second copy shown on small screens, so the id stays unique.
export function TrustCard({
  business,
  anchor = true,
}: {
  business: StorefrontBusiness;
  anchor?: boolean;
}) {
  const t = useTranslations("storefront");
  const locale = useLocale();
  const v = business.verification;
  const checks = [
    { key: "phone", label: t("trust.phone"), date: v.phone },
    {
      key: "registration",
      label: t("trust.registration"),
      date: v.registration,
    },
    { key: "address", label: t("trust.address"), date: v.address },
    {
      key: "authorisedDealer",
      label: t("trust.authorised"),
      date: v.authorisedDealer,
    },
  ].filter((c) => c.date);

  return (
    <section id={anchor ? "trust" : undefined} className={CARD}>
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-market-text)]">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${business.verified ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        {business.verified ? t("trust.title") : t("trust.notVerified")}
      </h2>
      {checks.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {checks.map((c) => (
            <li key={c.key} className="flex items-start gap-2 text-[13px]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-[var(--color-market-text-secondary)]">
                {c.label}
                <span className="ml-1.5 text-xs text-[var(--color-market-text-muted)]">
                  {formatDate(c.date!, locale)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {(business.legalName || business.registrationNumber) && (
        <dl className="mt-3 rounded-xl bg-[var(--color-market-surface-soft)] p-3 text-[13px]">
          {business.legalName && (
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-market-text-muted)]">
                {t("seller.legalName")}
              </dt>
              <dd className="text-right font-medium text-[var(--color-market-text)]">
                {business.legalName}
              </dd>
            </div>
          )}
          {business.registrationNumber && (
            <div className="mt-1 flex justify-between gap-3">
              <dt className="text-[var(--color-market-text-muted)]">
                {t("seller.regNo")}
              </dt>
              <dd className="text-right font-medium text-[var(--color-market-text)]">
                {business.registrationNumber}
              </dd>
            </div>
          )}
        </dl>
      )}
      <Link
        href="/help/faq"
        className="mt-3 inline-flex text-[13px] font-semibold text-blue-600"
      >
        {t("trust.how")} &rarr;
      </Link>
    </section>
  );
}

/* ---------------- 2. visit and contact ---------------- */

export function VisitCard({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const tl = useTranslations("listings");
  const now = useNow();
  const [showHours, setShowHours] = useState(false);
  const change = now ? nextChange(business, now) : null;
  const main = business.branches[0];

  return (
    <section id="visit" className={CARD}>
      <h2 className="text-sm font-extrabold text-[var(--color-market-text)]">
        {t("visit.title")}
      </h2>

      {business.hoursSet ? (
        <div className="mt-2">
          {change && (
            <p
              className={`flex items-center gap-1.5 text-sm font-semibold ${change.open ? "text-emerald-600" : "text-[var(--color-market-text-secondary)]"}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${change.open ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              {change.open ? tl("business.openNow") : tl("business.closed")}
              <span className="font-normal text-[var(--color-market-text-muted)]">
                {change.open
                  ? t("hero.closesAt", { time: change.time })
                  : change.tomorrow
                    ? t("hero.opensTomorrow", { time: change.time })
                    : t("hero.opensAt", { time: change.time })}
              </span>
            </p>
          )}
          {now && todayHoursLabel(business, now) && (
            <p className="mt-0.5 text-[13px] text-[var(--color-market-text-muted)]">
              {t("visit.today", { hours: todayHoursLabel(business, now)! })}
            </p>
          )}
          <button
            type="button"
            aria-expanded={showHours}
            onClick={() => setShowHours((s) => !s)}
            className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-blue-600"
          >
            {showHours ? t("visit.hideHours") : t("visit.seeHours")}
            <ChevronDown
              className={`h-3.5 w-3.5 transition ${showHours ? "rotate-180" : ""}`}
            />
          </button>
          {showHours && (
            <div className="mt-2 rounded-xl bg-[var(--color-market-surface-soft)] p-3">
              <HoursTable business={business} />
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-[var(--color-market-text-muted)]">
          {t("visit.hoursNotSet")}
        </p>
      )}

      {main && (
        <>
          <p className="mt-3 flex items-start gap-1.5 text-[13px] text-[var(--color-market-text-secondary)]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            {main.address}, {main.district}
          </p>
          <MapPreview label={main.label} className="mt-2 h-24" />
          <div className="mt-2 flex gap-2">
            <a
              href={directionsHref(main)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 text-[13px] font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              <Navigation className="h-4 w-4" />
              {t("location.directions")}
            </a>
            {business.branches.length > 1 && (
              <button
                type="button"
                onClick={() => scrollToSection("location")}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[var(--color-market-border)] text-[13px] font-semibold text-[var(--color-market-text-secondary)] hover:border-blue-300"
              >
                {t("location.branches", { count: business.branches.length })}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------------- 3. enquiry ---------------- */

type Status = "idle" | "sending" | "sent" | "failed";
type Method = "whatsapp" | "call" | "chat";
type Errors = { what?: boolean; phone?: boolean };

// Default, validation errors, sending, sent and failed are separate states;
// the "sent" message only ever appears after a successful send.
export function EnquiryCard({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const tl = useTranslations("listings");
  const { data: session } = useSession();
  const [what, setWhat] = useState("");
  const [budget, setBudget] = useState("");
  const [method, setMethod] = useState<Method>("whatsapp");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const label = labelForSurface(responseLabelFor(business.response), "page");
  const needsPhone = method !== "chat";
  const signedInPhone =
    (session?.user as { phone?: string } | undefined)?.phone ?? "";
  const phoneValue = phone || signedInPhone;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {
      what: what.trim().length < 2,
      phone: needsPhone && !SL_MOBILE.test(phoneValue.replace(/[\s-]/g, "")),
    };
    setErrors(next);
    if (next.what || next.phone) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/business/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: business.slug,
          what,
          budget: budget || undefined,
          method,
          phone: needsPhone ? phoneValue : undefined,
          message: message || undefined,
          website: trap,
        }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <section id="enquiry" className={`${CARD} scroll-mt-32`}>
        <div
          role="status"
          className="flex flex-col items-center gap-2 py-4 text-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
            <Check className="h-6 w-6" />
          </span>
          <p className="text-sm font-bold text-[var(--color-market-text)]">
            {t("enquiry.sent", { name: business.name })}
          </p>
          {label && (
            <p className="text-[13px] text-[var(--color-market-text-muted)]">
              {tl(`business.response.${label}`)}
            </p>
          )}
          {session?.user && (
            <Link
              href="/messages"
              className="text-[13px] font-semibold text-blue-600"
            >
              {t("enquiry.track")} &rarr;
            </Link>
          )}
        </div>
      </section>
    );
  }

  const input =
    "h-10 w-full rounded-lg border bg-[var(--color-market-surface)] px-3 text-sm text-[var(--color-market-text)] placeholder:text-[var(--color-market-text-muted)] focus:border-blue-400 focus:outline-none";

  return (
    <section
      id="enquiry"
      className={`${CARD} scroll-mt-32 lg:sticky lg:top-32`}
    >
      <h2 className="text-sm font-extrabold text-[var(--color-market-text)]">
        {t("enquiry.title", { name: business.name })}
      </h2>
      <p className="text-xs text-[var(--color-market-text-muted)]">
        {t("enquiry.subtitle")}
      </p>

      <form onSubmit={submit} noValidate className="mt-3 flex flex-col gap-3">
        <div>
          <label
            className="mb-1 block text-xs font-semibold text-[var(--color-market-text-secondary)]"
            htmlFor="enq-what"
          >
            {t("enquiry.what")}
          </label>
          <input
            id="enq-what"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder={t("enquiry.whatPlaceholder")}
            aria-invalid={errors.what}
            className={`${input} ${errors.what ? "border-rose-400" : "border-[var(--color-market-border)]"}`}
          />
          {errors.what && (
            <p className="mt-1 text-xs text-rose-600">{t("enquiry.errWhat")}</p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-xs font-semibold text-[var(--color-market-text-secondary)]"
            htmlFor="enq-budget"
          >
            {t("enquiry.budget")}
          </label>
          <input
            id="enq-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={`${input} border-[var(--color-market-border)]`}
          />
        </div>

        <fieldset>
          <legend className="mb-1 text-xs font-semibold text-[var(--color-market-text-secondary)]">
            {t("enquiry.method")}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(["whatsapp", "call", "chat"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={method === m}
                onClick={() => setMethod(m)}
                className={`h-9 rounded-lg border text-[13px] font-semibold transition ${
                  method === m
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)] hover:border-blue-300"
                }`}
              >
                {t(`enquiry.methods.${m}`)}
              </button>
            ))}
          </div>
        </fieldset>

        {needsPhone && (
          <div>
            <label
              className="mb-1 block text-xs font-semibold text-[var(--color-market-text-secondary)]"
              htmlFor="enq-phone"
            >
              {t("enquiry.phone")}
            </label>
            <input
              id="enq-phone"
              inputMode="tel"
              autoComplete="tel"
              value={phoneValue}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="077 123 4567"
              aria-invalid={errors.phone}
              className={`${input} ${errors.phone ? "border-rose-400" : "border-[var(--color-market-border)]"}`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-600">
                {t("enquiry.errPhone")}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            className="mb-1 block text-xs font-semibold text-[var(--color-market-text-secondary)]"
            htmlFor="enq-msg"
          >
            {t("enquiry.message")}
          </label>
          <textarea
            id="enq-msg"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${input} h-auto resize-none py-2 border-[var(--color-market-border)]`}
          />
        </div>

        {/* Honeypot: hidden from people, filled by bots. */}
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
        />

        <p className="text-xs leading-snug text-[var(--color-market-text-muted)]">
          {t("enquiry.consent", { name: business.name })}{" "}
          <Link
            href="/help/privacy-policy"
            className="font-semibold text-blue-600"
          >
            {t("enquiry.privacy")}
          </Link>
        </p>

        {status === "failed" && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          >
            {t("enquiry.failed")}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-solid flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:opacity-70"
        >
          {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "sending"
            ? t("enquiry.sending")
            : status === "failed"
              ? t("enquiry.retry")
              : t("enquiry.send")}
        </button>
      </form>
    </section>
  );
}
