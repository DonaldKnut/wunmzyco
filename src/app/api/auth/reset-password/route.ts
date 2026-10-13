import { prisma } from "@/lib/db";
import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { resetPasswordSchema } from "@/lib/schemas/api";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import {
  consumePasswordResetToken,
  markPasswordResetUsed,
} from "@/lib/auth/reset";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("auth:reset", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  const strength = validatePasswordStrength(parsed.data.password);
  if (strength) {
    return jsonError(strength, 422);
  }

  const consumed = await consumePasswordResetToken(parsed.data.token);
  if (!consumed) {
    return jsonError("Invalid or expired reset link", 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: consumed.userId },
    data: { passwordHash, mustChangePassword: false },
  });
  await markPasswordResetUsed(parsed.data.token);

  return jsonOk({ reset: true });
}
