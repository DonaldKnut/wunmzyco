import { NextResponse } from "next/server";
import { format } from "date-fns";
import { toCsv } from "@/lib/admin/csv";
import { getStaffUser } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { koboToNaira } from "@/lib/currency";

export async function GET() {
  const user = await getStaffUser();
  if (!user || !hasPermission(user.role, "reports:export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      orderNumber: true,
      status: true,
      customerName: true,
      guestEmail: true,
      subtotalKobo: true,
      discountKobo: true,
      deliveryFeeKobo: true,
      totalKobo: true,
      paidAt: true,
      createdAt: true,
    },
  });

  const csv = toCsv(
    [
      "order_number",
      "status",
      "customer",
      "email",
      "subtotal_ngn",
      "discount_ngn",
      "delivery_ngn",
      "total_ngn",
      "paid_at",
      "created_at",
    ],
    orders.map((o) => [
      o.orderNumber,
      o.status,
      o.customerName,
      o.guestEmail,
      koboToNaira(o.subtotalKobo),
      koboToNaira(o.discountKobo),
      koboToNaira(o.deliveryFeeKobo),
      koboToNaira(o.totalKobo),
      o.paidAt ? format(o.paidAt, "yyyy-MM-dd HH:mm:ss") : "",
      format(o.createdAt, "yyyy-MM-dd HH:mm:ss"),
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wunmzy-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
