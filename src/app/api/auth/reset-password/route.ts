import { prisma } from "@/lib/db";
import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { resetPasswordSchema } from "@/lib/schemas/api";
import { hashPassword } from "@/lib/auth/password";
import {
  consumePasswordResetToken,
  markPasswordResetUsed,
} from "@/lib/auth/reset";
import { zodErrorPayload } from "@/lib/forms/zod";
import { isStaffRole } from "@/lib/permissions";

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
    const payload = zodErrorPayload(parsed.error);
    return jsonError(payload.message, 422, payload);
  }

  const consumed = await consumePasswordResetToken(parsed.data.token);
  if (!consumed) {
    return jsonError("Invalid or expired reset link", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: consumed.userId } });
  if (!user?.isActive || !isStaffRole(user.role)) {
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
