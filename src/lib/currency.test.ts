import { describe, expect, it } from "vitest";
import {
  addKobo,
  formatNgn,
  koboToNaira,
  multiplyKobo,
  nairaToKobo,
  toPaystackAmount,
} from "./currency";

describe("currency", () => {
  it("converts naira to kobo with rounding", () => {
    expect(nairaToKobo(10)).toBe(1000);
    expect(nairaToKobo(10.5)).toBe(1050);
    expect(nairaToKobo(10.005)).toBe(1001);
  });

  it("formats NGN for en-NG", () => {
    const formatted = formatNgn(150000);
    expect(formatted).toMatch(/1[,.]?500/);
    expect(formatted.replace(/\s/g, "")).toMatch(/₦|NGN/);
  });

  it("adds and multiplies integer kobo only", () => {
    expect(addKobo(100, 50, 25)).toBe(175);
    expect(multiplyKobo(2500, 3)).toBe(7500);
    expect(() => addKobo(1.5 as unknown as number)).toThrow();
  });

  it("enforces Paystack minimum", () => {
    expect(toPaystackAmount(100)).toBe(100);
    expect(() => toPaystackAmount(50)).toThrow();
    expect(koboToNaira(100)).toBe(1);
  });
});
