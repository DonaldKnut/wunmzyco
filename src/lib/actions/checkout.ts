"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getCartLines } from "@/lib/cart";
import { createPendingOrderAndInitializePayment } from "@/lib/orders/checkout";

export type CheckoutState = { ok: boolean; message: string };

export async function submitCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const lines = await getCartLines();
  if (!lines.length) {
    return { ok: false, message: "Your cart is empty." };
  }

  const address = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    street: String(formData.get("street") ?? "").trim(),
    landmark: String(formData.get("landmark") ?? "").trim() || undefined,
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    deliveryZoneId: String(formData.get("deliveryZoneId") ?? ""),
    deliveryNotes: String(formData.get("deliveryNotes") ?? "").trim() || undefined,
  };

  if (
    !address.fullName ||
    !address.email ||
    !address.phone ||
    !address.street ||
    !address.city ||
    !address.state ||
    !address.deliveryZoneId
  ) {
    return { ok: false, message: "Please complete all required fields." };
  }

  const user = await getSessionUser();

  try {
    const result = await createPendingOrderAndInitializePayment({
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
      address,
      userId: user?.id ?? null,
      couponCode: String(formData.get("couponCode") ?? "").trim() || null,
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
