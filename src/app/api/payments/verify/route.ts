import { NextResponse } from "next/server";
import { verifyAndApplyPayment } from "@/lib/orders/payment-verification";
import { absoluteUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference")?.trim();

  if (!reference) {
    return NextResponse.redirect(absoluteUrl("/checkout/failed?reason=missing_reference"));
  }

  try {
    const result = await verifyAndApplyPayment(reference, { eventType: "callback" });

    if (result.status === "successful") {
      return NextResponse.redirect(
        absoluteUrl(`/checkout/success?reference=${encodeURIComponent(reference)}`),
      );
    }

    return NextResponse.redirect(
      absoluteUrl(
        `/checkout/failed?reference=${encodeURIComponent(reference)}&status=${encodeURIComponent(result.status)}`,
      ),
    );
  } catch {
    return NextResponse.redirect(
      absoluteUrl(`/checkout/failed?reference=${encodeURIComponent(reference)}&reason=verify_error`),
    );
  }
}
