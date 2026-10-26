import Link from "next/link";
import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { getDashboardMetrics } from "@/lib/admin/metrics";
import { formatOrderChannel, formatOrderStatus, formatPaymentStatus } from "@/lib/admin/labels";
import { formatNgn } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  AlertBanner,
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  StatCard,
  Td,
  Th,
} from "@/components/admin/ui";
import { Plus, ShoppingBag, PanelsTopLeft, Settings, MessageCircle, ArrowUpRight } from "lucide-react";

export default async function AdminOverviewPage({
  searchParams,
}: PageProps<"/admin">) {
  const user = await requirePermission("dashboard:view");
  const params = await searchParams;
  const canWriteProducts = hasPermission(user.role, "products:write");

  const [metrics, categories] = await Promise.all([
    getDashboardMetrics(),
    canWriteProducts
      ? prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const orderStatuses = Object.entries(metrics.orderStatusCounts) as [string, number][];
  const paymentStatuses = Object.entries(metrics.paymentStatusCounts) as [string, number][];

  // Calculate total orders and payments for visual progress bars
  const totalOrders = orderStatuses.reduce((acc, [, count]) => acc + count, 0);
  const totalPayments = paymentStatuses.reduce((acc, [, count]) => acc + count, 0);

  return (
    <>
      {params.error === "forbidden" ? (
        <AlertBanner variant="error">
          You do not have permission to view that section.
        </AlertBanner>
      ) : null}

      {metrics.pendingWhatsAppOrders > 0 ? (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Action Required
              </p>
              <p className="text-sm font-semibold">
                {metrics.pendingWhatsAppOrders} WhatsApp order
                {metrics.pendingWhatsAppOrders === 1 ? "" : "s"} awaiting payment review
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-950"
          >
            Review Orders <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}

      {/* Header and Quick Action Strip */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader
          icon="dashboard"
          title="Executive Overview"
          description="Live store revenue, sales performance, and operations intelligence."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {canWriteProducts ? (
                <ProductFormModal
                  categories={categories}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a18] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fbf9f5] shadow-xs transition hover:bg-[#2f2e2a]"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span>Add Product</span>
                    </button>
                  }
                />
              ) : (
                <Link
                  href="/admin/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a18] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fbf9f5] shadow-xs transition hover:bg-[#2f2e2a]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Add Product</span>
                </Link>
              )}
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d8d3c8] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a18] transition hover:bg-[#f5efe6]"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-[#6b6459]" />
                <span>Orders</span>
              </Link>
              <Link
                href="/admin/homepage"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d8d3c8] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a18] transition hover:bg-[#f5efe6]"
              >
                <PanelsTopLeft className="h-3.5 w-3.5 text-[#6b6459]" />
                <span>Hero</span>
              </Link>
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d8d3c8] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a18] transition hover:bg-[#f5efe6]"
              >
                <Settings className="h-3.5 w-3.5 text-[#6b6459]" />
                <span>Settings</span>
              </Link>
            </div>
          }
        />
      </div>

      {/* Key Metric Stat Cards */}
      <div data-tour="metrics" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gross Paid Sales (Net of Refunds)"
          value={formatNgn(metrics.grossPaidSalesKobo)}
          hint={`Order Gross ${formatNgn(metrics.grossOrderKobo)} − Refunds ${formatNgn(metrics.completedRefundsKobo)}`}
          trend="Live DB"
        />
        <StatCard
          label="Average Order Value"
          value={formatNgn(metrics.aovKobo)}
          hint="Per paid order across all channels"
        />
        <StatCard
          label="Orders Today"
          value={String(metrics.ordersToday)}
          hint="Orders recorded since midnight"
          trend="Today"
        />
        <StatCard
          label="Orders Week / Month"
          value={`${metrics.ordersWeek} / ${metrics.ordersMonth}`}
          hint="Rolling 7-day and 30-day velocity"
        />
      </div>

      {/* Status Breakdown Section with Visual Meters */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader
            title="Orders by Workflow Status"
            description="Active fulfillment pipeline from placement to delivery"
          />
          <AdminCardBody>
            {orderStatuses.length === 0 ? (
              <EmptyState title="No orders in pipeline yet" />
            ) : (
              <ul className="space-y-3.5">
                {orderStatuses.map(([status, count]) => {
                  const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                  return (
                    <li key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#1a1a18]">{formatOrderStatus(status as never)}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums text-[#1a1a18]">{count}</span>
                          <span className="text-[11px] text-[#7a776f]">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f4efe7]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#b38e5d] to-[#d4af37] transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader
            title="Payments by Status"
            description="Reconciliation across Paystack and offline WhatsApp channels"
          />
          <AdminCardBody>
            {paymentStatuses.length === 0 ? (
              <EmptyState title="No payment transactions yet" />
            ) : (
              <ul className="space-y-3.5">
                {paymentStatuses.map(([status, count]) => {
                  const pct = totalPayments > 0 ? Math.round((count / totalPayments) * 100) : 0;
                  return (
                    <li key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#1a1a18]">{formatPaymentStatus(status as never)}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums text-[#1a1a18]">{count}</span>
                          <span className="text-[11px] text-[#7a776f]">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f4efe7]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Product Intelligence: Best Sellers & Low Stock */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader
            title="Best Performing Pieces"
            description="Ranked by cumulative volume sold"
          />
          <AdminCardBody>
            {metrics.bestSellers.length === 0 ? (
              <EmptyState title="No product sales records yet" />
            ) : (
              <ul className="divide-y divide-[#f2ede4] text-xs">
                {metrics.bestSellers.map((row) => (
                  <li key={row.productId} className="flex items-center justify-between py-3">
                    <div className="min-w-0 pr-4">
                      <p className="truncate font-semibold text-[#1a1a18]">{row.name}</p>
                      <p className="font-mono text-[11px] text-[#7a776f]">{row.sku}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 tabular-nums">
                      {row.quantity} sold
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader
            title="Stock Replenishment Alerts"
            description="Inventory at or below defined low-stock thresholds"
            action={
              <Link href="/admin/inventory" className="text-xs font-semibold text-[#b38e5d] hover:underline">
                Manage Inventory →
              </Link>
            }
          />
          <AdminCardBody>
            {metrics.lowStock.length === 0 ? (
              <EmptyState title="All inventory healthy" description="No pieces currently below their threshold." />
            ) : (
              <ul className="divide-y divide-[#f2ede4] text-xs">
                {metrics.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <Link
                      href="/admin/products"
                      className="truncate font-semibold text-[#1a1a18] hover:text-[#b38e5d] hover:underline"
                    >
                      {p.name}
                    </Link>
                    <Badge tone={p.stock === 0 ? "danger" : "warning"}>
                      {p.stock === 0 ? "Sold Out (0)" : `${p.stock} left (warn at ${p.lowStockAt})`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Recent Orders Executive Table */}
      <div className="mt-8">
        <AdminCard>
          <AdminCardHeader
            title="Recent Orders"
            description="Live feed of incoming customer orders across channels"
            action={
              <Link href="/admin/orders" className="text-xs font-semibold text-[#b38e5d] hover:underline">
                View all orders →
              </Link>
            }
          />
          <AdminCardBody className="p-0">
            {metrics.recentOrders.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No orders recorded yet" />
              </div>
            ) : (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Order ID</Th>
                    <Th>Customer</Th>
                    <Th>Channel</Th>
                    <Th>Status</Th>
                    <Th>Total</Th>
                    <Th>Date & Time</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3efe8]">
                  {metrics.recentOrders.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-[#faf8f5]">
                      <Td>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono font-semibold text-[#1a1a18] hover:text-[#b38e5d] hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </Td>
                      <Td className="font-medium text-[#1a1a18]">{o.customerName}</Td>
                      <Td>
                        <Badge tone={o.channel === "WHATSAPP" ? "success" : "neutral"}>
                          {formatOrderChannel(o.channel)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          tone={
                            o.status === "DELIVERED"
                              ? "success"
                              : o.status === "PENDING_PAYMENT"
                                ? "warning"
                                : o.status === "CANCELLED"
                                  ? "danger"
                                  : "info"
                          }
                        >
                          {formatOrderStatus(o.status)}
                        </Badge>
                      </Td>
                      <Td className="font-semibold tabular-nums text-[#1a1a18]">
                        {formatNgn(o.totalKobo)}
                      </Td>
                      <Td className="text-xs text-[#6b6459]">
                        {format(o.createdAt, "d MMM yyyy, HH:mm")}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>
    </>
  );
}
