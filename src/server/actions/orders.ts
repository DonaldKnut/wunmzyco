"use server";

import { revalidatePath } from "next/cache";
import type { DeliveryStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertDeliveryTransition, assertOrderTransition } from "@/lib/orders/transitions";
import { writeAuditLog } from "@/lib/audit";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

export async function transitionOrderStatus(
  orderId: string,
  toStatus: OrderStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("orders:write");
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return actionError("Order not found.");

    assertOrderTransition(order.status, toStatus);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: toStatus,
          paidAt: toStatus === "PAID" && !order.paidAt ? new Date() : order.paidAt,
          cancelledAt: toStatus === "CANCELLED" ? new Date() : order.cancelledAt,
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          note: note?.trim() || null,
          changedById: user.id,
          isCustomerVisible: true,
        },
      });
    });

    await writeAuditLog({
      actorId: user.id,
      action: "order.status_change",
      entityType: "Order",
      entityId: orderId,
      metadata: { from: order.status, to: toStatus },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return actionOk();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transition failed";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    return actionError(msg);
  }
}

export async function transitionDeliveryStatus(
  orderId: string,
  toDeliveryStatus: DeliveryStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("orders:write");
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return actionError("Order not found.");

    assertDeliveryTransition(order.deliveryStatus, toDeliveryStatus);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { deliveryStatus: toDeliveryStatus },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: order.status,
          fromDeliveryStatus: order.deliveryStatus,
          toDeliveryStatus,
          note: note?.trim() || null,
          changedById: user.id,
          isCustomerVisible: true,
        },
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return actionOk();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transition failed";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    return actionError(msg);
  }
}

export async function addOrderSupportNote(
  orderId: string,
  note: string,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("orders:write");
    const trimmed = note.trim();
    if (!trimmed) return actionError("Note cannot be empty.");

    await prisma.orderSupportNote.create({
      data: { orderId, authorId: user.id, note: trimmed },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to add note.");
  }
}
