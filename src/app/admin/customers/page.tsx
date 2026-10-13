import { requirePermission } from "@/lib/admin/auth";
import { formatRole } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import {
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminCustomersPage() {
  await requirePermission("customers:read");

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <>
      <PageHeader title="Customers" description="Registered shopper accounts." />

      {customers.length === 0 ? (
        <EmptyState title="No customer accounts yet" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Orders</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.name}</Td>
                <Td>{c.email}</Td>
                <Td className="text-[#5c5a54]">{c.phone ?? "—"}</Td>
                <Td>{c._count.orders}</Td>
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

      <p className="mt-4 text-xs text-[#7a776f]">
        Guest checkout orders appear under Orders with guest email; role shown here is{" "}
        {formatRole("CUSTOMER")} only.
      </p>
    </>
  );
}
