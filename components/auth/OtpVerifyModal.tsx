"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import {
  X,
  Loader2,
  Mail,
  Phone as PhoneIcon,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { firebaseAuth } from "@/lib/firebase-client";
import { colors } from "@/lib/theme/colors";

interface OtpVerifyModalProps {
  channel: "email" | "phone";
  value: string;
  onClose: () => void;
  onVerified: () => void;
}

const DIGITS = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const RECAPTCHA_CONTAINER_ID = "otp-verify-recaptcha-container";
const IS_DEV = process.env.NODE_ENV === "development";

function clearVerifier(ref: React.MutableRefObject<RecaptchaVerifier | null>) {
  if (!ref.current) return;
  try {
    ref.current.clear();
  } catch {
    /* already destroyed by Firebase */
  }
  ref.current = null;
}

function maskValue(value: string, channel: "email" | "phone") {
  if (channel === "email") {
    const at = value.indexOf("@");
    if (at < 2) return value;
    return `${value.slice(0, 2)}${"•".repeat(Math.min(at - 2, 4))}${value.slice(at)}`;
  }
  // Phone: show first 3 + last 3 chars
  return value.length > 6
    ? `${value.slice(0, 4)} •••• ${value.slice(-3)}`
    : value;
}

export function OtpVerifyModal({
  channel,
  value,
  onClose,
  onVerified,
}: OtpVerifyModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(""));
  const [status, setStatus] = useState<
    "sending" | "ready" | "verifying" | "success" | "error"
  >("sending");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const hasSentRef = useRef(false);

  const code = digits.join("");

  // Focus first empty box (or last box if all filled)
  const focusNext = useCallback((after: number) => {
    const next = after < DIGITS - 1 ? after + 1 : after;
    inputRefs.current[next]?.focus();
  }, []);

  // Auto-focus first box when code becomes ready
  useEffect(() => {
    if (status === "ready") {
      inputRefs.current[0]?.focus();
    }
  }, [status]);

  // Cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = useCallback(async () => {
    setStatus("sending");
    setError("");
    setDigits(Array(DIGITS).fill(""));
    try {
      if (channel === "email") {
        const res = await fetch("/api/auth/send-email-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        // A server failure may not answer with JSON: show a plain message,
        // never a parser error.
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!res.ok)
          throw new Error(
            data.message ??
              "We couldn't send the code right now. Please tap Resend code in a moment.",
          );
      } else {
        clearVerifier(recaptchaRef);
        if (IS_DEV) {
          firebaseAuth.settings.appVerificationDisabledForTesting = true;
        }
        recaptchaRef.current = new RecaptchaVerifier(
          firebaseAuth,
          RECAPTCHA_CONTAINER_ID,
          { size: IS_DEV ? "invisible" : "normal", callback: () => {} },
        );
        confirmationRef.current = await signInWithPhoneNumber(
          firebaseAuth,
          value.replace(/\s+/g, ""),
          recaptchaRef.current,
        );
      }
      setStatus("ready");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      clearVerifier(recaptchaRef);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    }
  }, [channel, value]);

  // React Strict Mode fires effects twice — ref guard prevents double-send
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    sendCode();
    return () => {
      clearVerifier(recaptchaRef);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyCode = useCallback(
    async (submitCode: string) => {
      if (submitCode.length !== DIGITS) return;
      setStatus("verifying");
      setError("");
      try {
        if (channel === "email") {
          const res = await fetch("/api/auth/verify-email-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: value, code: submitCode }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          if (!res.ok)
            throw new Error(
              data.message ??
                "That code is not right. Check it, or tap Resend code.",
            );
        } else {
          if (!confirmationRef.current)
            throw new Error("Please request a new code");
          const result = await confirmationRef.current.confirm(submitCode);
          const idToken = await result.user.getIdToken();
          await firebaseAuth.signOut();
          const res = await fetch("/api/auth/verify-phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message ?? "Incorrect code");
        }
        setStatus("success");
        setTimeout(onVerified, 1200);
      } catch (err) {
        setStatus("ready");
        setDigits(Array(DIGITS).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        setError(
          err instanceof Error ? err.message : "Incorrect or expired code",
        );
      }
    },
    [channel, value, onVerified],
  );

  const handleDigitChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit) {
      if (index < DIGITS - 1) focusNext(index);
      if (newDigits.every((d) => d !== "")) verifyCode(newDigits.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      verifyCode(code);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, DIGITS);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    const focusIdx = Math.min(pasted.length, DIGITS - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === DIGITS) verifyCode(pasted);
  };

  const masked = maskValue(value, channel);
  const isInputDisabled =
    status === "sending" || status === "verifying" || status === "success";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gradient header ── */}
        <div
          className="relative px-6 pb-6 pt-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon bubble */}
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            {status === "success" ? (
              <CheckCircle2 className="h-7 w-7 text-green-300" />
            ) : channel === "email" ? (
              <Mail className="h-7 w-7 text-white" />
            ) : (
              <PhoneIcon className="h-7 w-7 text-white" />
            )}
          </div>

          <h2 className="text-lg font-bold text-white">
            {status === "success"
              ? "Verified!"
              : `Verify your ${channel === "email" ? "email" : "phone"}`}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {status === "sending"
              ? `Sending code to ${masked}…`
              : status === "success"
                ? "Your verification is complete."
                : `Enter the code sent to ${masked}`}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-6 space-y-5">
          {/* Sending spinner */}
          {status === "sending" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: colors.primary.main }}
              />
              <p className="text-xs text-gray-400">Sending your code…</p>
            </div>
          )}

          {/* 6-digit input grid */}
          {status !== "sending" && (
            <div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: DIGITS }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    disabled={isInputDisabled}
                    aria-label={`Digit ${i + 1}`}
                    className={[
                      "h-14 w-11 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all duration-150",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      status === "success"
                        ? "border-green-400 bg-green-50 text-green-600"
                        : digits[i]
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-900 focus:border-blue-400 focus:bg-blue-50/30 focus:shadow-[0_0_0_3px_rgba(31,78,140,0.12)]",
                    ].join(" ")}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                Code expires in 5 minutes · Enter key submits
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verify button */}
          {status !== "sending" && status !== "success" && (
            <button
              type="button"
              onClick={() => verifyCode(code)}
              disabled={code.length !== DIGITS || status === "verifying"}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: colors.primary.main }}
            >
              {status === "verifying" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify"
              )}
            </button>
          )}

          {/* Success state */}
          {status === "success" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-sm font-semibold text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Verification successful
            </div>
          )}

          {/* Resend */}
          {status !== "success" && (
            <div className="text-center">
              {cooldown > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend available in{" "}
                  <span className="tabular-nums font-medium">{cooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ color: colors.primary.main }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Resend code
                </button>
              )}
            </div>
          )}

          {/* Cancel: back to the form, which keeps everything typed. */}
          {status !== "success" && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

          {/* Container must exist in DOM for RecaptchaVerifier; hidden in dev where appVerificationDisabledForTesting bypasses it */}
          {channel === "phone" && (
            <div
              id={RECAPTCHA_CONTAINER_ID}
              className={IS_DEV ? "hidden" : "flex justify-center"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
