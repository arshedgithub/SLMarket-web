import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import { categories } from "@/config/const/navLinks";
import { districtFromSlug } from "@/lib/business/directory/geo";
import { RESERVED_SLUGS } from "@/lib/business/slug";
import { businessStatus, isShortLinkTarget } from "@/lib/business/status";
import { isLiveAd } from "@/lib/listings/adView";
import { redis } from "@/lib/redis";
import {
  canonicalDealsUrl,
  type RawSearchParams,
} from "@/app/[locale]/(root)/ads/_components/dealRoutes";

const { auth } = NextAuth(authConfig);
const handleI18nRouting = createMiddleware(routing);

const ACCOUNT_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];
// Set once someone has signed in (or picks "Sign in"): /login then stays
// on the sign-in form instead of starting on "Create account".
const RETURNING_COOKIE = "slm_returning";

// Route-protection below is written against locale-free paths (e.g.
// "/dashboard"), so strip the "/en" | "/ta" | "/si" prefix next-intl adds
// before matching, and re-add it whenever we build a redirect URL.
function splitLocale(pathname: string) {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (match && (routing.locales as readonly string[]).includes(match[1])) {
    return { locale: match[1], pathname: match[2] ?? "/" };
  }
  return { locale: routing.defaultLocale, pathname };
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";

// A directory URL carrying any of these is a filtered/sorted/searched view:
// useful to visitors, but kept out of search results and pointed at the plain
// page as its canonical. (Page 2, 3... of a plain page stay indexable.)
const DIRECTORY_VIEW_PARAMS = [
  "q",
  "sort",
  "verified",
  "open",
  "rating",
  "delivery",
  "distance",
  "instalment",
  "brand",
  "view",
  "district",
  "bounds",
];

const isLocale = (s: string) =>
  (routing.locales as readonly string[]).includes(s);

// A page that does not exist gets a real 404 status. The app-wide loading
// boundary means a not-found raised inside a page would still go out as 200
// (a soft 404), so the check happens here, before rendering starts.
// `kind: "ad"` tells app/[locale]/not-found.tsx to show the ad-specific page.
function notFound(
  req: { url: string; headers: Headers },
  locale: string,
  kind: "ad" | "page" = "page",
) {
  const headers = new Headers(req.headers);
  headers.set("x-not-found", kind);
  return NextResponse.rewrite(new URL(`/${locale}/not-found-404`, req.url), {
    request: { headers },
  });
}

export default auth(async (req) => {
  // Short link: slmarket.lk/<slug> goes straight (one 301) to the business
  // page, before locale routing adds its own hop. Existing routes always win:
  // anything reserved (routes, categories, districts, future features) is
  // never treated as a business name.
  const shortMatch = req.nextUrl.pathname.match(
    /^\/([a-z0-9][a-z0-9-]{1,28}[a-z0-9])\/?$/,
  );
  if (
    shortMatch &&
    !isLocale(shortMatch[1]) &&
    !RESERVED_SLUGS.has(shortMatch[1])
  ) {
    const slug = shortMatch[1];
    if (await isShortLinkTarget(slug)) {
      const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
      const locale =
        cookieLocale && isLocale(cookieLocale)
          ? cookieLocale
          : routing.defaultLocale;
      // Count the hit (channel from ?src=), then redirect keeping the query
      // string so campaign tags survive.
      void redis
        .lpush(
          "short-link-hits",
          JSON.stringify({
            slug,
            src: req.nextUrl.searchParams.get("src"),
            referrer: req.headers.get("referer"),
            mobile: /mobile|android|iphone/i.test(
              req.headers.get("user-agent") ?? "",
            ),
            ts: Date.now(),
          }),
        )
        .catch(() => {});
      return NextResponse.redirect(
        new URL(`/${locale}/business/${slug}${req.nextUrl.search}`, req.url),
        301,
      );
    }
  }

  // Resolves/redirects to add a locale prefix when it's missing. When it's
  // already present this just returns NextResponse.next() (plus whatever
  // locale-detection cookie/headers next-intl needs) — nothing to override.
  const intlResponse = handleI18nRouting(req);
  const isRedirect = intlResponse.status >= 300 && intlResponse.status < 400;
  if (isRedirect) {
    return intlResponse;
  }

  const { locale, pathname } = splitLocale(req.nextUrl.pathname);

  // One URL per deals result set: ?deal=coupon on /ads or the wrong deals
  // route is a permanent redirect to /ads/deals/coupons, and so on.
  // Negotiable is no longer a deal type: its old route goes to all deals.
  if (/^\/ads\/deals\/negotiable\/?$/.test(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/ads/deals`, req.url), 308);
  }

  if (/^\/ads(\/deals(\/[^/]+)?)?\/?$/.test(pathname)) {
    const searchParams: RawSearchParams = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      searchParams[key] = ([] as string[]).concat(
        searchParams[key] ?? [],
        value,
      );
    });
    const canonical = canonicalDealsUrl(
      pathname.replace(/\/$/, ""),
      searchParams,
    );
    if (canonical) {
      return NextResponse.redirect(
        new URL(`/${locale}${canonical}`, req.url),
        308,
      );
    }
  }

  // Ads: an unknown category or subcategory, any deeper path, and an ad
  // that is not live are real 404s with the ad-specific page.
  const adsMatch = pathname.match(/^\/ads\/([^/]+)(?:\/([^/]+))?(\/.+)?\/?$/);
  if (adsMatch && adsMatch[1] !== "deals") {
    const [, first, second, deeper] = adsMatch;
    const category = categories.find((c) => c.id === first);
    if (
      !category ||
      deeper ||
      (second && !category.subcategories.some((s) => s.id === second))
    ) {
      return notFound(req, locale, "ad");
    }
  }
  const adMatch = pathname.match(/^\/ad(?:\/([^/]+))?(\/.+)?\/?$/);
  if (adMatch) {
    const [, slug, deeper] = adMatch;
    const ogImage = deeper?.startsWith("/opengraph-image");
    if (
      !slug ||
      (deeper && !ogImage) ||
      (!ogImage && !(await isLiveAd(slug)))
    ) {
      return notFound(req, locale, "ad");
    }
  }

  // Business pages: a missing or suspended business is a real 404.
  const businessMatch = pathname.match(
    /^\/business\/([a-z0-9-]+)(?:\/(?:reviews|questions))?\/?$/,
  );
  if (businessMatch && businessMatch[1] !== "new") {
    if ((await businessStatus(businessMatch[1])) !== "active")
      return notFound(req, locale);
  }

  // Directory URLs: validate the category and second segment, send an old
  // /businesses/<business-slug> link to that business, and keep filtered
  // views out of the index.
  const directoryMatch = pathname.match(
    /^\/businesses(?:\/([^/]+))?(?:\/([^/]+))?\/?$/,
  );
  if (directoryMatch) {
    const [, first, second] = directoryMatch;
    if (first) {
      const category = categories.find((c) => c.id === first);
      if (!category) {
        if (
          !second &&
          (await businessStatus(first)) === "active" &&
          /^[a-z0-9-]+$/.test(first)
        ) {
          return NextResponse.redirect(
            new URL(`/${locale}/business/${first}`, req.url),
            308,
          );
        }
        return notFound(req, locale);
      }
      if (
        second &&
        !category.subcategories.some((s) => s.id === second) &&
        !districtFromSlug(second)
      ) {
        return notFound(req, locale);
      }
    }
    if (DIRECTORY_VIEW_PARAMS.some((k) => req.nextUrl.searchParams.has(k))) {
      intlResponse.headers.set("X-Robots-Tag", "noindex, follow");
      intlResponse.headers.set(
        "Link",
        `<${BASE_URL}/${locale}${pathname.replace(/\/$/, "")}>; rel="canonical"`,
      );
    }
  }

  const session = req.auth;
  const role = session?.user?.role;

  const isAccountRoute = ACCOUNT_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  const withLocale = (path: string) => new URL(`/${locale}${path}`, req.url);

  // First-time visitors who follow "Sign in" start on "Create account";
  // anyone who has signed in before (or picks the Sign in tab) does not.
  if (
    pathname === "/login" &&
    !session &&
    !req.cookies.has(RETURNING_COOKIE) &&
    !req.nextUrl.searchParams.has("returning")
  ) {
    return NextResponse.redirect(withLocale(`/register${req.nextUrl.search}`));
  }
  if (
    (session || req.nextUrl.searchParams.has("returning")) &&
    !req.cookies.has(RETURNING_COOKIE)
  ) {
    intlResponse.cookies.set(RETURNING_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const to = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(withLocale(to));
  }

  // Dashboard — any signed-in user. There's no seller/buyer split any more:
  // every account can post listings, and creating a business profile is an
  // upgrade, not a different role.
  if (isAccountRoute && !session) {
    return NextResponse.redirect(withLocale(`/login?callbackUrl=${pathname}`));
  }

  // Protect admin — admins only
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(withLocale("/"));
  }

  return intlResponse;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|tiles|vendor|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico)$).*)",
  ],
};
