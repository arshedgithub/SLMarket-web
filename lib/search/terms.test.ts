import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
const { normalizeTerm } = await import("./terms");
const { popularSearches } = await import("@/lib/listings/popularSearches");
const { toCard } = await import("@/lib/listings/feed");
import { NOW, adRow } from "@/lib/listings/feedRows.fixture";

describe("search terms", () => {
  it("normalises what people type", () => {
    expect(normalizeTerm("  iPhone   16!! ")).toBe("iphone 16");
    expect(normalizeTerm("Wagon-R")).toBe("wagon-r");
  });

  it("ignores things that are not searches", () => {
    expect(normalizeTerm("a")).toBeNull();
    expect(normalizeTerm("0771234567")).toBeNull();
    expect(normalizeTerm("https://spam.example")).toBeNull();
  });
});

describe("popular searches", () => {
  const ads = [
    toCard(adRow({ slug: "a", title: "Dell XPS 13 laptop" }), NOW),
    toCard(adRow({ slug: "b", title: "Toyota Aqua 2017" }), NOW),
    toCard(adRow({ slug: "c", title: "Toyota Vios 2014" }), NOW),
  ];

  it("puts what people searched for first, in its popularity order", () => {
    const list = popularSearches(ads, 6, ["aqua", "laptop"]);
    expect(list.map((s) => s.label).slice(0, 2)).toEqual(["Aqua", "Laptop"]);
  });

  it("never offers a term with no live ads", () => {
    const list = popularSearches(ads, 6, ["boat"]);
    expect(list.some((s) => s.label === "Boat")).toBe(false);
    expect(list.every((s) => s.count > 0)).toBe(true);
  });

  it("falls back to the starter list with no search history", () => {
    expect(popularSearches(ads, 6).map((s) => s.label)).toEqual([
      "Toyota",
      "Laptop",
    ]);
  });
});
