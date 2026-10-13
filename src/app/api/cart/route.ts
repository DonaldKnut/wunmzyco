import { jsonOk } from "@/lib/api/http";
import { getOrCreateCart } from "@/lib/cart";

export async function GET() {
  const cart = await getOrCreateCart();
  return jsonOk({ cart });
}
