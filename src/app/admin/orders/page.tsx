import Link from "next/link";
import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { formatOrderChannel, formatOrderStatus } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/currency";
import {
  AlertBanner,
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminOrdersPage() {
  await requirePermission("orders:read");

  const [orders, pendingWhatsApp] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        guestEmail: true,
        status: true,
        channel: true,
        totalKobo: true,
        createdAt: true,
      },
    }),
    prisma.order.count({
      where: { channel: "WHATSAPP", status: "PENDING_PAYMENT" },
    }),
  ]);

  return (
    <>
      <PageHeader icon="orders" title="Orders" description="Fulfillment queue and order history." />

      {pendingWhatsApp > 0 ? (
        <AlertBanner variant="warning">
          {pendingWhatsApp} WhatsApp order{pendingWhatsApp === 1 ? "" : "s"} awaiting payment
          confirmation — open each order and mark paid once you receive payment.
        </AlertBanner>
      ) : null}

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Channel</Th>
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
                <Td>
                  <div>{o.customerName}</div>
                  <div className="text-xs text-[#5c5a54]">{o.guestEmail}</div>
                </Td>
                <Td>
                  <Badge tone={o.channel === "WHATSAPP" ? "info" : "neutral"}>
                    {formatOrderChannel(o.channel)}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    tone={
                      o.status === "PENDING_PAYMENT" && o.channel === "WHATSAPP"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {formatOrderStatus(o.status)}
                  </Badge>
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
