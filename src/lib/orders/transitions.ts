import type { DeliveryStatus, OrderStatus } from "@prisma/client";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED", "PARTIALLY_REFUNDED"],
  DELIVERED: ["REFUNDED", "PARTIALLY_REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
  PARTIALLY_REFUNDED: ["REFUNDED"],
};

const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  NOT_STARTED: ["PREPARING", "FAILED"],
  PREPARING: ["READY_FOR_DISPATCH", "FAILED"],
  READY_FOR_DISPATCH: ["IN_TRANSIT", "FAILED"],
  IN_TRANSIT: ["DELIVERED", "FAILED", "RETURNED"],
  DELIVERED: [],
  FAILED: ["PREPARING", "RETURNED"],
  RETURNED: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid order status transition: ${from} → ${to}`);
  }
}

export function assertDeliveryTransition(from: DeliveryStatus, to: DeliveryStatus) {
  if (!canTransitionDelivery(from, to)) {
    throw new Error(`Invalid delivery status transition: ${from} → ${to}`);
  }
}
