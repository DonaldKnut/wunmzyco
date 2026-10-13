import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { formatProductStatus } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/currency";
import { hasPermission } from "@/lib/permissions";
import { setProductStatus } from "@/server/actions/products";
import {
  Badge,
  ButtonLink,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminProductsPage() {
  const user = await requirePermission("products:read");
  const canWrite = hasPermission(user.role, "products:write");

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { categories: { include: { category: true } } },
  });

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage catalog items, pricing, and publish state."
        actions={
          canWrite ? (
            <ButtonLink href="/admin/products/new">New product</ButtonLink>
          ) : undefined
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to start selling."
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>SKU</Th>
              <Th>Status</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <Td>
                  <Link href={`/admin/products/${p.id}/edit`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                </Td>
                <Td className="text-[#5c5a54]">{p.sku}</Td>
                <Td>
                  <Badge tone={p.status === "PUBLISHED" ? "success" : "neutral"}>
                    {formatProductStatus(p.status)}
                  </Badge>
                </Td>
                <Td className="tabular-nums">{formatNgn(p.salePriceKobo ?? p.priceKobo)}</Td>
                <Td className="tabular-nums">{p.stock}</Td>
                <Td>
                  {canWrite ? (
                    <div className="flex flex-wrap gap-1">
                      {p.status !== "PUBLISHED" ? (
                        <form
                          action={async () => {
                            "use server";
                            await setProductStatus(p.id, "PUBLISHED");
                          }}
                        >
                          <button type="submit" className="text-xs text-[#2d4a2d] hover:underline">
                            Publish
                          </button>
                        </form>
                      ) : null}
                      {p.status !== "ARCHIVED" ? (
                        <form
                          action={async () => {
                            "use server";
                            await setProductStatus(p.id, "ARCHIVED");
                          }}
                        >
                          <button type="submit" className="text-xs text-[#6f2424] hover:underline">
                            Archive
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
