"use server";

import { revalidatePath } from "next/cache";
import type { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { nairaToKobo } from "@/lib/currency";
import { slugify } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
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
    revalidatePath(`/admin/products/${productId}/edit`);
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
    await prisma.product.update({
      where: { id: productId },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    await writeAuditLog({
      actorId: user.id,
      action: `product.status.${status.toLowerCase()}`,
      entityType: "Product",
      entityId: productId,
    });
    revalidatePath("/admin/products");
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to update status.");
  }
}
