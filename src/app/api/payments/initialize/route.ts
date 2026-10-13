import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { getSessionUser } from "@/lib/auth/session";
import { createPendingOrderAndInitializePayment } from "@/lib/orders/checkout";
import { paymentInitializeSchema } from "@/lib/schemas/api";
import { cartToCheckoutItems, getOrCreateCart } from "@/lib/cart";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("checkout", 8, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = paymentInitializeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  const user = await getSessionUser();
  let items = parsed.data.items ?? [];

  if (parsed.data.useCart || items.length === 0) {
    const cart = await getOrCreateCart();
    if (!cart.items.length) {
      return jsonError("Your cart is empty", 400);
    }
    items = cartToCheckoutItems(cart);
  }

  try {
    const result = await createPendingOrderAndInitializePayment({
      items,
      address: parsed.data.address,
      userId: user?.id ?? null,
      couponCode: parsed.data.couponCode ?? null,
    });

    return jsonOk({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      authorizationUrl: result.authorizationUrl,
      paymentReference: result.paymentReference,
      totalKobo: result.totalKobo,
      trackingToken: result.trackingToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return jsonError(message, 400);
  }
}
