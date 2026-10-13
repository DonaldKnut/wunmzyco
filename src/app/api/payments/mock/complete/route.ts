import { NextResponse } from "next/server";
import { getEnv, isProduction } from "@/lib/env";
import { verifyAndApplyPayment } from "@/lib/orders/payment-verification";
import { jsonError, jsonOk } from "@/lib/api/http";
import { absoluteUrl } from "@/lib/utils";

function mockAllowed(): boolean {
  if (isProduction()) return false;
  try {
    return getEnv().PAYMENT_PROVIDER === "mock";
  } catch {
    return process.env.PAYMENT_PROVIDER === "mock";
  }
}

export async function GET(request: Request) {
  if (!mockAllowed()) {
    return jsonError("Not found", 404);
  }

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const callback = searchParams.get("callback");

  if (!reference) {
    return jsonError("Missing reference", 400);
  }

  try {
    await verifyAndApplyPayment(reference, { eventType: "mock.complete" });
  } catch {
    // still redirect so dev flow continues
  }

  if (callback) {
    try {
      const cb = new URL(callback);
      const site = new URL(absoluteUrl("/"));
      if (cb.origin === site.origin) {
        return NextResponse.redirect(callback);
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.redirect(
    absoluteUrl(`/checkout/success?reference=${encodeURIComponent(reference)}`),
  );
}

export async function POST(request: Request) {
  if (!mockAllowed()) {
    return jsonError("Not found", 404);
  }

  let body: { reference?: string; fail?: boolean };
  try {
    body = (await request.json()) as { reference?: string; fail?: boolean };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (!body.reference) {
    return jsonError("Missing reference", 400);
  }

  const ref = body.fail ? `${body.reference}-fail` : body.reference;

  try {
    const result = await verifyAndApplyPayment(ref, { eventType: "mock.complete" });
    return jsonOk(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return jsonError(message, 400);
  }
}
