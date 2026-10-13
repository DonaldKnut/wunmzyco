import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { DeliveryStatus, OrderStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin/auth";
import {
  formatDeliveryStatus,
  formatOrderStatus,
} from "@/lib/admin/labels";
import { canTransitionDelivery, canTransitionOrder } from "@/lib/orders/transitions";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/currency";
import { hasPermission } from "@/lib/permissions";
import {
  addOrderSupportNote,
  transitionDeliveryStatus,
  transitionOrderStatus,
} from "@/server/actions/orders";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  Badge,
  Button,
  DataTable,
  Field,
  PageHeader,
  Select,
  Td,
  Textarea,
  Th,
} from "@/components/admin/ui";

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const user = await requirePermission("orders:read");
  const canWrite = hasPermission(user.role, "orders:write");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      deliveryZone: true,
      payment: true,
      statusHistory: { orderBy: { createdAt: "desc" }, take: 20 },
      supportNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!order) notFound();

  const orderTargets = (["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"] as OrderStatus[]).filter(
    (s) => s !== order.status && canTransitionOrder(order.status, s),
  );
  const deliveryTargets = (["PREPARING", "READY_FOR_DISPATCH", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED"] as DeliveryStatus[]).filter(
    (s) => s !== order.deliveryStatus && canTransitionDelivery(order.deliveryStatus, s),
  );

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        description={`${order.customerName} · ${order.guestEmail}`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone="info">{formatOrderStatus(order.status)}</Badge>
        <Badge tone="neutral">{formatDeliveryStatus(order.deliveryStatus)}</Badge>
        <span className="text-sm text-[#5c5a54]">
          Total {formatNgn(order.totalKobo)} · Placed{" "}
          {format(order.createdAt, "d MMM yyyy, HH:mm")}
        </span>
      </div>

      {canWrite ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <AdminCard>
            <AdminCardHeader title="Order status" />
            <AdminCardBody>
              {orderTargets.length === 0 ? (
                <p className="text-sm text-[#5c5a54]">No transitions available.</p>
              ) : (
                <form
                  action={async (fd) => {
                    "use server";
                    const to = fd.get("toStatus") as OrderStatus;
                    const note = String(fd.get("note") ?? "");
                    await transitionOrderStatus(id, to, note);
                  }}
                  className="space-y-3"
                >
                  <Field label="New status">
                    <Select name="toStatus" required defaultValue={orderTargets[0]}>
                      {orderTargets.map((s) => (
                        <option key={s} value={s}>
                          {formatOrderStatus(s)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Note (optional)">
                    <Textarea name="note" rows={2} />
                  </Field>
                  <Button type="submit" size="sm">
                    Update order status
                  </Button>
                </form>
              )}
            </AdminCardBody>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader title="Delivery status" />
            <AdminCardBody>
              {deliveryTargets.length === 0 ? (
                <p className="text-sm text-[#5c5a54]">No delivery transitions available.</p>
              ) : (
                <form
                  action={async (fd) => {
                    "use server";
                    const to = fd.get("toDeliveryStatus") as DeliveryStatus;
                    const note = String(fd.get("note") ?? "");
                    await transitionDeliveryStatus(id, to, note);
                  }}
                  className="space-y-3"
                >
                  <Field label="New delivery status">
                    <Select name="toDeliveryStatus" required defaultValue={deliveryTargets[0]}>
                      {deliveryTargets.map((s) => (
                        <option key={s} value={s}>
                          {formatDeliveryStatus(s)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Note (optional)">
                    <Textarea name="note" rows={2} />
                  </Field>
                  <Button type="submit" size="sm">
                    Update delivery
                  </Button>
                </form>
              )}
            </AdminCardBody>
          </AdminCard>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard>
            <AdminCardHeader title="Line items" />
            <AdminCardBody className="p-0">
              <DataTable>
                <thead>
                  <tr>
                    <Th>Item</Th>
                    <Th>SKU</Th>
                    <Th>Qty</Th>
                    <Th>Line total</Th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <Td>{item.productName}</Td>
                      <Td>{item.sku}</Td>
                      <Td>{item.quantity}</Td>
                      <Td className="tabular-nums">{formatNgn(item.lineTotalKobo)}</Td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </AdminCardBody>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader title="Status history" />
            <AdminCardBody className="space-y-3 text-sm">
              {order.statusHistory.length === 0 ? (
                <p className="text-[#5c5a54]">No history yet.</p>
              ) : (
                order.statusHistory.map((h) => (
                  <div key={h.id} className="border-b border-[#f3efe8] pb-2 last:border-0">
                    <p className="font-medium">
                      {h.fromStatus ? formatOrderStatus(h.fromStatus) : "—"} →{" "}
                      {formatOrderStatus(h.toStatus)}
                    </p>
                    {h.note ? <p className="text-[#5c5a54]">{h.note}</p> : null}
                    <p className="text-xs text-[#7a776f]">
                      {format(h.createdAt, "d MMM yyyy, HH:mm")}
                    </p>
                  </div>
                ))
              )}
            </AdminCardBody>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <AdminCardHeader title="Shipping" />
            <AdminCardBody className="space-y-1 text-sm">
              <p>{order.shippingFullName}</p>
              <p>{order.shippingStreet}</p>
              <p>
                {order.shippingCity}, {order.shippingState}
              </p>
              <p className="text-[#5c5a54]">{order.shippingPhone}</p>
              <p className="pt-2 text-[#7a776f]">Zone: {order.deliveryZone.name}</p>
            </AdminCardBody>
          </AdminCard>

          {order.payment ? (
            <AdminCard>
              <AdminCardHeader title="Payment" />
              <AdminCardBody className="text-sm">
                <p>{order.payment.provider}</p>
                <p className="text-[#5c5a54]">{order.payment.reference}</p>
                <p className="font-medium tabular-nums">{formatNgn(order.payment.amountKobo)}</p>
                <Badge tone="neutral">{order.payment.status}</Badge>
              </AdminCardBody>
            </AdminCard>
          ) : null}

          <AdminCard>
            <AdminCardHeader title="Support notes" description="Internal only" />
            <AdminCardBody className="space-y-3">
              {canWrite ? (
                <form
                  action={async (fd) => {
                    "use server";
                    await addOrderSupportNote(id, String(fd.get("note") ?? ""));
                  }}
                  className="space-y-2"
                >
                  <Textarea name="note" placeholder="Add internal note…" required />
                  <Button type="submit" size="sm">
                    Add note
                  </Button>
                </form>
              ) : null}
              <div className="space-y-2 text-sm">
                {order.supportNotes.length === 0 ? (
                  <p className="text-[#5c5a54]">No notes yet.</p>
                ) : (
                  order.supportNotes.map((n) => (
                    <div key={n.id} className="rounded-md bg-[#faf8f5] p-2">
                      <p>{n.note}</p>
                      <p className="mt-1 text-xs text-[#7a776f]">
                        {n.author.name} · {format(n.createdAt, "d MMM HH:mm")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </AdminCardBody>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
