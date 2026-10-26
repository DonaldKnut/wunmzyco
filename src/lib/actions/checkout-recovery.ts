"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { restoreCartFromOrder } from "@/lib/cart";
import { abandonPendingOrder } from "@/lib/orders/abandon";
import { revalidatePath } from "next/cache";

/**
 * Customer chose to give up on a pending Paystack payment — cancel the order,
 * free stock, restore the bag, send them to cart.
 */
export async function cancelPendingCheckoutAndRestoreBag(formData: FormData) {
  const reference = String(formData.get("reference") ?? "").trim();
  if (!reference) {
    redirect("/cart");
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    select: { orderId: true, authorizationUrl: true, order: { select: { status: true } } },
  });

  if (!payment) {
    redirect("/cart");
  }

  if (payment.order.status === "PENDING_PAYMENT") {
    await abandonPendingOrder(payment.orderId, {
      restoreCart: true,
      note: "Customer cancelled payment and restored bag",
    });
  } else {
    await restoreCartFromOrder(payment.orderId);
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/cart");
}

/**
 * Resume an unfinished Paystack authorization (order still PENDING_PAYMENT).
 */
export async function resumePaystackCheckout(formData: FormData) {
  const reference = String(formData.get("reference") ?? "").trim();
  if (!reference) redirect("/checkout/failed?reason=missing_reference");

  const payment = await prisma.payment.findUnique({
    where: { reference },
    select: {
      authorizationUrl: true,
      status: true,
      order: { select: { status: true } },
    },
  });

  if (
    payment?.authorizationUrl &&
    payment.order.status === "PENDING_PAYMENT" &&
    payment.status === "PENDING"
  ) {
    redirect(payment.authorizationUrl);
  }

  redirect(
    `/checkout/failed?reference=${encodeURIComponent(reference)}&status=expired`,
  );
}
