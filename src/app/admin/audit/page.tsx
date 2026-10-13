import { format } from "date-fns";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import {
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminAuditPage() {
  await requirePermission("audit:read");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <>
      <PageHeader title="Audit log" description="Staff actions on sensitive resources." />

      {logs.length === 0 ? (
        <EmptyState title="No audit entries yet" description="Actions from admin tools will appear here." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <Td className="whitespace-nowrap text-[#5c5a54]">
                  {format(log.createdAt, "d MMM yyyy, HH:mm:ss")}
                </Td>
                <Td>
                  {log.actor ? (
                    <span>
                      {log.actor.name}
                      <span className="block text-xs text-[#7a776f]">{log.actor.email}</span>
                    </span>
                  ) : (
                    <span className="text-[#7a776f]">System</span>
                  )}
                </Td>
                <Td className="font-mono text-xs">{log.action}</Td>
                <Td className="text-sm">
                  {log.entityType}
                  {log.entityId ? (
                    <span className="block truncate font-mono text-xs text-[#7a776f]">
                      {log.entityId}
                    </span>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
