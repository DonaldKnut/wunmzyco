"use server";

import { firstZodMessage } from "@/lib/forms/zod";
import { subscribeEmail } from "@/lib/newsletter/subscribe";
import { newsletterSchema } from "@/lib/schemas/api";

export type NewsletterState = { ok: boolean; message: string };

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const source = String(formData.get("source") || "storefront");
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source,
  });
  if (!parsed.success) {
    return { ok: false, message: firstZodMessage(parsed.error) };
  }
  try {
    const result = await subscribeEmail(parsed.data.email, parsed.data.source ?? source);
    return { ok: result.ok, message: result.message };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
