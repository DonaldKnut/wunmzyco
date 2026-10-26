import { prisma } from "@/lib/db";
import { clearCart, clearCartById, restoreCartFromOrder } from "@/lib/cart";
import { formatNgn } from "@/lib/currency";
import { sendEmail, paymentConfirmationHtml } from "@/lib/email";
import { commitReservationsForOrder, releaseReservationsForOrder } from "@/lib/inventory/reservations";
import { getPaymentProvider } from "@/lib/payments";
import { logger } from "@/lib/logger";

/**
 * Idempotent payment verification.
 * Only marks an order paid when the provider confirms success,
 * currency is NGN, and amount matches the order total.
 */
export async function verifyAndApplyPayment(reference: string, options?: {
  providerEventId?: string;
  eventType?: string;
  payload?: unknown;
  signatureValid?: boolean;
}) {
  if (options?.providerEventId) {
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { providerEventId: options.providerEventId },
    });
    if (existingEvent?.processed) {
      return { alreadyProcessed: true as const, status: "successful" as const };
    }
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === "SUCCESSFUL" && payment.order.status !== "PENDING_PAYMENT") {
    if (options?.providerEventId) {
      await prisma.paymentEvent.upsert({
        where: { providerEventId: options.providerEventId },
        create: {
          paymentId: payment.id,
          providerEventId: options.providerEventId,
          eventType: options.eventType ?? "charge.success",
          payloadJson: (options.payload as object) ?? {},
          signatureValid: options.signatureValid ?? false,
          processed: true,
          processedAt: new Date(),
        },
        update: { processed: true, processedAt: new Date() },
      });
    }
    return { alreadyProcessed: true as const, status: "successful" as const, orderId: payment.orderId };
  }

  const provider = getPaymentProvider();
  const verified = await provider.verify({ reference });

  // Mock sentinel: amountKobo === -1 means accept order amount
  const verifiedAmount =
    verified.amountKobo === -1 && verified.provider === "mock"
      ? payment.amountKobo
      : verified.amountKobo;

  if (verified.status === "successful") {
    if (verified.currency.toUpperCase() !== "NGN") {
      throw new Error("Currency mismatch");
    }
    if (verifiedAmount !== payment.amountKobo || verifiedAmount !== payment.order.totalKobo) {
      logger.error("Payment amount mismatch", {
        reference,
        verifiedAmount,
        paymentAmount: payment.amountKobo,
        orderTotal: payment.order.totalKobo,
      });
      throw new Error("Payment amount mismatch");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const locked = await tx.payment.findUnique({
      where: { id: payment.id },
      include: { order: true },
    });
    if (!locked) throw new Error("Payment not found");

    if (locked.status === "SUCCESSFUL") {
      return { alreadyProcessed: true as const, status: "successful" as const, orderId: locked.orderId };
    }

    if (options?.providerEventId) {
      await tx.paymentEvent.create({
        data: {
          paymentId: locked.id,
          providerEventId: options.providerEventId,
          eventType: options.eventType ?? "verify",
          payloadJson: (options.payload as object) ?? {},
          signatureValid: options.signatureValid ?? true,
          processed: true,
          processedAt: new Date(),
        },
      });
    } else {
      await tx.paymentEvent.create({
        data: {
          paymentId: locked.id,
          eventType: options?.eventType ?? "verify",
          payloadJson: (options?.payload as object) ?? { reference },
          signatureValid: true,
          processed: true,
          processedAt: new Date(),
        },
      });
    }

    if (verified.status === "successful") {
      await tx.payment.update({
        where: { id: locked.id },
        data: {
          status: "SUCCESSFUL",
          providerStatus: verified.providerStatus,
          paidAt: verified.paidAt ?? new Date(),
        },
      });

      if (locked.order.status === "PENDING_PAYMENT") {
        await tx.order.update({
          where: { id: locked.orderId },
          data: {
            status: "PAID",
            paidAt: verified.paidAt ?? new Date(),
            deliveryStatus: "PREPARING",
          },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: locked.orderId,
            fromStatus: "PENDING_PAYMENT",
            toStatus: "PAID",
            fromDeliveryStatus: "NOT_STARTED",
            toDeliveryStatus: "PREPARING",
            note: "Payment verified successfully",
            isCustomerVisible: true,
          },
        });
        await commitReservationsForOrder(tx, locked.orderId);
      }

      return { alreadyProcessed: false as const, status: "successful" as const, orderId: locked.orderId };
    }

    if (verified.status === "failed" || verified.status === "abandoned") {
      await tx.payment.update({
        where: { id: locked.id },
        data: {
          status: verified.status === "abandoned" ? "ABANDONED" : "FAILED",
          providerStatus: verified.providerStatus,
          failedAt: new Date(),
        },
      });
      if (locked.order.status === "PENDING_PAYMENT") {
        await releaseReservationsForOrder(tx, locked.orderId);
        await tx.order.update({
          where: { id: locked.orderId },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: locked.orderId,
            fromStatus: "PENDING_PAYMENT",
            toStatus: "CANCELLED",
            note: `Payment ${verified.status}`,
            isCustomerVisible: true,
          },
        });
      }
      return {
        alreadyProcessed: false as const,
        status: verified.status,
        orderId: locked.orderId,
      };
    }

    return { alreadyProcessed: false as const, status: "pending" as const, orderId: locked.orderId };
  });

  if (result.status === "successful" && !result.alreadyProcessed) {
    // Clear bag only after money is confirmed (cancel/abandon keeps items).
    // Prefer cartId from payment metadata so webhooks (no cookies) still clear.
    const paid = await prisma.payment.findUnique({
      where: { reference },
      select: { metadataJson: true },
    });
    const meta =
      paid?.metadataJson && typeof paid.metadataJson === "object"
        ? (paid.metadataJson as Record<string, unknown>)
        : {};
    const cartId = typeof meta.cartId === "string" ? meta.cartId : null;
    if (cartId) await clearCartById(cartId);
    else await clearCart();

    const order = await prisma.order.findUnique({ where: { id: result.orderId } });
    if (order) {
      await sendEmail({
        to: order.guestEmail,
        subject: `Payment confirmed — ${order.orderNumber}`,
        template: "payment_confirmed",
        html: paymentConfirmationHtml({
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          totalFormatted: formatNgn(order.totalKobo),
        }),
        metadata: { orderId: order.id },
      });
    }
  }

  if (
    (result.status === "failed" || result.status === "abandoned") &&
    !result.alreadyProcessed &&
    result.orderId
  ) {
    // Defensive restore — covers older flows that cleared the cart before Paystack.
    await restoreCartFromOrder(result.orderId);
  }

  return result;
}
