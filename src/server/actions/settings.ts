"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

export async function updateStoreSettings(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("settings:write");

    const storeName = String(formData.get("storeName") ?? "").trim();
    const tagline = String(formData.get("tagline") ?? "").trim();
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim() || null;
    const announcementBar = String(formData.get("announcementBar") ?? "").trim() || null;
    const announcementActive = formData.get("announcementActive") === "on";
    const defaultWeightGrams = Number(formData.get("defaultWeightGrams") ?? 400);
    const lowStockThreshold = Number(formData.get("lowStockThreshold") ?? 2);
    const reservationMinutes = Number(formData.get("reservationMinutes") ?? 30);
    const homepageHeroTitle = String(formData.get("homepageHeroTitle") ?? "").trim();
    const homepageHeroSubtitle = String(formData.get("homepageHeroSubtitle") ?? "").trim();
    const aboutCopy = String(formData.get("aboutCopy") ?? "").trim() || null;
    const shippingPolicy = String(formData.get("shippingPolicy") ?? "").trim() || null;
    const returnsPolicy = String(formData.get("returnsPolicy") ?? "").trim() || null;

    if (!storeName || !contactEmail) {
      return actionError("Store name and contact email are required.");
    }

    await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        storeName,
        tagline,
        contactEmail,
        whatsappNumber,
        announcementBar,
        announcementActive,
        defaultWeightGrams: Math.max(0, Math.floor(defaultWeightGrams)),
        lowStockThreshold: Math.max(0, Math.floor(lowStockThreshold)),
        reservationMinutes: Math.max(5, Math.floor(reservationMinutes)),
        homepageHeroTitle,
        homepageHeroSubtitle,
        aboutCopy,
        shippingPolicy,
        returnsPolicy,
      },
      update: {
        storeName,
        tagline,
        contactEmail,
        whatsappNumber,
        announcementBar,
        announcementActive,
        defaultWeightGrams: Math.max(0, Math.floor(defaultWeightGrams)),
        lowStockThreshold: Math.max(0, Math.floor(lowStockThreshold)),
        reservationMinutes: Math.max(5, Math.floor(reservationMinutes)),
        homepageHeroTitle,
        homepageHeroSubtitle,
        aboutCopy,
        shippingPolicy,
        returnsPolicy,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      action: "settings.update",
      entityType: "StoreSettings",
      entityId: "default",
    });

    revalidatePath("/admin/settings");
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to save settings.");
  }
}
