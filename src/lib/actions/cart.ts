"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCartId } from "@/lib/cart";

export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const variantIdRaw = formData.get("variantId");
  const variantId = variantIdRaw ? String(variantIdRaw) : null;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));

  if (!productId) return { ok: false as const, message: "Missing product" };

  try {
    const cartId = await getOrCreateCartId();
    if (!cartId) return { ok: false as const, message: "Cart unavailable" };

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "PUBLISHED" },
    });
    if (!product) return { ok: false as const, message: "Product not found" };

    const existing = await prisma.cartItem.findFirst({
      where: { cartId, productId, variantId },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId, productId, variantId, quantity },
      });
    }
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { ok: true as const, message: "Added to cart" };
  } catch {
    return { ok: false as const, message: "Could not add to cart" };
  }
}

export async function updateCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Math.max(0, Number(formData.get("quantity") ?? 1));
  try {
    const cartId = await getOrCreateCartId();
    if (!cartId) return;
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: itemId, cartId },
        data: { quantity },
      });
    }
    revalidatePath("/cart");
    revalidatePath("/", "layout");
  } catch {
    // ignore
  }
}

export async function removeCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  try {
    const cartId = await getOrCreateCartId();
    if (!cartId) return;
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
    revalidatePath("/cart");
    revalidatePath("/", "layout");
  } catch {
    // ignore
  }
}

export async function setProductCartQuantity(input: {
  productId: string;
  variantId?: string | null;
  quantity: number;
}) {
  const productId = input.productId;
  const variantId = input.variantId ?? null;
  const quantity = Math.max(0, Math.floor(input.quantity));

  if (!productId) return { ok: false as const, message: "Missing product" };

  try {
    const cartId = await getOrCreateCartId();
    if (!cartId) return { ok: false as const, message: "Cart unavailable" };

    const existing = await prisma.cartItem.findFirst({
      where: { cartId, productId, variantId },
    });

    if (quantity === 0) {
      if (existing) {
        await prisma.cartItem.delete({ where: { id: existing.id } });
      }
      revalidatePath("/cart");
      revalidatePath("/", "layout");
      return { ok: true as const, message: "Removed from cart" };
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "PUBLISHED" },
    });
    if (!product) return { ok: false as const, message: "Product not found" };

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId, productId, variantId, quantity },
      });
    }
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { ok: true as const, message: "Bag updated" };
  } catch {
    return { ok: false as const, message: "Could not update cart" };
  }
}

export async function removeProductFromCart(input: {
  productId: string;
  variantId?: string | null;
}) {
  return setProductCartQuantity({
    productId: input.productId,
    variantId: input.variantId,
    quantity: 0,
  });
}
