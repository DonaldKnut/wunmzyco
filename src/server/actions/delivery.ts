"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nairaToKobo } from "@/lib/currency";
import { writeAuditLog } from "@/lib/audit";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

function parseZoneForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const baseFeeNaira = Number(formData.get("baseFeeNaira"));
  const includedWeightGrams = Number(formData.get("includedWeightGrams") ?? 1000);
  const incrementalFeeNaira = Number(formData.get("incrementalFeeNaira") ?? 0);
  const weightBandGrams = Number(formData.get("weightBandGrams") ?? 1000);
  const estimatedWindow = String(formData.get("estimatedWindow") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!name || !code) throw new Error("Name and code are required.");
  if (!Number.isFinite(baseFeeNaira)) throw new Error("Invalid base fee.");

  return {
    name,
    code,
    description,
    baseFeeKobo: nairaToKobo(baseFeeNaira),
    includedWeightGrams: Math.max(0, Math.floor(includedWeightGrams)),
    incrementalFeeKobo: nairaToKobo(incrementalFeeNaira),
    weightBandGrams: Math.max(1, Math.floor(weightBandGrams)),
    estimatedWindow,
    sortOrder: Math.floor(sortOrder),
    isActive,
  };
}

export async function upsertDeliveryZone(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("delivery:write");
    const id = String(formData.get("id") ?? "").trim() || null;
    const data = parseZoneForm(formData);

    if (id) {
      await prisma.deliveryZone.update({ where: { id }, data });
    } else {
      await prisma.deliveryZone.create({ data });
    }

    await writeAuditLog({
      actorId: user.id,
      action: id ? "delivery_zone.update" : "delivery_zone.create",
      entityType: "DeliveryZone",
      entityId: id ?? undefined,
    });
    revalidatePath("/admin/delivery");
    return actionOk();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save zone";
    if (msg === "FORBIDDEN") return actionError("You do not have permission.");
    return actionError(msg);
  }
}
