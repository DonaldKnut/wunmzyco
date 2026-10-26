import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { getSessionUser } from "@/lib/auth/session";
import { createPendingOrderAndInitializePayment } from "@/lib/orders/checkout";
import { zodErrorPayload } from "@/lib/forms/zod";
import { paymentInitializeSchema } from "@/lib/schemas/api";
import { cartToCheckoutItems, getOrCreateCart, getOrCreateCartId } from "@/lib/cart";

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
    const payload = zodErrorPayload(parsed.error);
    return jsonError(payload.message, 422, payload);
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
    const cartId = await getOrCreateCartId();
    const result = await createPendingOrderAndInitializePayment({
      items,
      address: parsed.data.address,
      userId: user?.id ?? null,
      couponCode: parsed.data.couponCode ?? null,
      cartId,
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
