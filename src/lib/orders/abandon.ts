import { prisma } from "@/lib/db";
import { restoreCartFromOrder } from "@/lib/cart";
import { releaseReservationsForOrder } from "@/lib/inventory/reservations";

type AbandonOptions = {
  /** Rebuild the shopper bag — only when running inside their request (has cookies). */
  restoreCart?: boolean;
  note?: string;
};

/**
 * Cancel a still-pending Paystack order (customer abandoned checkout or
 * reservation expired). Optionally put items back in their bag.
 */
export async function abandonPendingOrder(orderId: string, options: AbandonOptions = {}) {
  const note = options.note ?? "Payment cancelled or abandoned";
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) return { ok: false as const, reason: "not_found" as const };
    if (order.status !== "PENDING_PAYMENT") {
      return { ok: false as const, reason: "not_pending" as const, status: order.status };
    }

    await releaseReservationsForOrder(tx, order.id);

    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: "PENDING_PAYMENT",
        toStatus: "CANCELLED",
        note,
        isCustomerVisible: true,
      },
    });

    if (order.payment && order.payment.status === "PENDING") {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: "ABANDONED",
          providerStatus: "abandoned",
          failedAt: new Date(),
        },
      });
    }

    return {
      ok: true as const,
      orderId: order.id,
      orderNumber: order.orderNumber,
      authorizationUrl: order.payment?.authorizationUrl ?? null,
    };
  });

  if (result.ok && options.restoreCart) {
    await restoreCartFromOrder(result.orderId);
  }

  return result;
}

/**
 * Cancel PENDING_PAYMENT orders whose stock reservation window has expired.
 * Does not restore carts (no browser session in cron) — bags were kept until
 * paid for Paystack checkouts, so items remain for guests who still have cookies.
 */
export async function abandonExpiredPendingOrders() {
  const expired = await prisma.stockReservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: new Date() },
      orderId: { not: null },
    },
    select: { orderId: true },
    distinct: ["orderId"],
  });

  let cancelled = 0;
  for (const row of expired) {
    if (!row.orderId) continue;
    const order = await prisma.order.findUnique({
      where: { id: row.orderId },
      select: { status: true },
    });
    if (order?.status !== "PENDING_PAYMENT") continue;
    const res = await abandonPendingOrder(row.orderId, {
      restoreCart: false,
      note: "Payment window expired — stock released",
    });
    if (res.ok) cancelled += 1;
  }
  return cancelled;
}
