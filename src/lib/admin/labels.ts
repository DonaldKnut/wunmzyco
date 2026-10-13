import type {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ReviewStatus,
  Role,
} from "@prisma/client";

export function formatOrderStatus(s: OrderStatus): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPaymentStatus(s: PaymentStatus): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatProductStatus(s: ProductStatus): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function formatDeliveryStatus(s: DeliveryStatus): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatReviewStatus(s: ReviewStatus): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function formatRole(s: Role): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
