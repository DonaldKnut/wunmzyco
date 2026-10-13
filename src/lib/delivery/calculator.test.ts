import { describe, expect, it } from "vitest";
import { calculateDeliveryFee, calculateShipmentWeight } from "./calculator";

const zone = {
  id: "zone1",
  code: "LAGOS_MAINLAND",
  name: "Lagos Mainland",
  baseFeeKobo: 250000,
  includedWeightGrams: 1000,
  incrementalFeeKobo: 50000,
  weightBandGrams: 1000,
  minChargeKobo: null,
  maxChargeKobo: null,
  freeDeliveryThresholdKobo: 5000000,
  estimatedWindow: "2-4 business days",
  ruleVersion: 1,
  isActive: true,
};

describe("delivery calculator", () => {
  it("charges base fee within included weight", () => {
    const quote = calculateDeliveryFee(zone, 800);
    expect(quote.totalFeeKobo).toBe(250000);
    expect(quote.bandsCharged).toBe(0);
  });

  it("ceil-charges partial weight bands", () => {
    const quote = calculateDeliveryFee(zone, 1501);
    expect(quote.bandsCharged).toBe(1);
    expect(quote.totalFeeKobo).toBe(300000);
  });

  it("applies free delivery threshold on subtotal", () => {
    const quote = calculateDeliveryFee(zone, 3000, { subtotalKobo: 5000000 });
    expect(quote.freeDeliveryApplied).toBe(true);
    expect(quote.totalFeeKobo).toBe(0);
  });

  it("flags estimated weights when missing", () => {
    const result = calculateShipmentWeight(
      [
        { weightGrams: null, quantity: 2 },
        { weightGrams: 500, quantity: 1 },
      ],
      400,
    );
    expect(result.totalGrams).toBe(1300);
    expect(result.estimated).toBe(true);
  });

  it("rejects inactive zones", () => {
    expect(() => calculateDeliveryFee({ ...zone, isActive: false }, 100)).toThrow();
  });
});
