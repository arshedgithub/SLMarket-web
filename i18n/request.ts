import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// One JSON file per feature namespace, per locale (messages/<locale>/<ns>.json)
// instead of one giant per-locale file — keeps translator/PR diffs scoped to
// the feature being worked on as more of the app gets translated. Add the
// namespace name here once a new area (home, dashboard, admin, ...) starts
// using useTranslations/getTranslations.
const NAMESPACES = ["nav", "auth", "seo", "home", "categories"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const namespaceModules = await Promise.all(
    NAMESPACES.map(
      (namespace) => import(`../messages/${locale}/${namespace}.json`),
    ),
  );

  const messages = Object.fromEntries(
    NAMESPACES.map((namespace, i) => [namespace, namespaceModules[i].default]),
  );

  return { locale, messages };
});
// touch
// touch2

// touch
