import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { BRAND } from "@/lib/brand";
import { logger } from "@/lib/logger";

export type SubscribeResult =
  | { ok: true; created: boolean; message: string }
  | { ok: false; message: string };

/** Persist a subscriber and email the store owner when it's a brand-new signup. */
export async function subscribeEmail(
  emailRaw: string,
  source = "website",
): Promise<SubscribeResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { ok: false, message: "Please enter your email." };

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, source, isActive: true },
    update: {
      isActive: true,
      unsubscribedAt: null,
      source,
    },
  });

  const created = !existing;
  if (created) {
    void notifyAdminOfSignup(email, source).catch((err) => {
      logger.error("newsletter_admin_notify_failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }

  return {
    ok: true,
    created,
    message: created
      ? "You're on the list — thank you."
      : "Welcome back — you're already on our list.",
  };
}

async function notifyAdminOfSignup(email: string, source: string) {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
    select: { contactEmail: true },
  });
  const to = settings?.contactEmail?.trim() || BRAND.contactEmail;

  await sendEmail({
    to,
    subject: `New newsletter signup · ${email}`,
    template: "newsletter_signup",
    html: `
      <div style="font-family: Georgia, serif; color: #1a1a18; line-height: 1.55;">
        <h1 style="font-weight: 500; font-size: 22px;">New newsletter subscriber</h1>
        <p>Someone joined the Wunmzy Co list.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Source:</strong> ${source}</p>
        <p style="color:#6b6459;font-size:14px;">
          View everyone in Admin → Newsletter.
        </p>
      </div>
    `,
    metadata: { email, source },
  });
}
