import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { effectiveUnitPrice } from "@/lib/store/products";
import { GUEST_CART_COOKIE, getOrCreateGuestId } from "@/lib/cart/cookie";

export { GUEST_CART_COOKIE };

export async function resolveCartId(): Promise<string | null> {
  try {
    const user = await getSessionUser();
    if (user) {
      let cart = await prisma.cart.findFirst({ where: { userId: user.id }, select: { id: true } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: user.id }, select: { id: true } });
      }
      return cart.id;
    }
    const guestId = await getGuestCartId();
    if (!guestId) return null;
    const cart = await prisma.cart.findUnique({ where: { guestId }, select: { id: true } });
    return cart?.id ?? null;
  } catch {
    return null;
  }
}

export async function getGuestCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_CART_COOKIE)?.value ?? null;
}

export async function getOrCreateCartId(): Promise<string | null> {
  try {
    const user = await getSessionUser();
    if (user) {
      let cart = await prisma.cart.findFirst({ where: { userId: user.id }, select: { id: true } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: user.id }, select: { id: true } });
      }
      return cart.id;
    }
    const guestId = await getOrCreateGuestId();
    let cart = await prisma.cart.findUnique({ where: { guestId }, select: { id: true } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { guestId }, select: { id: true } });
    }
    return cart.id;
  } catch {
    return null;
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const cartId = await resolveCartId();
    if (!cartId) return 0;
    const agg = await prisma.cartItem.aggregate({
      where: { cartId },
      _sum: { quantity: true },
    });
    return agg._sum.quantity ?? 0;
  } catch {
    return 0;
  }
}

export type CartLineView = {
  id: string;
  quantity: number;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  unitPriceKobo: number;
  imageUrl: string | null;
  stock: number;
};

export type CartItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

async function validateCartItem(input: CartItemInput) {
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 20) {
    throw new Error("Invalid quantity");
  }

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: { where: { isActive: true } } },
  });

  if (!product || product.status !== "PUBLISHED") {
    throw new Error("Product is unavailable");
  }

  if (product.isOneOfOne && input.quantity > 1) {
    throw new Error("This item is one-of-one");
  }

  if (input.variantId) {
    const variant = product.variants.find((v) => v.id === input.variantId);
    if (!variant) throw new Error("Invalid variant");
    if (variant.stock < input.quantity) throw new Error("Insufficient stock");
  } else if (product.hasVariants) {
    throw new Error("Please select a variant");
  } else if (product.stock < input.quantity) {
    throw new Error("Insufficient stock");
  }
}

export async function getOrCreateCart() {
  const cartId = await getOrCreateCartId();
  if (!cartId) throw new Error("Could not resolve cart");

  return prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              priceKobo: true,
              salePriceKobo: true,
              stock: true,
              hasVariants: true,
              isOneOfOne: true,
              weightGrams: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              stock: true,
              priceKobo: true,
              salePriceKobo: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function addCartItem(input: CartItemInput) {
  await validateCartItem(input);
  const cartId = await getOrCreateCartId();
  if (!cartId) throw new Error("Could not resolve cart");

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId: input.productId,
      variantId: input.variantId ?? null,
    },
  });

  if (existing) {
    const newQty = existing.quantity + input.quantity;
    if (newQty > 20) throw new Error("Maximum quantity per line is 20");
    await validateCartItem({ ...input, quantity: newQty });
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId,
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantity: input.quantity,
      },
    });
  }

  return getOrCreateCart();
}

export async function updateCartItem(itemId: string, quantity: number) {
  const cartId = await getOrCreateCartId();
  if (!cartId) throw new Error("Could not resolve cart");

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId },
  });
  if (!item) throw new Error("Cart item not found");

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return getOrCreateCart();
  }

  await validateCartItem({
    productId: item.productId,
    variantId: item.variantId,
    quantity,
  });

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getOrCreateCart();
}

export async function removeCartItem(itemId: string) {
  const cartId = await getOrCreateCartId();
  if (!cartId) throw new Error("Could not resolve cart");

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId },
  });
  if (!item) throw new Error("Cart item not found");

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getOrCreateCart();
}

export function cartToCheckoutItems(
  cart: Awaited<ReturnType<typeof getOrCreateCart>>,
): CartItemInput[] {
  return cart.items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
  }));
}

export async function getCartLines(): Promise<CartLineView[]> {
  try {
    const cartId = await getOrCreateCartId();
    if (!cartId) return [];
    const items = await prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: {
          include: { images: { where: { isCover: true }, take: 1 } },
        },
        variant: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return items.map((item) => {
      const unit = item.variant
        ? item.variant.salePriceKobo ?? item.variant.priceKobo ?? effectiveUnitPrice(item.product)
        : effectiveUnitPrice(item.product);
      const stock = item.variant?.stock ?? item.product.stock;
      const image = item.product.images[0]?.url ?? null;
      return {
        id: item.id,
        quantity: item.quantity,
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        slug: item.product.slug,
        unitPriceKobo: unit,
        imageUrl: image,
        stock,
      };
    });
  } catch {
    return [];
  }
}
