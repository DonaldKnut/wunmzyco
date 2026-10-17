"use server";

import { revalidatePath } from "next/cache";
import type { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { nairaToKobo } from "@/lib/currency";
import { slugify } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { revalidateStorefront } from "@/lib/admin/revalidate-storefront";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

function parseProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const priceNaira = Number(formData.get("priceNaira"));
  const salePriceNairaRaw = String(formData.get("salePriceNaira") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);
  const lowStockAt = Number(formData.get("lowStockAt") ?? 2);
  const status = String(formData.get("status") ?? "DRAFT") as ProductStatus;
  const isFeatured = formData.get("isFeatured") === "on";
  const categoryIds = formData.getAll("categoryIds").map(String);

  if (!name || !description || !sku) {
    throw new Error("Name, description, and SKU are required.");
  }
  if (!Number.isFinite(priceNaira) || priceNaira < 0) {
    throw new Error("Invalid price.");
  }

  const slug = slugRaw ? slugify(slugRaw) : slugify(name);
  const priceKobo = nairaToKobo(priceNaira);
  const salePriceKobo =
    salePriceNairaRaw !== ""
      ? nairaToKobo(Number(salePriceNairaRaw))
      : null;

  return {
    name,
    description,
    sku,
    slug,
    priceKobo,
    salePriceKobo,
    stock: Math.max(0, Math.floor(stock)),
    lowStockAt: Math.max(0, Math.floor(lowStockAt)),
    status,
    isFeatured,
    categoryIds,
  };
}

export async function createProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await actionRequirePermission("products:write");
    const data = parseProductForm(formData);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        priceKobo: data.priceKobo,
        salePriceKobo: data.salePriceKobo,
        stock: data.stock,
        lowStockAt: data.lowStockAt,
        status: data.status,
        isFeatured: data.isFeatured,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    await writeAuditLog({
      actorId: user.id,
      action: "product.create",
      entityType: "Product",
      entityId: product.id,
    });
    revalidatePath("/admin/products");
    revalidateStorefront({ productSlug: product.slug });
    return actionOk({ id: product.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create product";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    logger.error("create_product_failed", { error: msg });
    return actionError(msg);
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const data = parseProductForm(formData);

    await prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          sku: data.sku,
          priceKobo: data.priceKobo,
          salePriceKobo: data.salePriceKobo,
          stock: data.stock,
          lowStockAt: data.lowStockAt,
          status: data.status,
          isFeatured: data.isFeatured,
          publishedAt:
            data.status === "PUBLISHED"
              ? new Date()
              : data.status === "DRAFT"
                ? null
                : undefined,
          categories: {
            create: data.categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
      });
    });

    await writeAuditLog({
      actorId: user.id,
      action: "product.update",
      entityType: "Product",
      entityId: productId,
    });
    revalidatePath("/admin/products");
    revalidateStorefront({ productSlug: data.slug });
    return actionOk();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to update product";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    return actionError(msg);
  }
}

export async function setProductStatus(
  productId: string,
  status: ProductStatus,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      select: { slug: true },
    });
    await writeAuditLog({
      actorId: user.id,
      action: `product.status.${status.toLowerCase()}`,
      entityType: "Product",
      entityId: productId,
    });
    revalidatePath("/admin/products");
    revalidateStorefront({ productSlug: product.slug });
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to update status.");
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true },
    });
    if (!existing) return actionError("Product not found.");

    // InventoryMovement uses onDelete: Restrict; clear it first. Other relations cascade.
    await prisma.$transaction([
      prisma.inventoryMovement.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    await writeAuditLog({
      actorId: user.id,
      action: "product.delete",
      entityType: "Product",
      entityId: productId,
      metadata: { name: existing.name },
    });
    revalidatePath("/admin/products");
    revalidateStorefront({ productSlug: existing.slug });
    return actionOk();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to delete product";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    logger.error("delete_product_failed", { error: msg, productId });
    return actionError(
      "Could not delete this product. Archive it instead if it is linked to past orders.",
    );
  }
}
