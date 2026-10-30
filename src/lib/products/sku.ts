import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

/** Store SKU prefix — short and easy to spot in inventory lists. */
const SKU_PREFIX = "WMZ";

function randomSkuCode(): string {
  // 8 hex chars → ~4 billion combinations; collision-checked below.
  return `${SKU_PREFIX}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/** Generate a SKU that is unique in the Product table. */
export async function generateUniqueProductSku(maxAttempts = 8): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const sku = randomSkuCode();
    const existing = await prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });
    if (!existing) return sku;
  }
  // Extremely unlikely fallback
  return `${SKU_PREFIX}-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
}
