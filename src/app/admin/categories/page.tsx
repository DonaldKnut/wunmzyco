import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { repairCategorySlugs } from "@/server/actions/catalog";
import { CategoryActiveToggle } from "@/components/admin/category-active-toggle";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import {
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminCategoriesPage() {
  const user = await requirePermission("products:read");
  const canWrite = hasPermission(user.role, "products:write");

  // Repair empty slugs that blocked further category creates (unique "" collision).
  if (canWrite) {
    await repairCategorySlugs();
  }

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: true } },
        products: { select: { productId: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      take: 500,
      select: { id: true, name: true, sku: true, status: true, stock: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        icon="tags"
        title="Categories"
        description="Create categories, keep them visible on the shop, and assign products from here."
        actions={
          canWrite ? <CategoryFormModal products={products} mode="create" /> : undefined
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add your first category, then assign products to it."
          icon="tags"
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th>Order</Th>
              <Th>Status</Th>
              {canWrite ? <Th>Actions</Th> : null}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">
                  <div className="flex flex-col gap-0.5">
                    <span>{c.name}</span>
                    {c.description ? (
                      <span className="line-clamp-1 text-[11px] font-normal text-[#7a776f]">
                        {c.description}
                      </span>
                    ) : null}
                  </div>
                </Td>
                <Td className="text-[#5c5a54]">
                  {c.slug ? (
                    <Link
                      href={`/categories/${c.slug}`}
                      className="underline-offset-2 hover:underline"
                      target="_blank"
                    >
                      /{c.slug}
                    </Link>
                  ) : (
                    <span className="text-[#b38e5d]">needs slug</span>
                  )}
                </Td>
                <Td>
                  <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-[#eee9e0] px-2.5 py-0.5 text-xs font-semibold text-[#3d3b36]">
                    {c._count.products}
                  </span>
                </Td>
                <Td>{c.sortOrder}</Td>
                <Td>
                  {canWrite ? (
                    <CategoryActiveToggle categoryId={c.id} isActive={c.isActive} />
                  ) : (
                    <span className="text-xs text-[#5c5a54]">
                      {c.isActive ? "Active" : "Hidden"}
                    </span>
                  )}
                </Td>
                {canWrite ? (
                  <Td>
                    <CategoryFormModal
                      mode="edit"
                      category={c}
                      products={products}
                      selectedProductIds={c.products.map((p) => p.productId)}
                    />
                  </Td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
