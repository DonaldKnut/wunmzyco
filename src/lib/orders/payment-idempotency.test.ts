import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  paymentEvent: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

const verifyMock = vi.fn();
vi.mock("@/lib/payments", () => ({
  getPaymentProvider: () => ({
    verify: verifyMock,
  }),
}));

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/inventory/reservations", () => ({
  commitReservationsForOrder: vi.fn(),
  releaseReservationsForOrder: vi.fn(),
}));

describe("verifyAndApplyPayment idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("short-circuits when providerEventId was already processed", async () => {
    prismaMock.paymentEvent.findUnique.mockResolvedValue({
      processed: true,
    });

    const { verifyAndApplyPayment } = await import("./payment-verification");
    const result = await verifyAndApplyPayment("ref_demo", {
      providerEventId: "paystack:999",
    });

    expect(result.alreadyProcessed).toBe(true);
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled();
  });
});
