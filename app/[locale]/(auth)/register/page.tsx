"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Eye, EyeOff, UserPlus, ChevronDown, CheckCircle2 } from "lucide-react";
import { colors } from "@/lib/theme/colors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpVerifyModal } from "@/components/auth/OtpVerifyModal";
import { COUNTRIES, getDialCode } from "@/lib/utils/countries";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

function getRedirectTarget(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") ?? params.get("callbackUrl");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
const fieldErrorCls = "border-red-400 focus:ring-red-400";
const fieldVerifiedCls = "border-green-400 bg-green-50/40 focus:ring-green-400";

type FieldErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phone"
    | "verify"
    | "password"
    | "confirmPassword"
    | "terms",
    string
  >
>;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("LK");
  const [locationCity, setLocationCity] = useState("");
  const [dialCode, setDialCode] = useState("+94");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topError, setTopError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [verifyChannel, setVerifyChannel] = useState<"email" | "phone" | null>(
    null,
  );
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Refs for scroll-to-error
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const verifyCardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const code = getDialCode(country);
    if (code) setDialCode(code);
  }, [country]);

  const handleCountryChange = (code: string) => {
    setCountry(code);
    setPhoneLocal("");
    setPhoneVerified(false);
  };

  const clearError = (key: keyof FieldErrors) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
  };

  const fullPhone = `${dialCode} ${phoneLocal}`;
  const isEmailValid = EMAIL_PATTERN.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Collect all field errors before showing any
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.fullName = t("errors.fullNameRequired");
    if (!email.trim()) errors.email = t("errors.emailRequired");
    else if (!isEmailValid) errors.email = t("errors.emailInvalid");
    if (!phoneLocal.trim()) errors.phone = t("errors.phoneRequired");
    if (!emailVerified && !phoneVerified)
      errors.verify = t("errors.verifyRequired");
    if (!password) errors.password = t("errors.passwordRequired");
    else if (password.length < 8)
      errors.password = t("errors.passwordTooShort");
    if (!confirmPassword)
      errors.confirmPassword = t("errors.confirmPasswordRequired");
    else if (password !== confirmPassword)
      errors.confirmPassword = t("errors.passwordMismatch");
    if (!agreeTerms) errors.terms = t("errors.termsRequired");

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // Scroll to the first error in form order
      const scrollOrder: {
        key: keyof FieldErrors;
        ref: React.RefObject<HTMLElement | null>;
      }[] = [
        { key: "fullName", ref: fullNameRef },
        { key: "email", ref: emailRef },
        { key: "phone", ref: phoneRef },
        { key: "verify", ref: verifyCardRef },
        { key: "password", ref: passwordRef },
        { key: "confirmPassword", ref: confirmPasswordRef },
        { key: "terms", ref: termsRef },
      ];
      const first = scrollOrder.find(({ key }) => errors[key]);
      first?.ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setFieldErrors({});
    setTopError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          phone: fullPhone,
          country,
          locationCity: locationCity || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message ?? t("errors.registrationFailed"));

      const result = await signIn("credentials", {
        identifier: email,
        method: "email",
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      router.push(getRedirectTarget() ?? "/");
      router.refresh();
    } catch (err) {
      setTopError(err instanceof Error ? err.message : t("errors.generic"));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-start justify-center bg-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
            <Link
              href="/"
              className="mb-5 inline-flex items-center justify-center"
            >
              <Image
                src="/logo.webp"
                alt="SLMarket.lk"
                width={720}
                height={248}
                priority
                className="h-10 w-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: colors.primary.main }}
              >
                {t("signIn")}
              </Link>
            </p>
          </div>

          {/* Form */}
          <form
            className="px-8 py-7 space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Top-level server error */}
            {topError && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {topError}
              </div>
            )}

            {/* Full Name */}
            <div>
              <Input
                ref={fullNameRef}
                label={t("fullName")}
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder={t("fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearError("fullName");
                }}
                error={!!fieldErrors.fullName}
                fullWidth
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* ── Verification card ── */}
            <div
              ref={verifyCardRef}
              className="rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Card sub-header */}
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("verifyIdentity")}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t("verifyIdentityHint")}
                </p>
              </div>

              {/* Email */}
              <div className="px-4 py-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("emailAddress")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={emailRef}
                    type="email"
                    id="email-address"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailVerified(false);
                      clearError("email");
                      clearError("verify");
                    }}
                    className={`${fieldCls} ${
                      emailVerified
                        ? `${fieldVerifiedCls} pr-28`
                        : fieldErrors.email
                          ? fieldErrorCls
                          : ""
                    }`}
                  />
                  {emailVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 pointer-events-none">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("verified")}
                    </span>
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={() => setVerifyChannel("email")}
                    disabled={!isEmailValid}
                    className="mt-1.5 cursor-pointer text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
                    style={{ color: colors.primary.main }}
                  >
                    {t("sendEmailCode")}
                  </button>
                )}
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-y border-gray-100">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-medium">
                  {t("orVerifyPhone")}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Country */}
              <div className="px-4 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("country")}
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={`${fieldCls} pr-10 appearance-none cursor-pointer`}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Phone */}
              <div className="px-4 pt-3 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("phoneNumber")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 whitespace-nowrap select-none">
                    {dialCode}
                  </div>
                  <input
                    ref={phoneRef}
                    type="tel"
                    value={phoneLocal}
                    onChange={(e) => {
                      setPhoneLocal(
                        e.target.value.replace(/[^0-9\s\-()]/g, ""),
                      );
                      setPhoneVerified(false);
                      clearError("phone");
                      clearError("verify");
                    }}
                    placeholder={t("phonePlaceholder")}
                    required
                    className={`flex-1 ${fieldCls} ${
                      phoneVerified
                        ? fieldVerifiedCls
                        : fieldErrors.phone
                          ? fieldErrorCls
                          : ""
                    }`}
                  />
                  {phoneVerified && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap pl-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("verified")}
                    </div>
                  )}
                </div>
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.phone}
                  </p>
                )}
                {!phoneVerified && (
                  <button
                    type="button"
                    onClick={() => setVerifyChannel("phone")}
                    disabled={!phoneLocal.trim()}
                    className="mt-1.5 cursor-pointer text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
                    style={{ color: colors.primary.main }}
                  >
                    {t("sendSmsCode")}
                  </button>
                )}
              </div>

              {/* Verify error, shown at bottom of card */}
              {fieldErrors.verify && (
                <div className="mx-4 mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                  {fieldErrors.verify}
                </div>
              )}
            </div>
            {/* ── end verification card ── */}

            {/* City / Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("cityRegion")}
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  {t("optional")}
                </span>
              </label>
              <input
                type="text"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder={
                  country === "LK"
                    ? t("cityPlaceholderLK")
                    : country === "IN"
                      ? t("cityPlaceholderIN")
                      : t("cityPlaceholderDefault")
                }
                className={fieldCls}
              />
            </div>

            {/* Password */}
            <div>
              <Input
                ref={passwordRef}
                label={t("password")}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder={t("passwordPlaceholder")}
                helperText={
                  !fieldErrors.password ? t("passwordHelper") : undefined
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                  clearError("confirmPassword");
                }}
                error={!!fieldErrors.password}
                fullWidth
                rightIcon={
                  showPassword ? (
                    <Eye
                      className="h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <EyeOff
                      className="h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )
                }
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                ref={confirmPasswordRef}
                label={t("confirmPassword")}
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                error={!!fieldErrors.confirmPassword}
                fullWidth
                rightIcon={
                  showConfirmPassword ? (
                    <Eye
                      className="h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <EyeOff
                      className="h-5 w-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowConfirmPassword(true)}
                    />
                  )
                }
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div ref={termsRef}>
              <div className="flex items-start gap-2.5">
                <input
                  id="agree-terms"
                  name="agreeTerms"
                  type="checkbox"
                  className="h-4 w-4 rounded mt-0.5 shrink-0 cursor-pointer"
                  style={{ accentColor: colors.primary.main }}
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    clearError("terms");
                  }}
                />
                <label
                  htmlFor="agree-terms"
                  className="text-sm text-gray-600 leading-snug cursor-pointer"
                >
                  {t("agreeTerms")}{" "}
                  <a
                    href="#"
                    className="font-semibold hover:underline"
                    style={{ color: colors.primary.main }}
                  >
                    {t("termsOfService")}
                  </a>{" "}
                  {t("and")}{" "}
                  <a
                    href="#"
                    className="font-semibold hover:underline"
                    style={{ color: colors.primary.main }}
                  >
                    {t("privacyPolicy")}
                  </a>
                </label>
              </div>
              {fieldErrors.terms && (
                <p className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.terms}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              leftIcon={<UserPlus className="h-5 w-5" />}
            >
              {loading ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>
        </div>
      </div>

      {verifyChannel && (
        <OtpVerifyModal
          channel={verifyChannel}
          value={verifyChannel === "email" ? email : fullPhone}
          onClose={() => setVerifyChannel(null)}
          onVerified={() => {
            if (verifyChannel === "email") setEmailVerified(true);
            else setPhoneVerified(true);
            setVerifyChannel(null);
            clearError("verify");
          }}
        />
      )}
    </div>
  );
}
