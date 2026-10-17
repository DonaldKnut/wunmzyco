import { requirePermission } from "@/lib/admin/auth";
import { koboToNaira } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { upsertDeliveryZone } from "@/server/actions/delivery";
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

export default async function AdminDeliveryPage() {
  const user = await requirePermission("delivery:read");
  const canWrite = hasPermission(user.role, "delivery:write");

  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader
        title="Delivery zones"
        description="Fees, weight bands, and service areas."
        actions={
          canWrite ? (
            <AdminFormModal
              title="Add delivery zone"
              description="Define fees and weight bands for a service area."
              triggerLabel="Add zone"
              illustration="delivery"
              contentClassName="max-w-3xl"
            >
              <form
                action={async (formData) => {
                  "use server";
                  await upsertDeliveryZone(formData);
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Field label="Name">
                  <Input name="name" required />
                </Field>
                <Field label="Code">
                  <Input name="code" required placeholder="LAG-MAIN" />
                </Field>
                <Field label="Sort order">
                  <Input name="sortOrder" type="number" defaultValue={0} />
                </Field>
                <Field label="Base fee (₦)">
                  <Input name="baseFeeNaira" type="number" step="0.01" min="0" required />
                </Field>
                <Field label="Included weight (g)">
                  <Input name="includedWeightGrams" type="number" defaultValue={1000} />
                </Field>
                <Field label="Incremental fee (₦)">
                  <Input name="incrementalFeeNaira" type="number" step="0.01" defaultValue={0} />
                </Field>
                <Field label="Weight band (g)">
                  <Input name="weightBandGrams" type="number" defaultValue={1000} />
                </Field>
                <Field label="Estimated window">
                  <Input name="estimatedWindow" placeholder="2–4 business days" />
                </Field>
                <Field label="Active">
                  <label className="flex h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" defaultChecked />
                    Zone active
                  </label>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Textarea name="description" />
                  </Field>
                </div>
                <Button type="submit" className="sm:col-span-2">
                  Create zone
                </Button>
              </form>
            </AdminFormModal>
          ) : undefined
        }
      />

      {zones.length === 0 ? (
        <EmptyState
          title="No delivery zones"
          description="Add a zone before checkout can quote delivery."
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Code</Th>
              <Th>Base fee</Th>
              <Th>Weight rules</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id}>
                <Td className="font-medium">{z.name}</Td>
                <Td>{z.code}</Td>
                <Td>₦{koboToNaira(z.baseFeeKobo).toLocaleString()}</Td>
                <Td className="text-xs text-[#5c5a54]">
                  {z.includedWeightGrams}g incl. · +₦
                  {koboToNaira(z.incrementalFeeKobo).toLocaleString()} / {z.weightBandGrams}g
                </Td>
                <Td>
                  <Badge tone={z.isActive ? "success" : "neutral"}>
                    {z.isActive ? "Active" : "Inactive"}
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
