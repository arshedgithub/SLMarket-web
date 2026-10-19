import { categories } from "@/config/const/navLinks";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";

/*
 * Business page addresses.
 *   Canonical: /business/<slug>   (permanent, used for SEO and internal links)
 *   Short:     /<slug>            (redirects to the canonical; QR posters,
 *                                  bios; verified businesses only)
 * Names live in a flat namespace, so anything the site itself uses, or may
 * use later, is reserved.
 */

export const SLUG_MIN = 3;
export const SLUG_MAX = 30;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

const ROUTES_AND_FUTURE = [
  "ads",
  "ad",
  "about",
  "account",
  "admin",
  "api",
  "app",
  "blog",
  "business",
  "businesses",
  "careers",
  "chat",
  "chats",
  "contact",
  "dashboard",
  "deals",
  "en",
  "help",
  "login",
  "logout",
  "messages",
  "post-ad",
  "pricing",
  "privacy",
  "register",
  "sell",
  "settings",
  "shop",
  "si",
  "store",
  "subscription",
  "support",
  "ta",
  "terms",
];

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  ...ROUTES_AND_FUTURE,
  ...categories.map((c) => c.id),
  ...SRI_LANKA_DISTRICTS.map((d) => slugify(d.name)),
]);

export type SlugCheck = "ok" | "length" | "characters" | "reserved";

export function checkSlug(slug: string): SlugCheck {
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) return "length";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "characters";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return "ok";
}

export function businessHref(nameOrSlug: string): string {
  return `/business/${slugify(nameOrSlug)}`;
}
