"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { clearCart, getCartLines, getOrCreateCartId } from "@/lib/cart";
import { createPendingOrderAndInitializePayment } from "@/lib/orders/checkout";
import { firstZodMessage } from "@/lib/forms/zod";
import { checkoutFormSchema } from "@/lib/schemas/checkout";

export type CheckoutState = { ok: boolean; message: string };

export async function submitCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const lines = await getCartLines();
  if (!lines.length) {
    return { ok: false, message: "Your cart is empty." };
  }

  const parsed = checkoutFormSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    landmark: formData.get("landmark") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    deliveryZoneId: formData.get("deliveryZoneId"),
    deliveryNotes: formData.get("deliveryNotes") || "",
    couponCode: formData.get("couponCode") || "",
    paymentMethod: formData.get("paymentMethod") || "paystack",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: firstZodMessage(parsed.error, "Please complete all required fields."),
    };
  }

  const { couponCode, paymentMethod, ...address } = parsed.data;
  const user = await getSessionUser();
  const cartId = await getOrCreateCartId();

  try {
    const result = await createPendingOrderAndInitializePayment({
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
      address: {
        ...address,
        landmark: address.landmark || undefined,
        deliveryNotes: address.deliveryNotes || undefined,
      },
      userId: user?.id ?? null,
      couponCode: couponCode?.trim() || null,
      paymentMethod,
      cartId,
    });

    // Paystack: keep the bag until payment succeeds (cancel → items still there).
    // WhatsApp: order is already placed for admin — clear the bag now.
    if (paymentMethod === "whatsapp") {
      await clearCart();
    }

    if (result.authorizationUrl) {
      redirect(result.authorizationUrl);
    }
    redirect(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}`);
  } catch (err) {
    // Next.js redirect() throws; rethrow so navigation still happens
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Checkout failed";
    return { ok: false, message };
  }
}
