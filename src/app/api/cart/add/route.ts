import { jsonError, jsonOk } from "@/lib/api/http";
import { addCartItem } from "@/lib/cart";
import { cartAddSchema } from "@/lib/schemas/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = cartAddSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  try {
    const cart = await addCartItem(parsed.data);
    return jsonOk({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add to cart";
    return jsonError(message, 400);
  }
}
