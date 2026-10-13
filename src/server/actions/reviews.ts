"use server";

import { revalidatePath } from "next/cache";
import type { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

export async function moderateReview(
  reviewId: string,
  status: ReviewStatus,
): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("reviews:moderate");
    await prisma.review.update({ where: { id: reviewId }, data: { status } });
    await writeAuditLog({
      actorId: user.id,
      action: `review.${status.toLowerCase()}`,
      entityType: "Review",
      entityId: reviewId,
    });
    revalidatePath("/admin/reviews");
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to update review.");
  }
}
