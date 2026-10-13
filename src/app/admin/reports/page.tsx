import { requirePermission } from "@/lib/admin/auth";
import { getDashboardMetrics } from "@/lib/admin/metrics";
import { formatNgn } from "@/lib/currency";
import { hasPermission } from "@/lib/permissions";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  ButtonLink,
  PageHeader,
  StatCard,
} from "@/components/admin/ui";

export default async function AdminReportsPage() {
  const user = await requirePermission("reports:read");
  const canExport = hasPermission(user.role, "reports:export");
  const metrics = await getDashboardMetrics();

  return (
    <>
      <PageHeader
        title="Reports"
        description="Snapshot metrics and CSV exports for finance and ops."
        actions={
          canExport ? (
            <>
              <ButtonLink href="/admin/reports/export/orders" variant="secondary">
                Export orders CSV
              </ButtonLink>
              <ButtonLink href="/admin/inventory/export" variant="secondary">
                Export inventory CSV
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Gross paid sales" value={formatNgn(metrics.grossPaidSalesKobo)} />
        <StatCard label="Orders (month)" value={String(metrics.ordersMonth)} />
        <StatCard label="Paid orders (AOV base)" value={String(metrics.paidOrderCount)} />
      </div>

      <AdminCard className="mt-6">
        <AdminCardHeader title="Export notes" />
        <AdminCardBody className="text-sm text-[#5c5a54]">
          <p>
            Order exports include line-level totals in NGN. Refund amounts are not duplicated on
            order rows — use payment/refund records for reconciliation.
          </p>
          {!canExport ? (
            <p className="mt-2 text-[#6b4f1d]">Your role cannot download CSV exports.</p>
          ) : null}
        </AdminCardBody>
      </AdminCard>
    </>
  );
}
