import { describe, expect, it, vi } from "vitest";
import type { SubscriptionPlan } from "@prisma/client";

vi.mock("@/lib/db", () => ({ db: {} }));
const { addMonths, parseSubscriptionOrderId, planPrice, subscriptionOrderId } =
  await import("./subscription");

// Decimal columns only need to survive Number(...) here.
const plan = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    id: "plan1",
    priceUsd: 10,
    priceLkr: 3000,
    priceUsdAnnual: null,
    priceLkrAnnual: null,
    ...over,
  }) as unknown as SubscriptionPlan;

describe("planPrice", () => {
  it("monthly is the plan's price for one month", () => {
    expect(planPrice(plan(), "MONTHLY")).toEqual({
      usd: 10,
      lkr: 3000,
      months: 1,
    });
  });

  it("annual uses the annual price for twelve months", () => {
    expect(
      planPrice(plan({ priceUsdAnnual: 100, priceLkrAnnual: 30000 }), "ANNUAL"),
    ).toEqual({ usd: 100, lkr: 30000, months: 12 });
  });

  it("annual falls back to twelve monthly payments", () => {
    expect(planPrice(plan(), "ANNUAL")).toEqual({
      usd: 120,
      lkr: 36000,
      months: 12,
    });
  });
});

describe("subscription order ids", () => {
  it("carry the business, plan and cycle through PayHere", () => {
    for (const cycle of ["MONTHLY", "ANNUAL"] as const) {
      const id = subscriptionOrderId("biz123", "planabc", cycle);
      expect(id.startsWith("sub_biz123_planabc_")).toBe(true);
      expect(parseSubscriptionOrderId(id)).toEqual({
        businessProfileId: "biz123",
        planId: "planabc",
        cycle,
      });
    }
  });

  it("reject anything that is not a subscription order", () => {
    expect(parseSubscriptionOrderId("boost_listing1_123")).toBeNull();
    expect(parseSubscriptionOrderId("sub_")).toBeNull();
  });
});

describe("addMonths", () => {
  it("counts calendar months", () => {
    const end = addMonths(new Date("2026-01-15T00:00:00Z"), 12);
    expect(end.toISOString()).toBe("2027-01-15T00:00:00.000Z");
  });
});
