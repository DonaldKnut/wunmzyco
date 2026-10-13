import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { upsertCategory } from "@/server/actions/catalog";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Td,
  Textarea,
  Th,
} from "@/components/admin/ui";

export default async function AdminCategoriesPage() {
  const user = await requirePermission("products:read");
  const canWrite = hasPermission(user.role, "products:write");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader title="Categories" description="Organize products for navigation and filters." />

      {canWrite ? (
        <AdminCard className="mb-6">
          <AdminCardHeader title="Add category" />
          <AdminCardBody>
            <form
              action={async (formData) => {
                "use server";
                await upsertCategory(formData);
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <Field label="Name">
                <Input name="name" required />
              </Field>
              <Field label="Slug">
                <Input name="slug" placeholder="optional" />
              </Field>
              <Field label="Sort order">
                <Input name="sortOrder" type="number" defaultValue={0} />
              </Field>
              <Field label="Active">
                <label className="flex h-9 items-center gap-2 text-sm">
                  <input type="checkbox" name="isActive" defaultChecked className="rounded" />
                  Visible in catalog
                </label>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <Textarea name="description" />
                </Field>
              </div>
              <Button type="submit">Create category</Button>
            </form>
          </AdminCardBody>
        </AdminCard>
      ) : null}

      {categories.length === 0 ? (
        <EmptyState title="No categories" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Order</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.name}</Td>
                <Td className="text-[#5c5a54]">{c.slug}</Td>
                <Td>{c.sortOrder}</Td>
                <Td>
                  <Badge tone={c.isActive ? "success" : "neutral"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
