import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyPaystackSignature } from "./paystack";

describe("verifyPaystackSignature", () => {
  it("validates HMAC-SHA512 hex digest", () => {
    const secret = "whsec_test_secret";
    const body = JSON.stringify({ event: "charge.success", data: { id: 1 } });
    const sig = createHmac("sha512", secret).update(body).digest("hex");

    expect(verifyPaystackSignature(body, sig, secret)).toBe(true);
    expect(verifyPaystackSignature(body, "bad", secret)).toBe(false);
    expect(verifyPaystackSignature(body, null, secret)).toBe(false);
  });
});
