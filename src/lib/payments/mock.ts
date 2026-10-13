import { absoluteUrl } from "@/lib/utils";
import { isProduction } from "@/lib/env";
import type {
  InitializePaymentInput,
  InitializePaymentResult,
  PaymentProvider,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

/**
 * Deterministic mock payment provider for local development.
 * Hard-blocked in production — never use for real money movement.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  constructor() {
    if (isProduction()) {
      throw new Error("MockPaymentProvider cannot be used in production");
    }
  }

  async initialize(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const url = absoluteUrl(
      `/api/payments/mock/complete?reference=${encodeURIComponent(input.reference)}&callback=${encodeURIComponent(input.callbackUrl)}`,
    );
    return {
      provider: this.name,
      reference: input.reference,
      authorizationUrl: url,
      accessCode: `mock_${input.reference}`,
      raw: { mock: true },
    };
  }

  async verify(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    // Successful when reference does not contain "fail"
    const fail = input.reference.includes("fail");
    const abandoned = input.reference.includes("abandon");

    if (abandoned) {
      return {
        provider: this.name,
        reference: input.reference,
        status: "abandoned",
        amountKobo: 0,
        currency: "NGN",
        providerStatus: "abandoned",
      };
    }

    if (fail) {
      return {
        provider: this.name,
        reference: input.reference,
        status: "failed",
        amountKobo: 0,
        currency: "NGN",
        providerStatus: "failed",
      };
    }

    // Amount is resolved by the caller against the order; mock returns a sentinel
    // that the verification service replaces with the expected order amount check.
    return {
      provider: this.name,
      reference: input.reference,
      status: "successful",
      amountKobo: -1, // sentinel: trust order amount in verification layer for mock
      currency: "NGN",
      paidAt: new Date(),
      providerStatus: "success",
      raw: { mock: true },
    };
  }

  async refund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return {
      success: true,
      providerRefundId: `mock_refund_${input.reference}`,
      status: "completed",
      message: "Mock refund recorded (no real funds moved)",
      raw: { mock: true },
    };
  }
}
