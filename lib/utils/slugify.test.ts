import { describe, expect, it } from "vitest";
import slugify from "./slugify";

describe("slugify", () => {
  it("lowercases and joins words with single dashes", () => {
    expect(slugify("  Toyota Aqua 2015 -- Hybrid_Car ")).toBe(
      "toyota-aqua-2015-hybrid-car",
    );
  });

  it("drops punctuation and dashes at either end", () => {
    expect(slugify("--- iPhone 14 (128GB)! ---")).toBe("iphone-14-128gb");
  });

  it("is empty when nothing usable is left", () => {
    expect(slugify("!!! --- ???")).toBe("");
  });

  it("handles a long run of dashes quickly", () => {
    const started = performance.now();
    expect(slugify(`a${"-".repeat(100_000)}b`)).toBe("a-b");
    expect(performance.now() - started).toBeLessThan(500);
  });
});
