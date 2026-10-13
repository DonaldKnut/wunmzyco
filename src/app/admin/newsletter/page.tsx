import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import {
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminNewsletterPage() {
  await requirePermission("newsletter:read");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={`${activeCount} active subscriber${activeCount === 1 ? "" : "s"} (of ${subscribers.length} total).`}
      />

      {subscribers.length === 0 ? (
        <EmptyState title="No subscribers yet" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Email</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Subscribed</Th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <Td>{s.email}</Td>
                <Td className="text-[#5c5a54]">{s.source ?? "—"}</Td>
                <Td>
                  <Badge tone={s.isActive ? "success" : "neutral"}>
                    {s.isActive ? "Active" : "Unsubscribed"}
                  </Badge>
                </Td>
                <Td className="text-[#5c5a54]">{format(s.createdAt, "d MMM yyyy")}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
