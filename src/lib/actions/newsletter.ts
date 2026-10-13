"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

export type NewsletterState = { ok: boolean; message: string };

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email" };
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
