"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, X } from "lucide-react";

export type EmailCheckLabels = {
  title: string;
  body: string;
  emailLabel: string;
  sendCode: string;
  codeLabel: string;
  codeSent: string; // "{email}" is replaced
  confirm: string;
  changeEmail: string;
  close: string;
  failed: string;
};

/*
 * A guest confirms an email address with a one-time code before seeing a
 * private seller's number (phone OTP comes later). Uses the existing
 * /api/auth/send-email-otp, then /api/ads/contact-verify sets the pass.
 */
export function EmailCheckDialog({
  labels,
  onVerified,
  onClose,
}: {
  labels: EmailCheckLabels;
  onVerified: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstField = useRef<HTMLInputElement | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const back = opener.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      back?.focus();
    };
  }, [onClose]);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || labels.failed);
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/auth/send-email-otp", { email });
      setStep("code");
      setTimeout(() => firstField.current?.focus(), 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.failed);
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/ads/contact-verify", { email, code });
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.failed);
      setBusy(false);
    }
  }

  const field =
    "mt-1 h-12 w-full rounded-xl border border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] px-3.5 text-[15px] text-[color:var(--color-market-text)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const primary =
    "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-market-blue)] text-white transition hover:bg-[var(--color-market-blue-dark)] disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-check-title"
        className="w-full max-w-sm rounded-t-2xl bg-[var(--color-market-surface)] p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950">
            <Mail aria-hidden className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2
          id="email-check-title"
          className="font-heading mt-3 text-lg font-bold text-[color:var(--color-market-text)]"
        >
          {labels.title}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--color-market-text-secondary)]">
          {step === "email"
            ? labels.body
            : labels.codeSent.replace("{email}", email)}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="mt-4">
            <label
              htmlFor="email-check-email"
              className="text-sm font-semibold text-[color:var(--color-market-text)]"
            >
              {labels.emailLabel}
            </label>
            <input
              ref={firstField}
              id="email-check-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
            <button type="submit" disabled={busy} className={primary}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="text-sm font-semibold">{labels.sendCode}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={confirm} className="mt-4">
            <label
              htmlFor="email-check-code"
              className="text-sm font-semibold text-[color:var(--color-market-text)]"
            >
              {labels.codeLabel}
            </label>
            <input
              ref={firstField}
              id="email-check-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${field} tracking-[0.4em]`}
            />
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className={primary}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="text-sm font-semibold">{labels.confirm}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              className="mt-2 w-full text-center text-sm font-semibold text-blue-600"
            >
              <span className="text-sm font-semibold">
                {labels.changeEmail}
              </span>
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
