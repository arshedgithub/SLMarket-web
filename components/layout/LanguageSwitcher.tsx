"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";

// Each language in its own script, so a Sinhala or Tamil reader finds it
// without reading English first.
const LANGUAGES: { code: Locale; short: string; name: string }[] = [
  { code: "en", short: "EN", name: "English" },
  { code: "si", short: "සිං", name: "සිංහල" },
  { code: "ta", short: "த", name: "தமிழ்" },
];

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("changeLanguage")}
      className="flex items-center rounded-full border border-border bg-surface p-0.5"
    >
      {LANGUAGES.map(({ code, short, name }) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-label={name}
            title={name}
            onClick={() =>
              !active && router.replace(pathname, { locale: code })
            }
            className={`flex h-8 items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
              compact ? "min-w-8 px-1.5 text-xs" : "min-w-9 px-2.5 text-[13px]"
            } ${active ? "bg-primary text-white" : "text-light-text hover:text-text"}`}
          >
            {compact || code === "en" ? short : name}
          </button>
        );
      })}
    </div>
  );
}
