"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { revalidateStorefront } from "@/lib/admin/revalidate-storefront";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

const slideSchema = z.object({
  id: z.string().cuid().optional(),
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  title: z.string().trim().min(2, "Title is required").max(120),
  subtitle: z.string().trim().max(400).optional().or(z.literal("")),
  ctaLabel: z.string().trim().min(1).max(40).default("Shop the edit"),
  ctaHref: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((v) => v.startsWith("/") || v.startsWith("http"), "Use a relative path or URL"),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  imageAlt: z.string().trim().max(120).optional().or(z.literal("")),
  tone: z.string().trim().max(120).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

function parseSlideForm(formData: FormData) {
  return slideSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    eyebrow: String(formData.get("eyebrow") ?? ""),
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    ctaLabel: String(formData.get("ctaLabel") ?? "Shop the edit") || "Shop the edit",
    ctaHref: String(formData.get("ctaHref") ?? "/shop") || "/shop",
    imageUrl: String(formData.get("imageUrl") ?? ""),
    imageAlt: String(formData.get("imageAlt") ?? ""),
    tone: String(formData.get("tone") ?? "") || "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]",
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") === "on",
  });
}

export async function updateHomepageContent(formData: FormData): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("settings:write");

    const homepageHeroTitle = String(formData.get("homepageHeroTitle") ?? "").trim();
    const homepageHeroSubtitle = String(formData.get("homepageHeroSubtitle") ?? "").trim();
    const tagline = String(formData.get("tagline") ?? "").trim();
    const announcementBar = String(formData.get("announcementBar") ?? "").trim() || null;
    const announcementActive = formData.get("announcementActive") === "on";

    if (!homepageHeroTitle) return actionError("Hero title is required.");

    await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        homepageHeroTitle,
        homepageHeroSubtitle,
        tagline,
        announcementBar,
        announcementActive,
      },
      update: {
        homepageHeroTitle,
        homepageHeroSubtitle,
        tagline,
        announcementBar,
        announcementActive,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      action: "homepage.content.update",
      entityType: "StoreSettings",
      entityId: "default",
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/admin/settings");
    revalidateStorefront();
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to save homepage content.");
  }
}

export async function upsertHomepageSlide(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await actionRequirePermission("settings:write");
    const parsed = parseSlideForm(formData);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid slide.");
    }
    const data = parsed.data;

    const payload = {
      eyebrow: data.eyebrow || "",
      title: data.title,
      subtitle: data.subtitle || "",
      ctaLabel: data.ctaLabel,
      ctaHref: data.ctaHref,
      imageUrl: data.imageUrl || null,
      imageAlt: data.imageAlt || null,
      tone: data.tone || "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]",
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };

    const slide = data.id
      ? await prisma.homepageSlide.update({ where: { id: data.id }, data: payload })
      : await prisma.homepageSlide.create({ data: payload });

    await writeAuditLog({
      actorId: user.id,
      action: data.id ? "homepage.slide.update" : "homepage.slide.create",
      entityType: "HomepageSlide",
      entityId: slide.id,
    });

    revalidatePath("/admin/homepage");
    revalidateStorefront();
    return actionOk({ id: slide.id });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to save slide.");
  }
}

export async function deleteHomepageSlide(slideId: string): Promise<ActionResult> {
  try {
    const user = await actionRequirePermission("settings:write");
    await prisma.homepageSlide.delete({ where: { id: slideId } });
    await writeAuditLog({
      actorId: user.id,
      action: "homepage.slide.delete",
      entityType: "HomepageSlide",
      entityId: slideId,
    });
    revalidatePath("/admin/homepage");
    revalidateStorefront();
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to delete slide.");
  }
}
