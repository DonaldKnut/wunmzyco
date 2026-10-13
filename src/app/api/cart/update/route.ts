import { jsonError, jsonOk } from "@/lib/api/http";
import { updateCartItem } from "@/lib/cart";
import { cartUpdateSchema } from "@/lib/schemas/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = cartUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  try {
    const cart = await updateCartItem(parsed.data.itemId, parsed.data.quantity);
    return jsonOk({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update cart";
    return jsonError(message, 400);
  }
}
