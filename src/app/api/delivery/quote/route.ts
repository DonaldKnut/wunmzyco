import { jsonError, jsonOk } from "@/lib/api/http";
import { quoteDeliveryForCart } from "@/lib/orders/checkout";
import { deliveryQuoteQuerySchema } from "@/lib/schemas/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deliveryZoneId = searchParams.get("deliveryZoneId");
  const itemsRaw = searchParams.get("items");
  const couponCode = searchParams.get("couponCode") ?? undefined;

  let items: unknown;
  try {
    items = itemsRaw ? JSON.parse(itemsRaw) : null;
  } catch {
    return jsonError("Invalid items JSON", 400);
  }

  const parsed = deliveryQuoteQuerySchema.safeParse({
    deliveryZoneId,
    items,
    couponCode,
  });

  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  try {
    const quote = await quoteDeliveryForCart(
      parsed.data.items,
      parsed.data.deliveryZoneId,
      parsed.data.couponCode,
    );
    return jsonOk(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quote failed";
    return jsonError(message, 400);
  }
}
