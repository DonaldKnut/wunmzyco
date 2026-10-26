import { jsonError, jsonOk } from "@/lib/api/http";
import { removeCartItem } from "@/lib/cart";
import { zodErrorPayload } from "@/lib/forms/zod";
import { cartRemoveSchema } from "@/lib/schemas/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = cartRemoveSchema.safeParse(body);
  if (!parsed.success) {
    const payload = zodErrorPayload(parsed.error);
    return jsonError(payload.message, 422, payload);
  }

  try {
    const cart = await removeCartItem(parsed.data.itemId);
    return jsonOk({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove item";
    return jsonError(message, 400);
  }
}
