import { prisma } from "@/lib/db";
import { addKobo, multiplyKobo } from "@/lib/currency";
import {
  calculateDeliveryFee,
  calculateShipmentWeight,
  type DeliveryQuoteResult,
} from "@/lib/delivery/calculator";
import { reserveStock } from "@/lib/inventory/reservations";
import {
  generateOrderNumber,
  generatePaymentReference,
  generateTrackingToken,
  hashTrackingToken,
} from "@/lib/orders/numbers";
import { getPaymentProvider } from "@/lib/payments";
import { absoluteUrl } from "@/lib/utils";
import { sendEmail, orderConfirmationHtml } from "@/lib/email";
import { formatNgn } from "@/lib/currency";
import type { Prisma } from "@prisma/client";

export type CheckoutItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CheckoutAddressInput = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  deliveryZoneId: string;
  deliveryNotes?: string;
};

export type CheckoutPaymentMethod = "paystack" | "whatsapp";

export type CheckoutInput = {
  items: CheckoutItemInput[];
  address: CheckoutAddressInput;
  userId?: string | null;
  couponCode?: string | null;
  paymentMethod?: CheckoutPaymentMethod;
  /** Cart to clear after successful Paystack payment (works for webhooks too). */
  cartId?: string | null;
};

function normalizeWhatsAppDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

function buildWhatsAppOrderMessage(input: {
  orderNumber: string;
  customerName: string;
  totalFormatted: string;
  phone: string;
  trackingUrl: string;
}): string {
  return [
    `Hi Wunmzy Co — I'd like to pay for order *${input.orderNumber}*.`,
    `Name: ${input.customerName}`,
    `Phone: ${input.phone}`,
    `Total: ${input.totalFormatted}`,
    `Track: ${input.trackingUrl}`,
  ].join("\n");
}

function unitPrice(product: {
  priceKobo: number;
  salePriceKobo: number | null;
}, variant?: {
  priceKobo: number | null;
  salePriceKobo: number | null;
} | null) {
  if (variant) {
    const base = variant.priceKobo ?? product.priceKobo;
    const sale = variant.salePriceKobo ?? product.salePriceKobo;
    return sale != null && sale < base ? sale : base;
  }
  return product.salePriceKobo != null && product.salePriceKobo < product.priceKobo
    ? product.salePriceKobo
    : product.priceKobo;
}

export async function quoteDeliveryForCart(
  items: CheckoutItemInput[],
  deliveryZoneId: string,
  couponCode?: string | null,
) {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const defaultWeight = settings?.defaultWeightGrams ?? 400;

  const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
  if (!zone || !zone.isActive) throw new Error("Invalid delivery zone");

  const priced = await priceItems(items);
  const weight = calculateShipmentWeight(
    priced.lines.map((p) => ({ weightGrams: p.weightGrams, quantity: p.quantity })),
    defaultWeight,
  );

  let discountKobo = 0;
  if (couponCode) {
    discountKobo = await computeCouponDiscount(couponCode, priced.subtotalKobo);
  }

  const quote = calculateDeliveryFee(zone, weight.totalGrams, {
    subtotalKobo: priced.subtotalKobo - discountKobo,
    weightEstimated: weight.estimated,
  });

  return {
    items: priced.lines,
    subtotalKobo: priced.subtotalKobo,
    discountKobo,
    delivery: quote,
    totalWeightGrams: weight.totalGrams,
    weightEstimated: weight.estimated,
    totalKobo: addKobo(priced.subtotalKobo, -discountKobo, quote.totalFeeKobo),
  };
}

async function computeCouponDiscount(code: string, subtotalKobo: number): Promise<number> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) throw new Error("Invalid coupon code");
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new Error("Coupon is not active yet");
  if (coupon.endsAt && coupon.endsAt < now) throw new Error("Coupon has expired");
  if (coupon.maxRedemptions != null && coupon.redemptionCount >= coupon.maxRedemptions) {
    throw new Error("Coupon redemption limit reached");
  }
  if (coupon.minSubtotalKobo != null && subtotalKobo < coupon.minSubtotalKobo) {
    throw new Error("Order does not meet coupon minimum");
  }

  if (coupon.percentOff != null) {
    return Math.floor((subtotalKobo * coupon.percentOff) / 100);
  }
  if (coupon.amountOffKobo != null) {
    return Math.min(coupon.amountOffKobo, subtotalKobo);
  }
  return 0;
}

async function priceItems(items: CheckoutItemInput[]) {
  if (!items.length) throw new Error("Cart is empty");

  const lines: Array<{
    productId: string;
    variantId: string | null;
    productName: string;
    productSlug: string;
    sku: string;
    variantName: string | null;
    condition: string;
    unitPriceKobo: number;
    quantity: number;
    weightGrams: number;
    lineTotalKobo: number;
    imageUrl: string | null;
    snapshotJson: Prisma.InputJsonValue;
    isOneOfOne: boolean;
  }> = [];

  let subtotalKobo = 0;

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Invalid quantity");
    }

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      throw new Error("One or more products are unavailable");
    }

    if (product.isOneOfOne && item.quantity > 1) {
      throw new Error(`${product.name} is a one-of-one item`);
    }

    let variant = null;
    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId && v.isActive) ?? null;
      if (!variant) throw new Error("Invalid product variant");
      if (variant.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
    } else if (product.hasVariants) {
      throw new Error(`Please select a variant for ${product.name}`);
    } else if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const price = unitPrice(product, variant);
    const weight = variant?.weightGrams ?? product.weightGrams ?? 0;
    const lineTotal = multiplyKobo(price, item.quantity);
    subtotalKobo = addKobo(subtotalKobo, lineTotal);

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      productSlug: product.slug,
      sku: variant?.sku ?? product.sku,
      variantName: variant?.name ?? null,
      condition: product.condition,
      unitPriceKobo: price,
      quantity: item.quantity,
      weightGrams: weight,
      lineTotalKobo: lineTotal,
      imageUrl: product.images.find((i) => i.isCover)?.url ?? product.images[0]?.url ?? null,
      isOneOfOne: product.isOneOfOne,
      snapshotJson: {
        name: product.name,
        slug: product.slug,
        sku: variant?.sku ?? product.sku,
        condition: product.condition,
        material: product.material,
        sizes: product.sizes,
        colours: product.colours,
        measurements: product.measurements,
        variant: variant
          ? { id: variant.id, name: variant.name, size: variant.size, colour: variant.colour }
          : null,
        unitPriceKobo: price,
        quantity: item.quantity,
      },
    });
  }

  return { lines, subtotalKobo };
}

export async function createPendingOrderAndInitializePayment(input: CheckoutInput) {
  const paymentMethod: CheckoutPaymentMethod = input.paymentMethod ?? "paystack";
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const reservationMinutes = settings?.reservationMinutes ?? 30;
  const defaultWeight = settings?.defaultWeightGrams ?? 400;

  if (paymentMethod === "whatsapp") {
    const wa = settings?.whatsappNumber?.trim();
    if (!wa) {
      throw new Error(
        "WhatsApp checkout is not configured. Set a WhatsApp number in Admin → Settings.",
      );
    }
  }

  const zone = await prisma.deliveryZone.findUnique({ where: { id: input.address.deliveryZoneId } });
  if (!zone || !zone.isActive) throw new Error("Invalid delivery zone");

  const priced = await priceItems(input.items);
  const weight = calculateShipmentWeight(
    priced.lines.map((l) => ({ weightGrams: l.weightGrams || null, quantity: l.quantity })),
    defaultWeight,
  );

  let discountKobo = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    discountKobo = await computeCouponDiscount(input.couponCode, priced.subtotalKobo);
    couponCode = input.couponCode.toUpperCase();
  }

  const delivery: DeliveryQuoteResult = calculateDeliveryFee(zone, weight.totalGrams, {
    subtotalKobo: priced.subtotalKobo - discountKobo,
    weightEstimated: weight.estimated,
  });

  const totalKobo = addKobo(priced.subtotalKobo, -discountKobo, delivery.totalFeeKobo);
  if (totalKobo < 100) throw new Error("Order total is below the minimum payable amount");

  const orderNumber = generateOrderNumber();
  const trackingToken = generateTrackingToken();
  const trackingTokenHash = hashTrackingToken(trackingToken);
  const paymentReference = generatePaymentReference(orderNumber);
  const expiresAt = new Date(Date.now() + reservationMinutes * 60 * 1000);
  const channel = paymentMethod === "whatsapp" ? "WHATSAPP" : "WEB";
  const trackingUrl = absoluteUrl(`/track-order?token=${trackingToken}`);

  const order = await prisma.$transaction(async (tx) => {
    const quote = await tx.deliveryQuote.create({
      data: {
        zoneId: zone.id,
        weightGrams: weight.totalGrams,
        baseFeeKobo: delivery.baseFeeKobo,
        incrementalFeeKobo: delivery.incrementalFeeKobo,
        discountKobo: 0,
        totalFeeKobo: delivery.totalFeeKobo,
        freeDeliveryApplied: delivery.freeDeliveryApplied,
        weightEstimated: delivery.weightEstimated,
        ruleVersion: delivery.ruleVersion,
        breakdownJson: delivery,
      },
    });

    const created = await tx.order.create({
      data: {
        orderNumber,
        trackingTokenHash,
        userId: input.userId ?? null,
        guestEmail: input.address.email.toLowerCase(),
        guestPhone: input.address.phone,
        customerName: input.address.fullName,
        status: "PENDING_PAYMENT",
        channel,
        subtotalKobo: priced.subtotalKobo,
        discountKobo,
        deliveryFeeKobo: delivery.totalFeeKobo,
        totalWeightGrams: weight.totalGrams,
        totalKobo,
        weightEstimated: weight.estimated,
        couponCode,
        deliveryZoneId: zone.id,
        deliveryQuoteId: quote.id,
        shippingFullName: input.address.fullName,
        shippingPhone: input.address.phone,
        shippingStreet: input.address.street,
        shippingLandmark: input.address.landmark,
        shippingCity: input.address.city,
        shippingState: input.address.state,
        deliveryNotes: input.address.deliveryNotes,
        items: {
          create: priced.lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            productName: line.productName,
            productSlug: line.productSlug,
            sku: line.sku,
            variantName: line.variantName,
            condition: line.condition,
            unitPriceKobo: line.unitPriceKobo,
            quantity: line.quantity,
            weightGrams: line.weightGrams || defaultWeight,
            lineTotalKobo: line.lineTotalKobo,
            imageUrl: line.imageUrl,
            snapshotJson: line.snapshotJson,
          })),
        },
        statusHistory: {
          create: {
            toStatus: "PENDING_PAYMENT",
            note:
              paymentMethod === "whatsapp"
                ? "Order placed via WhatsApp — awaiting payment confirmation"
                : "Order created, awaiting payment",
            isCustomerVisible: true,
          },
        },
      },
    });

    await reserveStock(
      tx,
      priced.lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
      created.id,
      expiresAt,
    );

    if (couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { redemptionCount: { increment: 1 } },
        });
        await tx.couponRedemption.create({
          data: {
            couponId: coupon.id,
            orderId: created.id,
            userId: input.userId ?? null,
            email: input.address.email.toLowerCase(),
            amountKobo: discountKobo,
          },
        });
      }
    }

    return created;
  });

  let authorizationUrl: string | null = null;
  let paymentReferenceOut = paymentReference;
  let whatsappUrl: string | null = null;

  if (paymentMethod === "whatsapp") {
    const waDigits = normalizeWhatsAppDigits(settings!.whatsappNumber!);
    const message = buildWhatsAppOrderMessage({
      orderNumber: order.orderNumber,
      customerName: input.address.fullName,
      totalFormatted: formatNgn(totalKobo),
      phone: input.address.phone,
      trackingUrl,
    });
    whatsappUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
    authorizationUrl = whatsappUrl;

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "whatsapp",
        reference: paymentReference,
        authorizationUrl: whatsappUrl,
        amountKobo: totalKobo,
        currency: "NGN",
        status: "PENDING",
        metadataJson: {
          channel: "whatsapp",
          whatsappUrl,
          cartId: input.cartId ?? null,
        },
      },
    });
  } else {
    let init;
    try {
      const provider = getPaymentProvider();
      init = await provider.initialize({
        email: input.address.email,
        amountKobo: totalKobo,
        reference: paymentReference,
        callbackUrl: absoluteUrl(`/api/payments/verify?reference=${paymentReference}`),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          cartId: input.cartId ?? null,
        },
      });
    } catch (error) {
      await prisma.$transaction(async (tx) => {
        const { releaseReservationsForOrder } = await import("@/lib/inventory/reservations");
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
            note: "Payment provider configuration error — order cancelled",
            isCustomerVisible: false,
          },
        });
      });
      throw error;
    }

    paymentReferenceOut = init.reference;
    authorizationUrl = init.authorizationUrl;

    const rawMeta =
      init.raw && typeof init.raw === "object" ? (init.raw as Record<string, unknown>) : {};
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: init.provider,
        reference: init.reference,
        accessCode: init.accessCode,
        authorizationUrl: init.authorizationUrl,
        amountKobo: totalKobo,
        currency: "NGN",
        status: "PENDING",
        metadataJson: {
          ...rawMeta,
          cartId: input.cartId ?? null,
        },
      },
    });
  }

  await sendEmail({
    to: input.address.email,
    subject: `Order ${order.orderNumber} received — Wunmzy Co`,
    template: "order_created",
    html: orderConfirmationHtml({
      customerName: input.address.fullName,
      orderNumber: order.orderNumber,
      totalFormatted: formatNgn(totalKobo),
      trackingUrl,
    }),
    metadata: { orderId: order.id },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    trackingToken,
    authorizationUrl,
    whatsappUrl,
    paymentReference: paymentReferenceOut,
    totalKobo,
    channel,
  };
}
