import { jsonError, jsonOk } from "@/lib/api/http";
import { removeCartItem } from "@/lib/cart";
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
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  try {
    const cart = await removeCartItem(parsed.data.itemId);
    return jsonOk({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove item";
    return jsonError(message, 400);
  }
}
