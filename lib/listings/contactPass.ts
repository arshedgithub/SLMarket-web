import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Proof that a guest checked their email with a one-time code, so they may
 * see private sellers' numbers without an account. (Phone OTP is the plan;
 * email OTP is what exists.) Stored as an httpOnly cookie:
 *   <expires ms>.<email hash>.<signature>
 * signed with AUTH_SECRET. The email itself is never stored in the cookie.
 */

export const CONTACT_PASS_COOKIE = "slm_contact_pass";
export const CONTACT_PASS_DAYS = 30;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function emailHash(email: string): string {
  return createHmac("sha256", secret())
    .update(email.trim().toLowerCase())
    .digest("base64url")
    .slice(0, 22);
}

export function createContactPass(email: string, now = Date.now()): string {
  const expires = now + CONTACT_PASS_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${expires}.${emailHash(email)}`;
  return `${payload}.${sign(payload)}`;
}

// True for an unexpired pass with a valid signature.
export function verifyContactPass(
  value: string | undefined | null,
  now = Date.now(),
): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expires, hash, sig] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) < now) return false;
  const expected = Buffer.from(sign(`${expires}.${hash}`));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
