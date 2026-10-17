import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { upsertCollection } from "@/server/actions/catalog";
import { AdminFormModal } from "@/components/admin/form-modal";
import {
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

export default async function AdminCollectionsPage() {
  const user = await requirePermission("products:read");
  const canWrite = hasPermission(user.role, "products:write");
  const collections = await prisma.collection.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader
        icon="layers"
        title="Collections"
        description="Curated groupings for homepage and campaigns."
        actions={
          canWrite ? (
            <AdminFormModal
              title="Add collection"
              description="Group products for campaigns and homepage features."
              triggerLabel="Add collection"
              illustration="collections"
            >
              <form
                action={async (formData) => {
                  "use server";
                  await upsertCollection(formData);
                }}
                className="grid gap-4 sm:grid-cols-2"
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
                <div className="flex flex-col gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isFeatured" className="rounded" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isActive" defaultChecked className="rounded" />
                    Active
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Textarea name="description" />
                  </Field>
                </div>
                <Button type="submit" className="sm:col-span-2">
                  Create collection
                </Button>
              </form>
            </AdminFormModal>
          ) : undefined
        }
      />

      {collections.length === 0 ? (
        <EmptyState title="No collections" icon="layers" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Featured</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.name}</Td>
                <Td className="text-[#5c5a54]">{c.slug}</Td>
                <Td>{c.isFeatured ? "Yes" : "—"}</Td>
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
