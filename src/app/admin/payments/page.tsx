import Link from "next/link";
import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { formatPaymentStatus } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/currency";
import {
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminPaymentsPage() {
  await requirePermission("payments:read");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { order: { select: { id: true, orderNumber: true } } },
  });

  return (
    <>
      <PageHeader title="Payments" description="Paystack and provider payment records." />

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Reference</Th>
              <Th>Order</Th>
              <Th>Provider</Th>
              <Th>Status</Th>
              <Th>Amount</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <Td className="font-mono text-xs">{p.reference}</Td>
                <Td>
                  <Link href={`/admin/orders/${p.order.id}`} className="hover:underline">
                    {p.order.orderNumber}
                  </Link>
                </Td>
                <Td>{p.provider}</Td>
                <Td>
                  <Badge tone="neutral">{formatPaymentStatus(p.status)}</Badge>
                </Td>
                <Td className="tabular-nums">{formatNgn(p.amountKobo)}</Td>
                <Td className="text-[#5c5a54]">{format(p.createdAt, "d MMM yyyy")}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
