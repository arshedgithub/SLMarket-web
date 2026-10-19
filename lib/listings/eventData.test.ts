import { describe, expect, it } from "vitest";
import { cleanEventData } from "./eventData";

describe("cleanEventData", () => {
  it("keeps flat primitive fields", () => {
    expect(
      cleanEventData({ slug: "a", level: 2, signedIn: false, to: null }),
    ).toEqual({
      slug: "a",
      level: 2,
      signedIn: false,
      to: null,
    });
  });

  it("drops nested values and non-objects", () => {
    expect(cleanEventData({ a: { b: 1 }, c: [1], d: "ok" })).toEqual({
      d: "ok",
    });
    expect(cleanEventData("text")).toEqual({});
    expect(cleanEventData(null)).toEqual({});
    expect(cleanEventData([1, 2])).toEqual({});
  });

  it("caps keys, strings and the number of fields", () => {
    const long = "x".repeat(500);
    const out = cleanEventData({ [long]: long });
    const [key] = Object.keys(out);
    expect(key).toHaveLength(40);
    expect(out[key]).toHaveLength(200);

    const many = Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => [`k${i}`, i]),
    );
    expect(Object.keys(cleanEventData(many))).toHaveLength(20);
  });
});
