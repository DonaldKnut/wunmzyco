import { describe, expect, it } from "vitest";
import { canTransitionDelivery, canTransitionOrder } from "./transitions";

describe("order transitions", () => {
  it("allows pending payment to paid", () => {
    expect(canTransitionOrder("PENDING_PAYMENT", "PAID")).toBe(true);
  });

  it("blocks fulfilment of unpaid orders via direct ship", () => {
    expect(canTransitionOrder("PENDING_PAYMENT", "SHIPPED")).toBe(false);
  });

  it("allows delivery progression", () => {
    expect(canTransitionDelivery("PREPARING", "READY_FOR_DISPATCH")).toBe(true);
    expect(canTransitionDelivery("DELIVERED", "IN_TRANSIT")).toBe(false);
  });
});
