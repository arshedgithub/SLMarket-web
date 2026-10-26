import { describe, expect, it } from "vitest";
import {
  boostPaymentMessage,
  planPaymentMessage,
  supportWhatsappUrl,
} from "./manualPayment";

describe("supportWhatsappUrl", () => {
  it("opens the support chat with the message filled in", () => {
    const url = new URL(supportWhatsappUrl('Pay for "Shop & Co"?\nThanks'));
    expect(url.origin + url.pathname).toBe("https://wa.me/94785217472");
    expect(url.searchParams.get("text")).toBe('Pay for "Shop & Co"?\nThanks');
  });
});

describe("planPaymentMessage", () => {
  it("names the plan, period, business and amount", () => {
    expect(
      planPaymentMessage({
        planName: "Pro",
        cycle: "ANNUAL",
        businessName: "Lanka Motors",
        amountLkr: 29700,
        couponCode: "launch50",
      }),
    ).toBe(
      'Hi SLMarket.lk, I\'d like to pay for the Pro plan (1 year) for my business page "Lanka Motors".\n' +
        "Amount: LKR 29,700 (coupon LAUNCH50).\n" +
        "How can I pay?",
    );
  });

  it("leaves the coupon out when there is none", () => {
    const message = planPaymentMessage({
      planName: "Basic",
      cycle: "MONTHLY",
      businessName: "Kandy Books",
      amountLkr: 2970.5,
    });
    expect(message).toContain("(1 month)");
    expect(message).toContain("Amount: LKR 2,970.5.");
    expect(message).not.toContain("coupon");
  });
});

describe("boostPaymentMessage", () => {
  it("names the boost, the ad and the amount", () => {
    expect(
      boostPaymentMessage({
        boostName: "3-day top of search",
        listingTitle: "Toyota Aqua 2015",
        amountLkr: 2970,
      }),
    ).toBe(
      'Hi SLMarket.lk, I\'d like to pay for a 3-day top of search boost on my ad "Toyota Aqua 2015".\n' +
        "Amount: LKR 2,970.\n" +
        "How can I pay?",
    );
  });
});
