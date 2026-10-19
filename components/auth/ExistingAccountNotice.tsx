"use client";

import { useTranslations } from "next-intl";
import { LogIn } from "lucide-react";
import { Link } from "@/i18n/navigation";

/*
 * Shown on the sign-up form when the email or phone already belongs to an
 * account: says so plainly and offers one big button to sign in instead,
 * with the email or phone already filled in.
 */
export function ExistingAccountNotice({
  kind,
  value,
  next,
}: {
  kind: "email" | "phone";
  value: string;
  next: string | null;
}) {
  const t = useTranslations("auth.register.exists");
  const params = new URLSearchParams({ returning: "1", [kind]: value });
  if (next) params.set("next", next);

  return (
    <div
      role="alert"
      className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-900"
    >
      <p className="font-semibold">
        {kind === "email" ? t("emailTitle") : t("phoneTitle")}
      </p>
      <p className="mt-0.5 text-amber-900/90">{t("desc")}</p>
      <Link
        href={`/login?${params.toString()}`}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1557d6] text-sm font-semibold text-white hover:bg-[#104dcc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <LogIn aria-hidden className="h-4 w-4" />
        {kind === "email" ? t("signInEmail") : t("signInPhone")}
      </Link>
      <p className="mt-2 text-xs text-amber-900/80">{t("different")}</p>
    </div>
  );
}
