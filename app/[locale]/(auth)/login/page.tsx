"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { signIn, getSession } from "next-auth/react";
import Image from "next/image";
import { Eye, EyeOff, Lock, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthMethodSwitch } from "@/components/auth/AuthMethodSwitch";
import { COUNTRIES, getDialCode } from "@/lib/utils/countries";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/theme/colors";

// Different parts of the app link to /login with either ?next= (e.g. the
// navbar's "Sell" link, EnquiryModal, MessageSellerButton) or ?callbackUrl=
// (the proxy.ts middleware redirect). Read both so neither path silently
// drops the user's intended destination.
function getRedirectTarget(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") ?? params.get("callbackUrl");
}

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("LK");
  const [dialCode, setDialCode] = useState("+94");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = getDialCode(country);
    if (code) setDialCode(code);
  }, [country]);

  const handleMethodChange = (next: "email" | "phone") => {
    setMethod(next);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const identifier = method === "email" ? email : `${dialCode} ${phoneLocal}`;

    try {
      const result = await signIn("credentials", {
        identifier,
        method,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(method === "email" ? t("invalidEmail") : t("invalidPhone"));
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      const redirectTarget = getRedirectTarget();

      // router.push alone already fetches fresh server data for the
      // destination route; a trailing router.refresh() here would just
      // discard that fetch and re-request the same page a second time.
      if (redirectTarget) {
        router.push(redirectTarget);
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "SELLER") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      // Leave loading=true here on purpose: the button stays disabled and
      // spinning until the destination page actually replaces this one,
      // instead of flashing back to its normal state during the navigation
      // gap (the exact "re-enables, then nothing happens for a beat" UX bug).
    } catch {
      setError(t("genericError"));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--color-luxury-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full mx-auto space-y-8 bg-[var(--color-luxury-surface)] border border-[var(--color-luxury-border)] p-8 rounded-lg shadow-lg">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/logo.webp"
              alt="SLMarket.lk"
              width={720}
              height={248}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-[var(--color-luxury-text)]">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-luxury-text-body)]">
            {t("orCreateAccount")}
            <br />
            <Link
              href="/register"
              className="font-bold text-primary dark:text-primary-light hover:underline"
            >
              {t("createAccount")}
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <AuthMethodSwitch value={method} onChange={handleMethodChange} />

          <div className="space-y-4">
            {method === "email" ? (
              <Input
                label={t("emailAddress")}
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-[var(--color-luxury-text-secondary)] mb-1.5">
                  {t("phoneNumber")}
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-full appearance-none border border-[var(--color-luxury-border)] rounded-lg pl-3 pr-8 py-2.5 text-sm bg-[var(--color-luxury-bg)] text-[var(--color-luxury-text)] font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-luxury-text-body)] pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phoneLocal}
                    onChange={(e) =>
                      setPhoneLocal(e.target.value.replace(/[^0-9\s\-()]/g, ""))
                    }
                    placeholder={t("phonePlaceholder")}
                    className="flex-1 border border-[var(--color-luxury-border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--color-luxury-surface)] text-[var(--color-luxury-text)] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <Input
              label={t("password")}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ color: colors.primary.main }}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                {t("rememberMe")}
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium"
                style={{ color: colors.primary.main }}
              >
                {t("forgotPassword")}
              </a>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            leftIcon={<Lock className="h-5 w-5" />}
          >
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
