import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { startOfDay, startOfMonth, startOfWeek } from "@/lib/admin/dates";

/** Orders counted toward gross order totals before refund adjustments. */
export const REVENUE_ORDER_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

export async function getDashboardMetrics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [
    orderTotalsAgg,
    refundsAgg,
    ordersToday,
    ordersWeek,
    ordersMonth,
    orderStatusGroups,
    paymentStatusGroups,
    paidOrderCount,
    recentOrders,
    bestSellerRows,
    lowStockCandidates,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: REVENUE_ORDER_STATUSES } },
      _sum: { totalKobo: true },
    }),
    prisma.refund.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amountKobo: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.count({
      where: {
        status: {
          in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "PARTIALLY_REFUNDED"],
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        totalKobo: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockAt: true,
      },
      orderBy: { stock: "asc" },
      take: 100,
    }),
  ]);

  const lowStockFiltered = lowStockCandidates
    .filter((p) => p.stock <= p.lowStockAt)
    .slice(0, 8);

  const grossOrderKobo = orderTotalsAgg._sum.totalKobo ?? 0;
  const completedRefundsKobo = refundsAgg._sum.amountKobo ?? 0;
  const grossPaidSalesKobo = Math.max(0, grossOrderKobo - completedRefundsKobo);

  const aovKobo =
    paidOrderCount > 0 ? Math.round(grossPaidSalesKobo / paidOrderCount) : 0;

  const productIds = bestSellerRows
    .map((r) => r.productId)
    .filter((id): id is string => id != null);
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, sku: true },
        })
      : [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  const bestSellers = bestSellerRows
    .filter((r) => r.productId)
    .map((r) => ({
      productId: r.productId!,
      quantity: r._sum.quantity ?? 0,
      name: productMap.get(r.productId!)?.name ?? "Unknown product",
      sku: productMap.get(r.productId!)?.sku ?? "—",
    }));

  const orderStatusCounts = Object.fromEntries(
    orderStatusGroups.map((g) => [g.status, g._count._all]),
  ) as Partial<Record<OrderStatus, number>>;

  const paymentStatusCounts = Object.fromEntries(
    paymentStatusGroups.map((g) => [g.status, g._count._all]),
  ) as Partial<Record<PaymentStatus, number>>;

  return {
    grossPaidSalesKobo,
    grossOrderKobo,
    completedRefundsKobo,
    ordersToday,
    ordersWeek,
    ordersMonth,
    orderStatusCounts,
    paymentStatusCounts,
    paidOrderCount,
    aovKobo,
    bestSellers,
    lowStock: lowStockFiltered,
    recentOrders,
  };
}
