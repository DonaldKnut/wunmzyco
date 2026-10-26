"use server";

import { prisma } from "@/lib/db";
import { firstZodMessage } from "@/lib/forms/zod";
import { newsletterSchema } from "@/lib/schemas/api";

export type NewsletterState = { ok: boolean; message: string };

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: firstZodMessage(parsed.error) };
  }
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase(), source: "storefront" },
      update: { isActive: true, unsubscribedAt: null },
    });
    return { ok: true, message: "You're on the list — thank you." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
