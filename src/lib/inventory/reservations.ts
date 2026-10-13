import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type Tx = Prisma.TransactionClient;

export async function releaseExpiredReservations(tx: Tx = prisma) {
  const expired = await tx.stockReservation.findMany({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
  });

  for (const reservation of expired) {
    if (reservation.variantId) {
      await tx.productVariant.update({
        where: { id: reservation.variantId },
        data: { stock: { increment: reservation.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stock: { increment: reservation.quantity } },
      });
    }

    await tx.stockReservation.update({
      where: { id: reservation.id },
      data: { status: "EXPIRED" },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: reservation.productId,
        variantId: reservation.variantId,
        type: "RELEASE",
        quantity: reservation.quantity,
        reason: "Reservation expired",
        reference: reservation.orderId ?? reservation.id,
      },
    });
  }

  return expired.length;
}

export async function reserveStock(
  tx: Tx,
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>,
  orderId: string,
  expiresAt: Date,
) {
  await releaseExpiredReservations(tx);

  for (const item of items) {
    if (item.variantId) {
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error("Insufficient stock for a selected variant");
      }
    } else {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity }, hasVariants: false },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error("Insufficient stock for a selected product");
      }
    }

    await tx.stockReservation.create({
      data: {
        productId: item.productId,
        variantId: item.variantId ?? null,
        orderId,
        quantity: item.quantity,
        status: "ACTIVE",
        expiresAt,
      },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: item.productId,
        variantId: item.variantId ?? null,
        type: "RESERVATION",
        quantity: -item.quantity,
        reason: "Checkout reservation",
        reference: orderId,
      },
    });
  }
}

export async function commitReservationsForOrder(tx: Tx, orderId: string) {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId, status: "ACTIVE" },
  });

  for (const reservation of reservations) {
    await tx.stockReservation.update({
      where: { id: reservation.id },
      data: { status: "COMMITTED" },
    });
    await tx.inventoryMovement.create({
      data: {
        productId: reservation.productId,
        variantId: reservation.variantId,
        type: "COMMIT",
        quantity: -reservation.quantity,
        reason: "Payment confirmed",
        reference: orderId,
      },
    });
  }
}

export async function releaseReservationsForOrder(tx: Tx, orderId: string) {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId, status: "ACTIVE" },
  });

  for (const reservation of reservations) {
    if (reservation.variantId) {
      await tx.productVariant.update({
        where: { id: reservation.variantId },
        data: { stock: { increment: reservation.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: reservation.productId },
        data: { stock: { increment: reservation.quantity } },
      });
    }

    await tx.stockReservation.update({
      where: { id: reservation.id },
      data: { status: "RELEASED" },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: reservation.productId,
        variantId: reservation.variantId,
        type: "RELEASE",
        quantity: reservation.quantity,
        reason: "Payment failed or cancelled",
        reference: orderId,
      },
    });
  }
}
