import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import {
  canonicalDealsUrl,
  type RawSearchParams,
} from "@/app/[locale]/(root)/ads/_components/dealRoutes";

const { auth } = NextAuth(authConfig);
const handleI18nRouting = createMiddleware(routing);

const ACCOUNT_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

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

export default auth((req) => {
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

  const session = req.auth;
  const role = session?.user?.role;

  const isAccountRoute = ACCOUNT_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  const withLocale = (path: string) => new URL(`/${locale}${path}`, req.url);

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
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico)$).*)",
  ],
};
