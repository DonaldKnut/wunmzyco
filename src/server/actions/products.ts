"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { nairaToKobo } from "@/lib/currency";
import { slugify } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { generateUniqueProductSku } from "@/lib/products/sku";
import { revalidateStorefront } from "@/lib/admin/revalidate-storefront";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

type ImageInput = {
  url: string;
  publicId?: string | null;
  alt?: string;
  isCover?: boolean;
};

const PRODUCT_STATUSES = new Set<ProductStatus>(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function parseImagesJson(raw: FormDataEntryValue | null): ImageInput[] {
  if (!raw || typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is ImageInput => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof (item as ImageInput).url === "string" &&
          (item as ImageInput).url.length > 0
        );
      })
      .slice(0, 12)
      .map((item, index) => ({
        url: item.url.trim(),
        publicId: item.publicId ?? null,
        alt: (typeof item.alt === "string" ? item.alt.trim() : "") || undefined,
        isCover: Boolean(item.isCover) || index === 0,
      }));
  } catch {
    return [];
  }
}

function friendlyPrismaError(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = Array.isArray(error.meta?.target)
        ? (error.meta.target as string[]).join(", ")
        : String(error.meta?.target ?? "field");
      if (fields.includes("sku")) {
        return "That product code (SKU) is already used. Try saving again — a new one will be generated.";
      }
      if (fields.includes("slug")) {
        return "Another product already uses this URL slug. Change the slug or the product name and try again.";
      }
      return "This product conflicts with an existing one. Check the name, slug, or code and try again.";
    }
    if (error.code === "P2003") {
      return "One of the categories you selected no longer exists. Refresh the page and pick again.";
    }
    if (error.code === "P2025") {
      return "That product could not be found. It may have been deleted.";
    }
  }
  return null;
}

async function ensureUniqueSlug(base: string, excludeProductId?: string): Promise<string> {
  const root = slugify(base) || `product-${Date.now().toString(36)}`;
  let candidate = root;
  for (let i = 0; i < 20; i++) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || (excludeProductId && existing.id === excludeProductId)) {
      return candidate;
    }
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${randomSuffix()}`;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

function parseProductForm(formData: FormData, opts?: { requireSku?: boolean }) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const skuRaw = String(formData.get("sku") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const priceNaira = Number(formData.get("priceNaira"));
  const salePriceNairaRaw = String(formData.get("salePriceNaira") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);
  const lowStockAt = Number(formData.get("lowStockAt") ?? 2);
  const statusRaw = String(formData.get("status") ?? "DRAFT");
  const isFeatured = formData.get("isFeatured") === "on";
  const categoryIds = [...new Set(formData.getAll("categoryIds").map(String).filter(Boolean))];
  const images = parseImagesJson(formData.get("imagesJson"));

  if (!name) throw new Error("Please enter a product name.");
  if (!description) throw new Error("Please add a short description so shoppers know what they’re buying.");
  if (opts?.requireSku && !skuRaw) throw new Error("Product code (SKU) is missing.");
  if (!Number.isFinite(priceNaira) || priceNaira < 0) {
    throw new Error("Please enter a valid price in naira.");
  }

  let salePriceKobo: number | null = null;
  if (salePriceNairaRaw !== "") {
    const saleNaira = Number(salePriceNairaRaw);
    if (!Number.isFinite(saleNaira) || saleNaira < 0) {
      throw new Error("Sale price looks invalid. Leave it blank or enter a number.");
    }
    salePriceKobo = nairaToKobo(saleNaira);
  }

  const status = (PRODUCT_STATUSES.has(statusRaw as ProductStatus)
    ? statusRaw
    : "DRAFT") as ProductStatus;

  const coverIndex = Math.max(
    0,
    images.findIndex((img) => img.isCover),
  );

  return {
    name,
    description,
    sku: skuRaw || null,
    slugRaw,
    priceKobo: nairaToKobo(priceNaira),
    salePriceKobo,
    stock: Math.max(0, Math.floor(Number.isFinite(stock) ? stock : 0)),
    lowStockAt: Math.max(0, Math.floor(Number.isFinite(lowStockAt) ? lowStockAt : 2)),
    status,
    isFeatured,
    categoryIds,
    images: images.map((img, index) => ({
      url: img.url,
      publicId: img.publicId ?? null,
      alt: img.alt ?? null,
      sortOrder: index,
      isCover: index === (coverIndex >= 0 ? coverIndex : 0),
    })),
  };
}

async function filterValidCategoryIds(categoryIds: string[]): Promise<string[]> {
  if (!categoryIds.length) return [];
  const rows = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function createProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await actionRequirePermission("products:write");
    const data = parseProductForm(formData, { requireSku: false });
    const sku = await generateUniqueProductSku();
    const slug = await ensureUniqueSlug(data.slugRaw || data.name);
    const categoryIds = await filterValidCategoryIds(data.categoryIds);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        sku,
        priceKobo: data.priceKobo,
        salePriceKobo: data.salePriceKobo,
        stock: data.stock,
        lowStockAt: data.lowStockAt,
        status: data.status,
        isFeatured: data.isFeatured,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt,
            sortOrder: img.sortOrder,
            isCover: img.isCover,
          })),
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
    const prismaMsg = friendlyPrismaError(e);
    const msg = prismaMsg ?? (e instanceof Error ? e.message : "Failed to create product");
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    logger.error("create_product_failed", {
      error: e instanceof Error ? e.message : String(e),
      code: e instanceof Prisma.PrismaClientKnownRequestError ? e.code : undefined,
    });
    return actionError(msg);
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const data = parseProductForm(formData, { requireSku: true });
    const sku = data.sku;
    if (!sku) return actionError("Product code (SKU) is missing.");

    const slug = await ensureUniqueSlug(data.slugRaw || data.name, productId);
    const categoryIds = await filterValidCategoryIds(data.categoryIds);

    await prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug,
          description: data.description,
          sku,
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
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
          images: {
            create: data.images.map((img) => ({
              url: img.url,
              publicId: img.publicId,
              alt: img.alt,
              sortOrder: img.sortOrder,
              isCover: img.isCover,
            })),
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
    revalidateStorefront({ productSlug: slug });
    return actionOk();
  } catch (e) {
    const prismaMsg = friendlyPrismaError(e);
    const msg = prismaMsg ?? (e instanceof Error ? e.message : "Failed to update product");
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    logger.error("update_product_failed", {
      error: e instanceof Error ? e.message : String(e),
      productId,
    });
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
