import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // The floating "N" badge is dev-only; off so it never shows in demos.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // A handful of first-party category thumbnails are inline SVG
    // illustrations we author ourselves (see public/images/marketplace).
    // They are never user-supplied, so serving them through next/image is
    // safe; the CSP still blocks scripts inside any SVG.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // How long the Next.js Image Optimization cache (and any CDN in front of
    // it) keeps an optimized derivative before re-checking the source.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — these static category/nav images rarely change
    // 75 is next/image's implicit default; 40 is used for the low-priority
    // homepage hero background. Next 16 requires every quality value used
    // via the `quality` prop to be listed here explicitly.
    qualities: [40, 75],
  },

  // Expose only safe public env vars
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk",
  },

  serverExternalPackages: ["bcryptjs"],

  // Type errors are gated in CI by `npm run typecheck` (a ratchet over the
  // legacy errors in scripts/ci/typecheck-baseline.json: no new ones can
  // merge). The build's own all-or-nothing check would fail every deploy on
  // that legacy code, so it is skipped here; CI must pass before deploying.
  typescript: { ignoreBuildErrors: true },

  // Turbopack's on-disk dev cache (.next/dev/cache) grows to ~2 GB. On a
  // machine short of disk space, set NEXT_DEV_FS_CACHE=off in .env.local:
  // dev restarts are slower, nothing else changes.
  experimental: {
    turbopackFileSystemCacheForDev: process.env.NEXT_DEV_FS_CACHE !== "off",
  },

  turbopack: {
    root: __dirname,
  },

  async headers() {
    return [
      {
        // Static marketing/category images under /public — they're
        // content-hashed by filename changes only, so cache them
        // aggressively at the browser and CDN level.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
