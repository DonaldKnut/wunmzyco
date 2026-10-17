import { requirePermission } from "@/lib/admin/auth";
import { koboToNaira } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { upsertCoupon } from "@/server/actions/discounts";
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

export default async function AdminDiscountsPage() {
  const user = await requirePermission("discounts:read");
  const canWrite = hasPermission(user.role, "discounts:write");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader
        title="Discounts"
        description="Coupon codes and promotional rules."
        actions={
          canWrite ? (
            <AdminFormModal
              title="Create coupon"
              description="Set a percent or fixed amount off for checkout."
              triggerLabel="Create coupon"
              illustration="coupon"
              contentClassName="max-w-3xl"
            >
              <form
                action={async (formData) => {
                  "use server";
                  await upsertCoupon(formData);
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Field label="Code">
                  <Input name="code" required placeholder="WELCOME10" />
                </Field>
                <Field label="Percent off">
                  <Input name="percentOff" type="number" min="0" max="100" placeholder="optional" />
                </Field>
                <Field label="Amount off (₦)">
                  <Input name="amountOffNaira" type="number" step="0.01" placeholder="optional" />
                </Field>
                <Field label="Min subtotal (₦)">
                  <Input name="minSubtotalNaira" type="number" step="0.01" />
                </Field>
                <Field label="Max redemptions">
                  <Input name="maxRedemptions" type="number" min="1" />
                </Field>
                <Field label="Active">
                  <label className="flex h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" defaultChecked />
                    Active
                  </label>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Textarea name="description" />
                  </Field>
                </div>
                <Button type="submit" className="sm:col-span-2">
                  Create coupon
                </Button>
              </form>
            </AdminFormModal>
          ) : undefined
        }
      />

      {coupons.length === 0 ? (
        <EmptyState title="No coupons" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Benefit</Th>
              <Th>Redemptions</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <Td className="font-mono font-medium">{c.code}</Td>
                <Td>
                  {c.percentOff != null
                    ? `${c.percentOff}% off`
                    : c.amountOffKobo != null
                      ? `₦${koboToNaira(c.amountOffKobo).toLocaleString()} off`
                      : "—"}
                </Td>
                <Td>
                  {c.redemptionCount}
                  {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                </Td>
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
