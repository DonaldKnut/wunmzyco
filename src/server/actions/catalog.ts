"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";
import { revalidateStorefront } from "@/lib/admin/revalidate-storefront";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

export async function upsertCategory(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const id = String(formData.get("id") ?? "").trim() || null;
    const name = String(formData.get("name") ?? "").trim();
    const slug = slugify(String(formData.get("slug") ?? name));
    const description = String(formData.get("description") ?? "").trim() || null;
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const isActive = formData.get("isActive") === "on";

    if (!name) return actionError("Name is required.");

    if (id) {
      await prisma.category.update({
        where: { id },
        data: { name, slug, description, sortOrder, isActive },
      });
    } else {
      await prisma.category.create({
        data: { name, slug, description, sortOrder, isActive },
      });
    }

    await writeAuditLog({
      actorId: user.id,
      action: id ? "category.update" : "category.create",
      entityType: "Category",
      entityId: id ?? undefined,
    });
    revalidatePath("/admin/categories");
    revalidateStorefront({ categorySlug: slug });
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to save category.");
  }
}

export async function upsertCollection(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("products:write");
    const id = String(formData.get("id") ?? "").trim() || null;
    const name = String(formData.get("name") ?? "").trim();
    const slug = slugify(String(formData.get("slug") ?? name));
    const description = String(formData.get("description") ?? "").trim() || null;
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") === "on";

    if (!name) return actionError("Name is required.");

    if (id) {
      await prisma.collection.update({
        where: { id },
        data: { name, slug, description, sortOrder, isFeatured, isActive },
      });
    } else {
      await prisma.collection.create({
        data: { name, slug, description, sortOrder, isFeatured, isActive },
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
    return actionError("Failed to save collection.");
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
