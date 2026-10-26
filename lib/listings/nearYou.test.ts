import { describe, expect, it } from "vitest";
import { isDistrict, nearestDistrict, resolveOrigin } from "./nearYou";

describe("nearestDistrict", () => {
  it("finds the district for a position", () => {
    expect(nearestDistrict(6.9271, 79.8612)).toBe("Colombo"); // Colombo Fort
    expect(nearestDistrict(7.2906, 80.6337)).toBe("Kandy");
    expect(nearestDistrict(9.6615, 80.0255)).toBe("Jaffna");
  });
});

describe("resolveOrigin", () => {
  it("prefers GPS, then the chosen place, the account, then the ad", () => {
    const all = {
      gps: "Kandy",
      chosen: "Galle",
      account: "Jaffna",
      ad: "Colombo",
    };
    expect(resolveOrigin(all)).toEqual({ district: "Kandy", source: "gps" });
    expect(resolveOrigin({ ...all, gps: null })).toEqual({
      district: "Galle",
      source: "chosen",
    });
    expect(resolveOrigin({ ...all, gps: null, chosen: "" })).toEqual({
      district: "Jaffna",
      source: "account",
    });
    expect(resolveOrigin({ ad: "Colombo" })).toEqual({
      district: "Colombo",
      source: "ad",
    });
  });

  it("ignores anything that is not a district (e.g. a tampered cookie)", () => {
    expect(resolveOrigin({ gps: "Atlantis", ad: "Colombo" })).toEqual({
      district: "Colombo",
      source: "ad",
    });
    expect(resolveOrigin({})).toEqual({ district: null, source: null });
    expect(isDistrict("constructor")).toBe(false);
  });
});
