import crypto from "crypto";

// PayHere — Sri Lanka's primary payment gateway (LKR payments).
// Required env vars: PAYHERE_MERCHANT_ID, PAYHERE_SECRET, PAYHERE_MODE (sandbox|live)
// Docs: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout

const PAYHERE_MODE = process.env.PAYHERE_MODE ?? "sandbox";
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID!;
const SECRET = process.env.PAYHERE_SECRET!;

export const PAYHERE_CHECKOUT_URL =
  PAYHERE_MODE === "live"
    ? "https://www.payhere.lk/pay/checkout"
    : "https://sandbox.payhere.lk/pay/checkout";

export interface PayherePaymentParams {
  orderId: string;
  items: string;
  amountLkr: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  currency?: string;
}

export function buildPayhereHash(
  orderId: string,
  amountLkr: number,
  currency = "LKR",
): string {
  const merchantSecretHash = crypto
    .createHash("md5")
    .update(SECRET)
    .digest("hex")
    .toUpperCase();

  const raw = `${MERCHANT_ID}${orderId}${amountLkr.toFixed(2)}${currency}${merchantSecretHash}`;
  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
}

export function buildPayhereFormData(
  params: PayherePaymentParams,
): Record<string, string> {
  const currency = params.currency ?? "LKR";
  const amount = params.amountLkr.toFixed(2);
  const hash = buildPayhereHash(params.orderId, params.amountLkr, currency);

  return {
    merchant_id: MERCHANT_ID,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade?payment=cancelled`,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payhere/webhook`,
    order_id: params.orderId,
    items: params.items,
    currency,
    amount,
    first_name: params.firstName,
    last_name: params.lastName,
    email: params.email,
    phone: params.phone,
    address: params.address ?? "N/A",
    city: params.city ?? "Colombo",
    country: "Sri Lanka",
    hash,
  };
}

export function verifyPayhereWebhook(body: {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  // Without the merchant secret nothing can be verified: reject, never crash.
  if (!SECRET || !body.md5sig) {
    if (!SECRET) console.error("[payhere] PAYHERE_SECRET is not set");
    return false;
  }
  const merchantSecretHash = crypto
    .createHash("md5")
    .update(SECRET)
    .digest("hex")
    .toUpperCase();

  const raw = `${body.merchant_id}${body.order_id}${body.payhere_amount}${body.payhere_currency}${body.status_code}${merchantSecretHash}`;
  const expected = crypto
    .createHash("md5")
    .update(raw)
    .digest("hex")
    .toUpperCase();

  return expected === body.md5sig.toUpperCase();
}
