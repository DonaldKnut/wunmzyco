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

function sourceLabel(source: string | null) {
  switch (source) {
    case "popup":
      return "Popup";
    case "homepage":
      return "Homepage";
    case "storefront":
      return "Storefront";
    case "website":
      return "Website";
    default:
      return source ?? "—";
  }
}

export default async function AdminNewsletterPage() {
  await requirePermission("newsletter:read");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const activeCount = subscribers.filter((s) => s.isActive).length;
  const popupCount = subscribers.filter((s) => s.source === "popup").length;

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={`${activeCount} active · ${popupCount} from popup · ${subscribers.length} total. New signups email the store contact.`}
      />

      {subscribers.length === 0 ? (
        <EmptyState
          title="No subscribers yet"
          description="When shoppers join via the homepage form or the timed popup, they appear here."
        />
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
                <Td className="font-medium">{s.email}</Td>
                <Td className="text-[#5c5a54]">{sourceLabel(s.source)}</Td>
                <Td>
                  <Badge tone={s.isActive ? "success" : "neutral"}>
                    {s.isActive ? "Active" : "Unsubscribed"}
                  </Badge>
                </Td>
                <Td className="text-[#5c5a54]">
                  {format(s.createdAt, "d MMM yyyy · HH:mm")}
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
