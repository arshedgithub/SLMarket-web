import { beforeAll, describe, expect, it } from "vitest";
import { createContactPass, emailHash, verifyContactPass } from "./contactPass";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret";
});

describe("contact pass (email-checked guests)", () => {
  it("accepts a fresh pass", () => {
    expect(verifyContactPass(createContactPass("buyer@example.com"))).toBe(
      true,
    );
  });

  it("never stores the email itself", () => {
    const pass = createContactPass("buyer@example.com");
    expect(pass).not.toContain("buyer");
    expect(pass.split(".")[1]).toBe(emailHash("Buyer@Example.com "));
  });

  it("rejects expired, tampered and malformed passes", () => {
    const now = Date.now();
    const pass = createContactPass("buyer@example.com", now);
    expect(verifyContactPass(pass, now + 31 * 24 * 60 * 60 * 1000)).toBe(false);

    const [expires, hash, sig] = pass.split(".");
    expect(verifyContactPass(`${Number(expires) + 1000}.${hash}.${sig}`)).toBe(
      false,
    );
    expect(verifyContactPass(`${expires}.other.${sig}`)).toBe(false);
    expect(verifyContactPass("garbage")).toBe(false);
    expect(verifyContactPass(undefined)).toBe(false);
  });

  it("rejects a pass signed with another secret", () => {
    const pass = createContactPass("buyer@example.com");
    process.env.AUTH_SECRET = "rotated";
    expect(verifyContactPass(pass)).toBe(false);
    process.env.AUTH_SECRET = "test-secret";
  });
});
