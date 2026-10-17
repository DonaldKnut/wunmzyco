import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { formatProductStatus } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/currency";
import { hasPermission } from "@/lib/permissions";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { ProductStatusButton } from "@/components/admin/product-status-button";
import {
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminProductsPage() {
  const user = await requirePermission("products:read");
  const canWrite = hasPermission(user.role, "products:write");

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: { categories: { select: { categoryId: true } } },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        icon="packages"
        title="Products"
        description="Add, edit, publish, archive, or permanently remove catalogue items."
        actions={canWrite ? <ProductFormModal categories={categories} /> : undefined}
      />

      {products.length === 0 ? (
        <EmptyState
          icon="packages"
          title="No products yet"
          description="Create your first product to start selling. Publish it (and optionally feature it) to show on the homepage."
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
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <Td className="font-medium">
                  {p.name}
                  {p.isFeatured ? (
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-[#6b4f1d]">
                      Featured
                    </span>
                  ) : null}
                </Td>
                <Td className="text-[#5c5a54]">{p.sku}</Td>
                <Td>
                  <Badge
                    tone={
                      p.status === "PUBLISHED"
                        ? "success"
                        : p.status === "ARCHIVED"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {formatProductStatus(p.status)}
                  </Badge>
                </Td>
                <Td className="tabular-nums">{formatNgn(p.salePriceKobo ?? p.priceKobo)}</Td>
                <Td className="tabular-nums">{p.stock}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1">
                    {canWrite ? (
                      <>
                        <ProductFormModal
                          mode="edit"
                          categories={categories}
                          product={p}
                        />
                        {p.status !== "PUBLISHED" ? (
                          <ProductStatusButton productId={p.id} status="PUBLISHED" />
                        ) : null}
                        {p.status !== "ARCHIVED" ? (
                          <ProductStatusButton productId={p.id} status="ARCHIVED" />
                        ) : null}
                        <DeleteProductButton productId={p.id} productName={p.name} />
                      </>
                    ) : (
                      <Link
                        href={`/products/${p.slug}`}
                        className="text-xs text-[#5c5a54] underline-offset-2 hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
