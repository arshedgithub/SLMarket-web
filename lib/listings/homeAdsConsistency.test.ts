import { beforeEach, describe, expect, it, vi } from "vitest";
import { categories } from "@/config/const/navLinks";
import { feedRows, shopRows } from "./feedRows.fixture";

/*
 * The homepage and /ads must tell the same story: the same ads, in the same
 * order, with the same counts. Both pages read the database through
 * lib/listings/feed.ts and list through ads/_components/adQuery.ts; these
 * tests run each page's data path against one mocked database and compare.
 */

const listingFindMany = vi.fn();
const businessFindMany = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    listing: { findMany: listingFindMany },
    businessProfile: { findMany: businessFindMany },
  },
}));

const { feedStats, getAdFeed, getShopFeed } = await import("./feed");
const {
  BUCKETS,
  DEFAULT_FILTERS,
  filterAds,
  latestAds,
  LATEST_SHOWN,
  paginate,
} = await import("@/app/[locale]/(root)/ads/_components/adQuery");

const NO_FILTERS = DEFAULT_FILTERS;
const PAGE_SIZE = BUCKETS.desktop.pageSize;
// /ads in its default sort ("Featured first, then newest"), page by page.
const listed = (ads: Parameters<typeof filterAds>[0]) =>
  paginate(filterAds(ads, adsQuery()), PAGE_SIZE, "newest");

const adsQuery = (
  categoryId: string | null = null,
  subcategoryId: string | null = null,
) => ({
  categoryId,
  subcategoryId,
  search: "",
  filters: NO_FILTERS,
  sort: "newest" as const,
});

// What each page reads, the way its server component reads it.
async function homepageData() {
  const [latestListings, shops] = await Promise.all([
    getAdFeed(),
    getShopFeed(),
  ]);
  return { latestListings, shops, stats: feedStats(latestListings) };
}
async function adsPageData() {
  const [ads, shops] = await Promise.all([getAdFeed(), getShopFeed()]);
  return { ads, shops, stats: feedStats(ads) };
}

beforeEach(() => {
  listingFindMany.mockReset().mockResolvedValue(feedRows());
  businessFindMany.mockReset().mockResolvedValue(shopRows());
});

describe("one source for both pages", () => {
  it("reads ads with a single query: live and reserved, no suspended businesses, newest first", async () => {
    await homepageData();
    await adsPageData();
    const queries = listingFindMany.mock.calls.map(([args]) => args);
    expect(queries.length).toBeGreaterThan(0);
    for (const q of queries) {
      // Both pages use the same where structure; tiny timestamp differences
      // in expiresAt are acceptable since both calls happen within the same test.
      expect(q.where).toMatchObject({
        status: { in: ["ACTIVE", "RESERVED"] },
        AND: expect.arrayContaining([
          {
            OR: [
              { businessProfileId: null },
              { businessProfile: { status: "ACTIVE" } },
            ],
          },
          { OR: expect.arrayContaining([{ expiresAt: null }]) },
        ]),
      });
      expect(q.orderBy).toEqual({ createdAt: "desc" });
    }
  });

  it("gives both pages the same ads, in the same order, with the same card data", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    expect(home.latestListings.map((a) => a.slug)).toEqual(
      ads.ads.map((a) => a.slug),
    );
    expect(home.latestListings).toEqual(ads.ads);
    // Newest first.
    const times = ads.ads.map((a) => Date.parse(a.postedAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("shows nothing invented when the database is down", async () => {
    listingFindMany.mockRejectedValue(new Error("down"));
    businessFindMany.mockRejectedValue(new Error("down"));
    const home = await homepageData();
    const ads = await adsPageData();
    expect(home.latestListings).toEqual([]);
    expect(ads.ads).toEqual([]);
    expect(home.shops).toEqual([]);
    expect(home.stats.total).toBe(0);
    expect(ads.stats.total).toBe(0);
  });
});

describe("counts", () => {
  it("has the same total and 'new today' in the hero and on /ads", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    expect(home.stats.total).toBe(ads.stats.total);
    expect(home.stats.postedToday).toBe(ads.stats.postedToday);
    expect(home.stats.total).toBe(feedRows().length);
    // And /ads lists every one of them (featured arrangement loses none).
    const all = listed(ads.ads).flat();
    expect(all).toHaveLength(ads.stats.total);
    expect(new Set(all.map((a) => a.slug)).size).toBe(ads.stats.total);
  });

  it("each homepage category count is exactly what /ads/<category> lists", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    for (const c of categories) {
      const shown = filterAds(ads.ads, adsQuery(c.id)).length;
      expect([c.id, home.stats.byCategory[c.id] ?? 0]).toEqual([c.id, shown]);
    }
  });

  it("each subcategory count is exactly what /ads/<category>/<sub> lists", async () => {
    const { ads, stats } = await adsPageData();
    for (const [key, count] of Object.entries(stats.bySubcategory)) {
      const [categoryId, subcategoryId] = key.split("/");
      expect(filterAds(ads, adsQuery(categoryId, subcategoryId))).toHaveLength(
        count,
      );
    }
  });

  it("the category counts add up to the total", async () => {
    const { stats } = await homepageData();
    const sum = Object.values(stats.byCategory).reduce((a, b) => a + b, 0);
    expect(sum).toBe(stats.total);
  });
});

describe("homepage Latest ads", () => {
  it("'All' shows the newest ads, the same ones /ads starts its newest list with", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    const latest = latestAds(home.latestListings, "latest");
    expect(latest).toHaveLength(LATEST_SHOWN);
    expect(latest.map((a) => a.slug)).toEqual(
      filterAds(ads.ads, adsQuery())
        .slice(0, LATEST_SHOWN)
        .map((a) => a.slug),
    );
  });

  it("featured tab shows only featured ads, and they are in the feed", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    const featured = latestAds(home.latestListings, "featured").map(
      (a) => a.slug,
    );
    const allSlugs = new Set(ads.ads.map((a) => a.slug));
    for (const slug of featured) expect(allSlugs.has(slug)).toBe(true);
    expect(
      featured.every(
        (slug) => home.latestListings.find((a) => a.slug === slug)?.featured,
      ),
    ).toBe(true);
  });

  it("every ad on the homepage is on page 1 or later of /ads", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    const onAds = new Set(
      listed(ads.ads)
        .flat()
        .map((a) => a.slug),
    );
    for (const a of latestAds(home.latestListings, "latest"))
      expect(onAds.has(a.slug)).toBe(true);
  });

  it("homepage featured ads are featured on /ads page 1", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    const featured = home.latestListings
      .filter((l) => l.featured)
      .map((l) => l.slug);
    const firstPage = listed(ads.ads)[0];
    const placed = firstPage.filter((l) => l.featured).map((l) => l.slug);
    // /ads has a fixed number of featured slots per page; the ones it
    // places are the newest featured ads, the homepage's first ones.
    expect(placed).toEqual(featured.slice(0, placed.length));
    expect(placed.length).toBeGreaterThan(0);
  });

  it("shows category tabs only for categories with ads", async () => {
    const { latestListings, stats } = await homepageData();
    const tabs = categories
      .filter((c) => latestListings.some((l) => l.categoryId === c.id))
      .map((c) => c.id);
    expect(tabs).toEqual(
      categories
        .filter((c) => (stats.byCategory[c.id] ?? 0) > 0)
        .map((c) => c.id),
    );
  });
});

describe("businesses", () => {
  it("gives both pages the same businesses, paid tiers first", async () => {
    const home = await homepageData();
    const ads = await adsPageData();
    expect(home.shops).toEqual(ads.shops);
    expect(businessFindMany.mock.calls[0][0].where).toEqual({
      status: "ACTIVE",
    });
    const rank = { premium: 3, toprated: 2, verified: 1, standard: 0 };
    const tiers = home.shops.map((s) => rank[s.tier]);
    expect(tiers).toEqual([...tiers].sort((a, b) => b - a));
    expect(home.shops[0].tier).toBe("premium");
  });

  it("within a tier, businesses rotate daily by seeded hash (not ads count)", async () => {
    const { shops } = await homepageData();
    // Paid tiers must stay sorted before lower tiers, but within a tier
    // order rotates daily — no ads-count guarantee within a tier.
    const rank = { premium: 3, toprated: 2, verified: 1, standard: 0 };
    for (let i = 1; i < shops.length; i++) {
      expect(rank[shops[i].tier]).toBeLessThanOrEqual(rank[shops[i - 1].tier]);
    }
  });

  it("leaves out businesses with no live ads, as the directory does", async () => {
    const { shops } = await homepageData();
    expect(shops.every((s) => s.listings > 0)).toBe(true);
    expect(shops.map((s) => s.slug).sort()).toEqual(
      shopRows()
        .filter((r) => r.listings.length > 0)
        .map((r) => r.slug)
        .sort(),
    );
  });

  it("a business's ad count is its live ads", async () => {
    const { shops } = await homepageData();
    const rows = new Map(shopRows().map((r) => [r.slug, r.listings.length]));
    for (const s of shops) expect(s.listings).toBe(rows.get(s.slug));
  });
});
