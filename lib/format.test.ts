import { describe, expect, it } from "vitest";
import { compactNumber, groupedNumber, rupees } from "./format";

describe("number formatting", () => {
  it("abbreviates counts from a thousand up", () => {
    expect(compactNumber(25)).toBe("25");
    expect(compactNumber(999)).toBe("999");
    expect(compactNumber(1234)).toBe("1.2K");
  });

  it("groups prices and never abbreviates them", () => {
    expect(groupedNumber(1250000)).toBe("1,250,000");
    expect(rupees(5650000)).toBe("Rs. 5,650,000");
  });
});
