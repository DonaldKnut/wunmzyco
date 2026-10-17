import Link from "next/link";
import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { getDashboardMetrics } from "@/lib/admin/metrics";
import { formatOrderStatus, formatPaymentStatus } from "@/lib/admin/labels";
import { formatNgn } from "@/lib/currency";
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

export default async function AdminOverviewPage({
  searchParams,
}: PageProps<"/admin">) {
  await requirePermission("dashboard:view");
  const params = await searchParams;
  const metrics = await getDashboardMetrics();

  const orderStatuses = Object.entries(metrics.orderStatusCounts) as [string, number][];
  const paymentStatuses = Object.entries(metrics.paymentStatusCounts) as [string, number][];

  return (
    <>
      {params.error === "forbidden" ? (
        <AlertBanner variant="error">
          You do not have permission to view that section.
        </AlertBanner>
      ) : null}

      <PageHeader
        icon="dashboard"
        title="Overview"
        description="Live store metrics from your database. All figures tolerate an empty catalog and zero orders."
      />

      <div className="mb-4 rounded-md border border-[#e8e4dc] bg-[#f5f2ec] px-4 py-3 text-sm text-[#3d3b36]">
        <strong className="font-medium text-[#1a1a18]">Refund treatment:</strong>{" "}
        Gross paid sales sums order totals for paid-through-refunded statuses, then
        subtracts <em>completed</em> refund amounts. Partial refunds reduce net
        revenue accordingly; orders still in a refund workflow are not adjusted until
        the refund completes.
      </div>

      <div data-tour="metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gross paid sales (net of refunds)"
          value={formatNgn(metrics.grossPaidSalesKobo)}
          hint={`Order gross ${formatNgn(metrics.grossOrderKobo)} − refunds ${formatNgn(metrics.completedRefundsKobo)}`}
        />
        <StatCard label="Average order value" value={formatNgn(metrics.aovKobo)} />
        <StatCard label="Orders today" value={String(metrics.ordersToday)} />
        <StatCard
          label="Orders this week / month"
          value={`${metrics.ordersWeek} / ${metrics.ordersMonth}`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader title="Orders by status" />
          <AdminCardBody>
            {orderStatuses.length === 0 ? (
              <EmptyState title="No orders yet" />
            ) : (
              <ul className="space-y-2 text-sm">
                {orderStatuses.map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span>{formatOrderStatus(status as never)}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Payments by status" />
          <AdminCardBody>
            {paymentStatuses.length === 0 ? (
              <EmptyState title="No payments yet" />
            ) : (
              <ul className="space-y-2 text-sm">
                {paymentStatuses.map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span>{formatPaymentStatus(status as never)}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader title="Best sellers" description="By units sold (all time)" />
          <AdminCardBody>
            {metrics.bestSellers.length === 0 ? (
              <EmptyState title="No sales data yet" />
            ) : (
              <ul className="space-y-2 text-sm">
                {metrics.bestSellers.map((row) => (
                  <li key={row.productId} className="flex justify-between gap-2">
                    <span className="truncate">
                      {row.name}{" "}
                      <span className="text-[#7a776f]">({row.sku})</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
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
            title="Low stock"
            action={
              <Link href="/admin/inventory" className="text-xs font-medium underline">
                Inventory
              </Link>
            }
          />
          <AdminCardBody>
            {metrics.lowStock.length === 0 ? (
              <EmptyState title="No low-stock alerts" description="Threshold is per-product low stock level." />
            ) : (
              <ul className="space-y-2 text-sm">
                {metrics.lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <Link
                      href="/admin/products"
                      className="truncate hover:underline"
                    >
                      {p.name}
                    </Link>
                    <Badge tone={p.stock === 0 ? "danger" : "warning"}>
                      {p.stock} / warn {p.lowStockAt}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>

      <div className="mt-6">
        <AdminCard>
          <AdminCardHeader
            title="Recent orders"
            action={
              <Link href="/admin/orders" className="text-xs font-medium underline">
                View all
              </Link>
            }
          />
          <AdminCardBody className="p-0">
            {metrics.recentOrders.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No orders yet" />
              </div>
            ) : (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Status</Th>
                    <Th>Total</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#faf8f5]/80">
                      <Td>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </Td>
                      <Td>{o.customerName}</Td>
                      <Td>
                        <Badge tone="neutral">{formatOrderStatus(o.status)}</Badge>
                      </Td>
                      <Td className="tabular-nums">{formatNgn(o.totalKobo)}</Td>
                      <Td className="text-[#5c5a54]">
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
