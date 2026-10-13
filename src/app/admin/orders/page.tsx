import Link from "next/link";
import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { formatOrderStatus } from "@/lib/admin/labels";
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

export default async function AdminOrdersPage() {
  await requirePermission("orders:read");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      guestEmail: true,
      status: true,
      totalKobo: true,
      createdAt: true,
    },
  });

  return (
    <>
      <PageHeader title="Orders" description="Fulfillment queue and order history." />

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Placed</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    {o.orderNumber}
                  </Link>
                </Td>
                <Td>{o.customerName}</Td>
                <Td className="text-[#5c5a54]">{o.guestEmail}</Td>
                <Td>
                  <Badge tone="neutral">{formatOrderStatus(o.status)}</Badge>
                </Td>
                <Td className="tabular-nums">{formatNgn(o.totalKobo)}</Td>
                <Td className="text-[#5c5a54]">{format(o.createdAt, "d MMM yyyy")}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
