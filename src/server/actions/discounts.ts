"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nairaToKobo } from "@/lib/currency";
import { writeAuditLog } from "@/lib/audit";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

export async function upsertCoupon(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("discounts:write");
    const id = String(formData.get("id") ?? "").trim() || null;
    const code = String(formData.get("code") ?? "")
      .trim()
      .toUpperCase();
    const description = String(formData.get("description") ?? "").trim() || null;
    const percentOffRaw = String(formData.get("percentOff") ?? "").trim();
    const amountOffNairaRaw = String(formData.get("amountOffNaira") ?? "").trim();
    const minSubtotalNairaRaw = String(formData.get("minSubtotalNaira") ?? "").trim();
    const maxRedemptionsRaw = String(formData.get("maxRedemptions") ?? "").trim();
    const isActive = formData.get("isActive") === "on";

    if (!code) return actionError("Coupon code is required.");

    const percentOff = percentOffRaw ? Number(percentOffRaw) : null;
    const amountOffKobo = amountOffNairaRaw ? nairaToKobo(Number(amountOffNairaRaw)) : null;
    const minSubtotalKobo = minSubtotalNairaRaw
      ? nairaToKobo(Number(minSubtotalNairaRaw))
      : null;
    const maxRedemptions = maxRedemptionsRaw ? Number(maxRedemptionsRaw) : null;

    const payload = {
      code,
      description,
      percentOff: percentOff != null && Number.isFinite(percentOff) ? Math.floor(percentOff) : null,
      amountOffKobo,
      minSubtotalKobo,
      maxRedemptions:
        maxRedemptions != null && Number.isFinite(maxRedemptions)
          ? Math.floor(maxRedemptions)
          : null,
      isActive,
    };

    if (id) {
      await prisma.coupon.update({ where: { id }, data: payload });
    } else {
      await prisma.coupon.create({ data: payload });
    }

    await writeAuditLog({
      actorId: user.id,
      action: id ? "coupon.update" : "coupon.create",
      entityType: "Coupon",
      entityId: id ?? undefined,
    });
    revalidatePath("/admin/discounts");
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to save coupon.");
  }
}
