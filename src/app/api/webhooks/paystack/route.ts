import { verifyPaystackSignature } from "@/lib/payments";
import { verifyAndApplyPayment } from "@/lib/orders/payment-verification";
import { jsonError, jsonOk } from "@/lib/api/http";
import { logger } from "@/lib/logger";

type PaystackWebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    id?: number | string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const valid = verifyPaystackSignature(rawBody, signature);

  if (!valid) {
    return jsonError("Invalid signature", 401);
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const reference = payload.data?.reference;
  if (!reference) {
    return jsonOk({ received: true, skipped: true });
  }

  const providerEventId =
    payload.data?.id != null ? `paystack:${payload.data.id}` : `paystack:${reference}:${payload.event ?? "unknown"}`;

  try {
    const result = await verifyAndApplyPayment(reference, {
      providerEventId,
      eventType: payload.event ?? "webhook",
      payload,
      signatureValid: true,
    });
    return jsonOk({ received: true, ...result });
  } catch (error) {
    logger.error("Paystack webhook processing failed", { reference, error });
    return jsonError("Processing failed", 500);
  }
}
