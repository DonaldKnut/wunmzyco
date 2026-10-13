import { requirePermission } from "@/lib/admin/auth";
import { formatReviewStatus } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { moderateReview } from "@/server/actions/reviews";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Td,
  Th,
} from "@/components/admin/ui";

export default async function AdminReviewsPage() {
  const user = await requirePermission("reviews:read");
  const canModerate = hasPermission(user.role, "reviews:moderate");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { name: true } } },
  });

  return (
    <>
      <PageHeader title="Reviews" description="Moderate product reviews before they appear on the storefront." />

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Author</Th>
              <Th>Rating</Th>
              <Th>Status</Th>
              <Th>Excerpt</Th>
              {canModerate ? <Th></Th> : null}
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <Td>{r.product.name}</Td>
                <Td>{r.authorName}</Td>
                <Td>{r.rating}/5</Td>
                <Td>
                  <Badge tone="neutral">{formatReviewStatus(r.status)}</Badge>
                </Td>
                <Td className="max-w-xs truncate text-[#5c5a54]">{r.body}</Td>
                {canModerate ? (
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {r.status !== "APPROVED" ? (
                        <form
                          action={async () => {
                            "use server";
                            await moderateReview(r.id, "APPROVED");
                          }}
                        >
                          <Button type="submit" size="sm" variant="secondary">
                            Approve
                          </Button>
                        </form>
                      ) : null}
                      {r.status !== "REJECTED" ? (
                        <form
                          action={async () => {
                            "use server";
                            await moderateReview(r.id, "REJECTED");
                          }}
                        >
                          <Button type="submit" size="sm" variant="ghost">
                            Reject
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </Td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
