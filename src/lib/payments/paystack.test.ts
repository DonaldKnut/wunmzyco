import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyPaystackSignature } from "./paystack";

describe("Paystack webhook signature", () => {
  const secret = "whsec_test_secret";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } });

  it("accepts valid HMAC-SHA512 signatures", () => {
    const signature = createHmac("sha512", secret).update(body).digest("hex");
    expect(verifyPaystackSignature(body, signature, secret)).toBe(true);
  });

  it("rejects invalid signatures", () => {
    expect(verifyPaystackSignature(body, "deadbeef", secret)).toBe(false);
    expect(verifyPaystackSignature(body, null, secret)).toBe(false);
  });

  it("rejects tampered payloads", () => {
    const signature = createHmac("sha512", secret).update(body).digest("hex");
    expect(verifyPaystackSignature(body + " ", signature, secret)).toBe(false);
  });
});
