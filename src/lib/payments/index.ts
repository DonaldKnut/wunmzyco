import { getEnv, isProduction } from "@/lib/env";
import { MockPaymentProvider } from "./mock";
import { PaystackProvider } from "./paystack";
import type { PaymentProvider } from "./types";

export type { PaymentProvider } from "./types";
export { verifyPaystackSignature } from "./paystack";

export function getPaymentProvider(): PaymentProvider {
  const env = getEnv();

  if (env.PAYMENT_PROVIDER === "mock") {
    if (isProduction()) {
      throw new Error(
        "Mock payment provider is forbidden in production. Set PAYMENT_PROVIDER=paystack and PAYSTACK_SECRET_KEY in your host env (Vercel Production).",
      );
    }
    return new MockPaymentProvider();
  }

  if (!env.PAYSTACK_SECRET_KEY) {
    throw new Error(
      "Paystack credentials are missing. Set PAYSTACK_SECRET_KEY on your host, or use PAYMENT_PROVIDER=mock only in local development.",
    );
  }

  return new PaystackProvider(env.PAYSTACK_SECRET_KEY);
}
