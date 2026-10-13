"use server";

import { prisma } from "@/lib/db";
import { hashTrackingToken } from "@/lib/orders/numbers";

export type TrackOrderState = {
  ok: boolean;
  message: string;
  order?: {
    orderNumber: string;
    status: string;
    deliveryStatus: string;
    createdAt: string;
    customerVisibleHistory: { note: string | null; createdAt: string; toStatus: string }[];
  };
};

export async function trackOrderAction(
  _prev: TrackOrderState,
  formData: FormData,
): Promise<TrackOrderState> {
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  if (!orderNumber || !token) {
    return { ok: false, message: "Enter your order number and tracking token." };
  }
  try {
    const tokenHash = hashTrackingToken(token);
    const order = await prisma.order.findFirst({
      where: { orderNumber, trackingTokenHash: tokenHash },
      include: {
        statusHistory: {
          where: { isCustomerVisible: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!order) {
      return { ok: false, message: "We couldn't find an order with those details." };
    }
    return {
      ok: true,
      message: "",
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryStatus: order.deliveryStatus,
        createdAt: order.createdAt.toISOString(),
        customerVisibleHistory: order.statusHistory.map((h) => ({
          note: h.note,
          createdAt: h.createdAt.toISOString(),
          toStatus: h.toStatus,
        })),
      },
    };
  } catch {
    return { ok: false, message: "Unable to look up order right now." };
  }
}
