import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";

const RESET_HOURS = 2;

export async function createPasswordResetToken(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !user.isActive) {
    return;
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  await sendEmail({
    to: user.email,
    subject: "Reset your Wunmzy Co password",
    template: "password_reset",
    html: `<p>Hi ${user.name},</p><p><a href="${resetUrl}">Reset your password</a>. This link expires in ${RESET_HOURS} hours.</p>`,
    metadata: { userId: user.id },
  });
}

export async function consumePasswordResetToken(
  token: string,
): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }
  return { userId: record.userId };
}

export async function markPasswordResetUsed(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.passwordResetToken.updateMany({
    where: { tokenHash, usedAt: null },
    data: { usedAt: new Date() },
  });
}
