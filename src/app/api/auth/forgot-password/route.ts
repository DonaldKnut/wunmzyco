import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { forgotPasswordSchema } from "@/lib/schemas/api";
import { createPasswordResetToken } from "@/lib/auth/reset";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("auth:forgot", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  await createPasswordResetToken(parsed.data.email);

  return jsonOk({
    message: "If an account exists for that email, a reset link has been sent.",
  });
}
