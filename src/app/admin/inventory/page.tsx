import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { adjustInventory } from "@/server/actions/catalog";
import { AdminFormModal } from "@/components/admin/form-modal";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  Badge,
  Button,
  ButtonLink,
  DataTable,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminInventoryPage() {
  const user = await requirePermission("inventory:read");
  const canWrite = hasPermission(user.role, "inventory:write");
  const canExport = hasPermission(user.role, "reports:export");

  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { stock: "asc" },
    take: 200,
  });

  const lowStock = products.filter((p) => p.stock <= p.lowStockAt);

  return (
    <>
      <PageHeader
        icon="warehouse"
        title="Inventory"
        description="Stock levels and manual adjustments. Export CSV for offline reconciliation."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canExport ? (
              <ButtonLink href="/admin/inventory/export" variant="secondary">
                Export CSV
              </ButtonLink>
            ) : null}
            {canWrite ? (
              <AdminFormModal
                title="Adjust stock"
                description="Apply a positive or negative unit change with an optional reason."
                triggerLabel="Adjust stock"
                illustration="inventory"
              >
                <form
                  action={async (formData) => {
                    "use server";
                    await adjustInventory(formData);
                  }}
                  className="grid gap-4"
                >
                  <Field label="Product">
                    <Select name="productId" required defaultValue="">
                      <option value="" disabled>
                        Select product
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.stock})
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Change (+/− units)">
                    <Input name="delta" type="number" required placeholder="e.g. -1 or 5" />
                  </Field>
                  <Field label="Reason">
                    <Input name="reason" placeholder="Cycle count, damage, restock…" />
                  </Field>
                  <Button type="submit">Apply adjustment</Button>
                </form>
              </AdminFormModal>
            ) : null}
          </div>
        }
      />

      {lowStock.length > 0 ? (
        <AdminCard className="mb-6 border-[#e8d4a8]">
          <AdminCardHeader
            title={`Low stock warnings (${lowStock.length})`}
            description="Products at or below their low-stock threshold."
          />
          <AdminCardBody className="space-y-2 text-sm">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between gap-2">
                <Link href="/admin/products" className="hover:underline">
                  {p.name} ({p.sku})
                </Link>
                <Badge tone={p.stock === 0 ? "danger" : "warning"}>
                  {p.stock} left
                </Badge>
              </div>
            ))}
          </AdminCardBody>
        </AdminCard>
      ) : null}

      {products.length === 0 ? (
        <EmptyState title="No inventory records" icon="warehouse" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Stock</Th>
              <Th>Low at</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <Td>
                  <Link href="/admin/products" className="hover:underline">
                    {p.name}
                  </Link>
                </Td>
                <Td>{p.sku}</Td>
                <Td className="tabular-nums">
                  {p.stock <= p.lowStockAt ? (
                    <Badge tone={p.stock === 0 ? "danger" : "warning"}>{p.stock}</Badge>
                  ) : (
                    p.stock
                  )}
                </Td>
                <Td>{p.lowStockAt}</Td>
                <Td>{p.status}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
