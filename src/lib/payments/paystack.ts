import { createHmac, timingSafeEqual } from "crypto";
import { toPaystackAmount } from "@/lib/currency";
import { getEnv, isProduction } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  InitializePaymentInput,
  InitializePaymentResult,
  PaymentProvider,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; secretKey: string },
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${options.secretKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: unknown;
  };

  if (!res.ok || !data.status) {
    logger.error("Paystack API error", { path, message: data.message, status: res.status });
    throw new Error(data.message || "Paystack request failed");
  }

  return data as T;
}

export class PaystackProvider implements PaymentProvider {
  readonly name = "paystack";
  private secretKey: string;

  constructor(secretKey?: string) {
    const key = secretKey ?? getEnv().PAYSTACK_SECRET_KEY;
    if (!key) {
      throw new Error(
        "Paystack is not configured. Set PAYSTACK_SECRET_KEY or use PAYMENT_PROVIDER=mock in development.",
      );
    }
    if (key.startsWith("pk_")) {
      throw new Error("PAYSTACK_SECRET_KEY must never be a public key");
    }
    this.secretKey = key;
  }

  async initialize(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const amount = toPaystackAmount(input.amountKobo);
    const response = await paystackFetch<{
      status: boolean;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    }>("/transaction/initialize", {
      method: "POST",
      secretKey: this.secretKey,
      body: {
        email: input.email,
        amount,
        reference: input.reference,
        callback_url: input.callbackUrl,
        currency: "NGN",
        metadata: input.metadata,
      },
    });

    return {
      provider: this.name,
      reference: response.data.reference,
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      raw: response.data,
    };
  }

  async verify(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const response = await paystackFetch<{
      status: boolean;
      data: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        paid_at?: string | null;
        gateway_response?: string;
      };
    }>(`/transaction/verify/${encodeURIComponent(input.reference)}`, {
      secretKey: this.secretKey,
    });

    const statusRaw = response.data.status?.toLowerCase();
    let status: VerifyPaymentResult["status"] = "pending";
    if (statusRaw === "success") status = "successful";
    else if (statusRaw === "failed") status = "failed";
    else if (statusRaw === "abandoned") status = "abandoned";

    return {
      provider: this.name,
      reference: response.data.reference,
      status,
      amountKobo: response.data.amount,
      currency: response.data.currency,
      paidAt: response.data.paid_at ? new Date(response.data.paid_at) : null,
      providerStatus: response.data.status,
      raw: response.data,
    };
  }

  async refund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    try {
      const response = await paystackFetch<{
        status: boolean;
        message: string;
        data: { id?: number | string; status?: string };
      }>("/refund", {
        method: "POST",
        secretKey: this.secretKey,
        body: {
          transaction: input.reference,
          amount: toPaystackAmount(input.amountKobo),
          currency: "NGN",
          merchant_note: input.reason,
        },
      });

      const status =
        response.data.status === "processed" || response.data.status === "success"
          ? "completed"
          : "processing";

      return {
        success: true,
        providerRefundId: String(response.data.id ?? ""),
        status,
        raw: response.data,
      };
    } catch (error) {
      return {
        success: false,
        status: "failed",
        message: error instanceof Error ? error.message : "Refund failed",
      };
    }
  }
}

export function verifyPaystackSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
  secret?: string,
): boolean {
  const webhookSecret = secret ?? getEnv().PAYSTACK_WEBHOOK_SECRET ?? getEnv().PAYSTACK_SECRET_KEY;
  if (!webhookSecret || !signatureHeader) return false;

  const hash = createHmac("sha512", webhookSecret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function assertPaystackReadyForLive(): void {
  const env = getEnv();
  if (env.PAYSTACK_MODE === "live" && !isProduction()) {
    logger.warn("Paystack live mode enabled outside production NODE_ENV");
  }
  if (env.PAYSTACK_MODE === "live") {
    if (!env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_")) {
      throw new Error("Live Paystack mode requires a sk_live_ secret key");
    }
  }
}
