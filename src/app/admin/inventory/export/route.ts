import { NextResponse } from "next/server";
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

  const products = await prisma.product.findMany({
    orderBy: { sku: "asc" },
    select: {
      sku: true,
      name: true,
      status: true,
      stock: true,
      lowStockAt: true,
      priceKobo: true,
    },
  });

  const csv = toCsv(
    ["sku", "name", "status", "stock", "low_stock_at", "price_ngn"],
    products.map((p) => [
      p.sku,
      p.name,
      p.status,
      p.stock,
      p.lowStockAt,
      koboToNaira(p.priceKobo),
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wunmzy-inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
