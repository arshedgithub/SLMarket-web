import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
const { BUCKETS, FEATURED_PER_PAGE, paginate, remapPage, slotsAfterFor } =
  await import("@/app/[locale]/(root)/ads/_components/adQuery");
const { toCard } = await import("./feed");
const { adsForSavedSearch, normalizeSearchQuery } = await import(
  "./savedSearch"
);
import { NOW, feedRows } from "./feedRows.fixture";

const ads = feedRows().map((r) => toCard(r, NOW));

describe("ads per page and spotlight slots", () => {
  for (const [name, b] of Object.entries(BUCKETS)) {
    // Laptop and desktop slots take 2 cells, phones and tablets a full row.
    const span = b.cols >= 4 ? 2 : b.cols;

    it(`${name}: a page with every slot filled ends on a full row`, () => {
      expect((b.pageSize + b.slotsAfter.length * span) % b.cols).toBe(0);
    });

    it(`${name}: slots zigzag (left edge, then right edge), never in the first two rows`, () => {
      let cellsBefore = 0;
      b.slotsAfter.forEach((after, i) => {
        const cells = after + i * span;
        // The first starts a row, the second ends one.
        expect((i % 2 === 0 ? cells : cells + span) % b.cols).toBe(0);
        expect(cells).toBeGreaterThanOrEqual(2 * b.cols);
        cellsBefore = cells;
      });
      expect(cellsBefore).toBeLessThan(b.pageSize + b.slotsAfter.length * span);
      expect(b.slotsAfter.length).toBeLessThanOrEqual(2);
    });
  }

  it("leaves out slots a short page cannot reach", () => {
    expect(slotsAfterFor("desktop", "grid", 12)).toEqual([10]);
    expect(slotsAfterFor("desktop", "grid", 9)).toEqual([]);
  });

  it("keeps the same first ad in view when the page size changes", () => {
    // Desktop page 3 starts at ad 53; with 20 a page that is page 3 too.
    expect(remapPage(3, 26, 20)).toBe(3);
    expect(remapPage(2, 20, 26)).toBe(1);
  });
});

describe("pages in the default sort", () => {
  const pages = paginate(ads, BUCKETS.desktop.pageSize, "newest");

  it("loses and repeats no ad", () => {
    const all = pages.flat().map((a) => a.id);
    expect(all).toHaveLength(ads.length);
    expect(new Set(all).size).toBe(ads.length);
  });

  it("opens each page with at most 3 featured ads, and badges no others", () => {
    for (const page of pages) {
      const featured = page.filter((a) => a.featured);
      expect(featured.length).toBeLessThanOrEqual(FEATURED_PER_PAGE);
      expect(page.slice(0, featured.length).every((a) => a.featured)).toBe(
        true,
      );
    }
  });

  it("never puts two ads from one seller side by side", () => {
    for (const page of pages) {
      page
        .slice(1)
        .forEach((ad, i) => expect(ad.sellerKey).not.toBe(page[i].sellerKey));
    }
  });
});

describe("saved searches", () => {
  it("keeps the /ads path and filters, without locale or page", () => {
    expect(
      normalizeSearchQuery("/si/ads/vehicles?page=3&location=Colombo"),
    ).toBe("/ads/vehicles?location=Colombo");
    expect(normalizeSearchQuery("https://slmarket.lk/ads?q=iphone")).toBe(
      "/ads?q=iphone",
    );
    expect(normalizeSearchQuery("/business/techzone")).toBeNull();
    expect(normalizeSearchQuery("/ads/../admin")).toBeNull();
  });

  it("finds the ads the page would list", () => {
    const found = adsForSavedSearch(ads, "/ads/vehicles?location=Kandy");
    expect(found.length).toBeGreaterThan(0);
    expect(
      found.every((a) => a.categoryId === "vehicles" && a.location === "Kandy"),
    ).toBe(true);
    expect(adsForSavedSearch(ads, "/ads/not-a-category")).toEqual([]);
  });
});
