import type { BillingCycle } from "./subscription";

/*
 * There is no online payment gateway: paid plans and boosts are paid by
 * arrangement on WhatsApp, and an admin switches them on once the payment
 * is confirmed (admin plan override). These build the WhatsApp link with a
 * message that says exactly what is being bought.
 */

// SLMarket.lk's WhatsApp support line, the one shown in the footer.
export const SUPPORT_WHATSAPP_NUMBER = "94785217472";

export function supportWhatsappUrl(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const lkr = (amount: number) =>
  `LKR ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function planPaymentMessage(order: {
  planName: string;
  cycle: BillingCycle;
  businessName: string;
  amountLkr: number;
  couponCode?: string;
}): string {
  const period = order.cycle === "ANNUAL" ? "1 year" : "1 month";
  return [
    `Hi SLMarket.lk, I'd like to pay for the ${order.planName} plan (${period}) for my business page "${order.businessName}".`,
    `Amount: ${lkr(order.amountLkr)}${order.couponCode ? ` (coupon ${order.couponCode.toUpperCase()})` : ""}.`,
    "How can I pay?",
  ].join("\n");
}

export function boostPaymentMessage(order: {
  boostName: string;
  listingTitle: string;
  amountLkr: number;
}): string {
  return [
    `Hi SLMarket.lk, I'd like to pay for a ${order.boostName} boost on my ad "${order.listingTitle}".`,
    `Amount: ${lkr(order.amountLkr)}.`,
    "How can I pay?",
  ].join("\n");
}
