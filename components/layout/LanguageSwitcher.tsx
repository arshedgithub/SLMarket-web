"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useFocusTrap } from "@/hooks/useFocusTrap";

// Each language in its own script, so a Sinhala or Tamil reader finds it
// without reading English first.
const LANGUAGES: { code: Locale; short: string; name: string }[] = [
  { code: "en", short: "EN", name: "English" },
  { code: "si", short: "සිං", name: "සිංහල" },
  { code: "ta", short: "த", name: "தமிழ்" },
];

// On unless NEXT_PUBLIC_I18N_ENABLED is "false" (a switch to hide the
// language menu if a translation is ever not ready).
export const I18N_ENABLED = process.env.NEXT_PUBLIC_I18N_ENABLED !== "false";

/*
 * One compact control: a globe and the current language ("EN"), opening a
 * menu with each language in its own script. next-intl remembers the choice
 * in its locale cookie and sets <html lang>.
 */
export default function LanguageSwitcher({
  align = "right",
}: {
  align?: "left" | "right";
}) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick([wrapRef], () => setOpen(false));
  useFocusTrap(menuRef, open, () => setOpen(false));

  if (!I18N_ENABLED) return null;
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("changeLanguage")}: ${current.name}`}
        className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-2 text-sm font-semibold text-light-text transition-colors hover:bg-background hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <Globe aria-hidden className="h-[18px] w-[18px]" />
        <span lang={current.code}>{current.short}</span>
        <ChevronDown
          aria-hidden
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t("changeLanguage")}
          className={`absolute top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg dark:bg-[#111d30] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {LANGUAGES.map(({ code, name }) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={code}
                onClick={() => {
                  setOpen(false);
                  if (!active) router.replace(pathname, { locale: code });
                }}
                className="flex h-11 w-full items-center justify-between rounded-lg px-3 text-[15px] text-text hover:bg-background"
              >
                {name}
                {active && (
                  <Check aria-hidden className="h-4 w-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
