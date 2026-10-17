import { requirePermission } from "@/lib/admin/auth";
import { formatRole } from "@/lib/admin/labels";
import { ADMIN_ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { createAdminUser, updateAdminUser } from "@/server/actions/users";
import { AdminFormModal } from "@/components/admin/form-modal";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminUsersPage() {
  await requirePermission("admins:manage");

  const staff = await prisma.user.findMany({
    where: { role: { in: ADMIN_ROLES } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  return (
    <>
      <PageHeader
        title="Admin users"
        description="Super admin only. No public self-registration for staff accounts."
        actions={
          <AdminFormModal
            title="Invite staff user"
            description="Creates a staff account with a temporary password."
            triggerLabel="Invite staff"
            illustration="staff"
          >
            <form
              action={async (formData) => {
                "use server";
                await createAdminUser(formData);
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Field label="Name">
                <Input name="name" required />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" required />
              </Field>
              <Field label="Temporary password">
                <Input name="password" type="password" required autoComplete="new-password" />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="SUPPORT">
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {formatRole(r)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit" className="sm:col-span-2">
                Create staff account
              </Button>
            </form>
          </AdminFormModal>
        }
      />

      {staff.length === 0 ? (
        <EmptyState
          title="No staff users"
          description="Invite the first admin account with the button above."
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Update</Th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id}>
                <Td className="font-medium">{u.name}</Td>
                <Td>{u.email}</Td>
                <Td>{formatRole(u.role)}</Td>
                <Td>
                  <Badge tone={u.isActive ? "success" : "neutral"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {u.mustChangePassword ? (
                    <span className="ml-2 text-xs text-[#6b4f1d]">Must reset pwd</span>
                  ) : null}
                </Td>
                <Td>
                  <form
                    action={async (formData) => {
                      "use server";
                      await updateAdminUser(formData);
                    }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="userId" value={u.id} />
                    <Select name="role" defaultValue={u.role} className="h-8 w-40 text-xs">
                      {ADMIN_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {formatRole(r)}
                        </option>
                      ))}
                    </Select>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" name="isActive" defaultChecked={u.isActive} />
                      Active
                    </label>
                    <Button type="submit" size="sm" variant="secondary">
                      Save
                    </Button>
                  </form>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
