"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { revalidateStorefront } from "@/lib/admin/revalidate-storefront";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

async function uniqueCategorySlug(base: string, excludeId?: string | null): Promise<string> {
  const root = slugify(base) || `category-${Date.now().toString(36)}`;
  let candidate = root;
  for (let i = 0; i < 30; i++) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

async function uniqueCollectionSlug(base: string, excludeId?: string | null): Promise<string> {
  const root = slugify(base) || `collection-${Date.now().toString(36)}`;
  let candidate = root;
  for (let i = 0; i < 30; i++) {
    const existing = await prisma.collection.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/categories");
  revalidateStorefront(slug ? { categorySlug: slug } : undefined);
}

export async function upsertCategory(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await actionRequirePermission("products:write");
    const id = String(formData.get("id") ?? "").trim() || null;
    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const imageUrlRaw = formData.get("imageUrl");
    const imageUrl =
      imageUrlRaw === null ? undefined : String(imageUrlRaw).trim() || null;
    const sortOrderRaw = Number(formData.get("sortOrder") ?? 0);
    const sortOrder = Number.isFinite(sortOrderRaw) ? Math.trunc(sortOrderRaw) : 0;
    // New categories default to active; only treat as off when the field is present and unchecked.
    const isActiveField = formData.get("isActive");
    const isActive =
      isActiveField === null && !id ? true : isActiveField === "on" || isActiveField === "true";

    if (!name) return actionError("Please enter a category name.");

    const slug = await uniqueCategorySlug(slugInput || name, id);

    let categoryId = id;
    if (id) {
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          sortOrder,
          isActive,
          ...(imageUrl !== undefined ? { imageUrl } : {}),
        },
      });
    } else {
      const created = await prisma.category.create({
        data: {
          name,
          slug,
          description,
          sortOrder,
          isActive: true, // always visible when newly created
          imageUrl: imageUrl ?? null,
        },
      });
      categoryId = created.id;
    }

    await writeAuditLog({
      actorId: user.id,
      action: id ? "category.update" : "category.create",
      entityType: "Category",
      entityId: categoryId ?? undefined,
    });
    revalidateCategoryPaths(slug);
    return actionOk({ id: categoryId! });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return actionError("A category with that name or link already exists. Try a different name.");
    }
    logger.error("upsert_category_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return actionError("Could not save the category. Please try again.");
  }
}

/** Replace the set of products linked to a category. */
export async function setCategoryProducts(
  categoryId: string,
  productIds: string[],
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true, name: true },
    });
    if (!category) return actionError("Category not found.");

    const uniqueIds = [...new Set(productIds.map(String).filter(Boolean))];
    const validProducts = uniqueIds.length
      ? await prisma.product.findMany({
          where: { id: { in: uniqueIds } },
          select: { id: true },
        })
      : [];
    const validIds = validProducts.map((p) => p.id);

    await prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { categoryId } });
      if (validIds.length) {
        await tx.productCategory.createMany({
          data: validIds.map((productId) => ({ productId, categoryId })),
          skipDuplicates: true,
        });
      }
    });

    await writeAuditLog({
      actorId: user.id,
      action: "category.products.set",
      entityType: "Category",
      entityId: categoryId,
      metadata: { productCount: validIds.length },
    });
    revalidateCategoryPaths(category.slug);
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    logger.error("set_category_products_failed", {
      error: e instanceof Error ? e.message : String(e),
      categoryId,
    });
    return actionError("Could not update products in this category.");
  }
}

export async function setCategoryActive(
  categoryId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { isActive },
      select: { slug: true },
    });
    await writeAuditLog({
      actorId: user.id,
      action: isActive ? "category.activate" : "category.deactivate",
      entityType: "Category",
      entityId: categoryId,
    });
    revalidateCategoryPaths(category.slug);
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Could not update category visibility.");
  }
}

/** One-shot repair for categories saved with an empty slug (blocked further creates). */
export async function repairCategorySlugs(): Promise<ActionResult<{ fixed: number }>> {
  try {
    await actionRequirePermission("products:write");
    const broken = await prisma.category.findMany({
      where: { OR: [{ slug: "" }, { slug: " " }] },
      select: { id: true, name: true },
    });
    let fixed = 0;
    for (const row of broken) {
      const slug = await uniqueCategorySlug(row.name, row.id);
      await prisma.category.update({ where: { id: row.id }, data: { slug, isActive: true } });
      fixed += 1;
    }
    // Also reactivate any inactive categories that were likely created by mistake
    // (admin create form used to save unchecked isActive as false).
    if (fixed > 0) revalidateCategoryPaths();
    return actionOk({ fixed });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Could not repair categories.");
  }
}

export async function upsertCollection(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const id = String(formData.get("id") ?? "").trim() || null;
    const name = String(formData.get("name") ?? "").trim();
    const slugInput = String(formData.get("slug") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const imageUrlRaw = formData.get("imageUrl");
    const imageUrl =
      imageUrlRaw === null ? undefined : String(imageUrlRaw).trim() || null;
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const isFeatured = formData.get("isFeatured") === "on";
    const isActiveField = formData.get("isActive");
    const isActive =
      isActiveField === null && !id ? true : isActiveField === "on" || isActiveField === "true";

    if (!name) return actionError("Please enter a collection name.");

    const slug = await uniqueCollectionSlug(slugInput || name, id);

    if (id) {
      await prisma.collection.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          sortOrder,
          isFeatured,
          isActive,
          ...(imageUrl !== undefined ? { imageUrl } : {}),
        },
      });
    } else {
      await prisma.collection.create({
        data: {
          name,
          slug,
          description,
          sortOrder,
          isFeatured,
          isActive: true,
          imageUrl: imageUrl ?? null,
        },
      });
    }

    await writeAuditLog({
      actorId: user.id,
      action: id ? "collection.update" : "collection.create",
      entityType: "Collection",
      entityId: id ?? undefined,
    });
    revalidatePath("/admin/collections");
    revalidateStorefront();
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return actionError("A collection with that name or link already exists.");
    }
    return actionError("Could not save the collection. Please try again.");
  }
}

export async function adjustInventory(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("inventory:write");
    const productId = String(formData.get("productId") ?? "");
    const delta = Number(formData.get("delta"));
    const reason = String(formData.get("reason") ?? "").trim() || "Manual adjustment";

    if (!productId || !Number.isFinite(delta) || delta === 0) {
      return actionError("Product and non-zero adjustment are required.");
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found.");
      const nextStock = Math.max(0, product.stock + Math.trunc(delta));
      await tx.product.update({
        where: { id: productId },
        data: { stock: nextStock },
      });
      await tx.inventoryMovement.create({
        data: {
          productId,
          type: "ADJUSTMENT",
          quantity: Math.trunc(delta),
          reason,
          createdBy: user.id,
        },
      });
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidateStorefront();
    return actionOk();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Adjustment failed";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    return actionError(msg);
  }
}
