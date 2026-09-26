import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Routes sit behind a locale prefix (/en/admin, /ta/admin, ...), so a
      // bare "/admin/" rule wouldn't match — wildcard past the locale
      // segment instead. Everything here is either private (admin,
      // dashboard, account, messages), a dead-end for a crawler (auth
      // pages, the post-ad flow), or would create thin/duplicate-content
      // pages (query-string search results) — none of it should compete
      // with real listing/category/business pages for crawl budget or
      // show up in search results.
      disallow: [
        "/api/",
        "/*/admin/",
        "/*/dashboard/",
        "/*/account/",
        "/*/messages",
        "/*/login",
        "/*/register",
        "/*/post-ad",
        "/*/business/new",
        "/*/ads?*",
        "/*/ads/*?*",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
