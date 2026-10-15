"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getCartLines } from "@/lib/cart";
import { createPendingOrderAndInitializePayment } from "@/lib/orders/checkout";
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
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please complete all required fields.",
    };
  }

  const { couponCode, ...address } = parsed.data;
  const user = await getSessionUser();

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
    });

    if (result.authorizationUrl) {
      redirect(result.authorizationUrl);
    }
    redirect(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return { ok: false, message };
  }
}
