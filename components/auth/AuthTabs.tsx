"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/*
 * "Sign in | Create account" on both auth pages, keeping where the visitor
 * was going (?next=). First-time visitors land on Create account (see
 * proxy.ts); choosing Sign in here marks them as returning.
 */
export function AuthTabs({ active }: { active: "signIn" | "register" }) {
  const t = useTranslations("auth.tabs");
  const [next, setNext] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const target = p.get("next") ?? p.get("callbackUrl");
    if (target) setNext(`next=${encodeURIComponent(target)}`);
  }, []);

  const tabs = [
    {
      key: "signIn" as const,
      label: t("signIn"),
      href: `/login?returning=1${next ? `&${next}` : ""}`,
    },
    {
      key: "register" as const,
      label: t("register"),
      href: `/register${next ? `?${next}` : ""}`,
    },
  ];

  return (
    <nav
      aria-label={t("label")}
      className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/10"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition ${
            tab.key === active
              ? "bg-[#1557d6] text-white shadow-sm"
              : "text-gray-700 hover:text-gray-900 dark:text-gray-300"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
