/*
 * Where a spotlight goes, from the admin's destination type and value.
 * External links must be https, never a URL shortener (the buyer has to
 * be able to see where they will land), and get UTM tags.
 */

export type DestinationType = "STORE" | "LIST" | "AD" | "EXTERNAL";

const SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
  "rb.gy",
  "tiny.cc",
  "s.id",
  "t.ly",
]);

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;

export type Destination = {
  href: string;
  external: boolean;
  domain: string | null;
};

export function resolveDestination(
  type: DestinationType,
  value: string,
): Destination {
  const v = value.trim();
  switch (type) {
    case "STORE":
      if (!SLUG.test(v))
        throw new Error(
          "Enter the business's page name (its slug), e.g. digital-hub.",
        );
      return { href: `/business/${v}`, external: false, domain: null };
    case "AD":
      if (!SLUG.test(v))
        throw new Error("Enter the ad's page name (its slug).");
      return { href: `/ad/${v}`, external: false, domain: null };
    case "LIST": {
      const path = v.startsWith("/") ? v : `/ads?${v.replace(/^\?/, "")}`;
      if (!/^\/ads(\/|\?|$)/.test(path))
        throw new Error(
          "Ad lists start with /ads, e.g. /ads/vehicles?location=Colombo.",
        );
      return { href: path, external: false, domain: null };
    }
    case "EXTERNAL": {
      let url: URL;
      try {
        url = new URL(v);
      } catch {
        throw new Error("Enter a full web address, starting with https://.");
      }
      if (url.protocol !== "https:")
        throw new Error("External links must use https.");
      const host = url.hostname.replace(/^www\./, "");
      if (SHORTENERS.has(host))
        throw new Error("Use the real address, not a link shortener.");
      url.searchParams.set("utm_source", "slmarket");
      url.searchParams.set("utm_medium", "spotlight");
      return { href: url.toString(), external: true, domain: host };
    }
  }
}
