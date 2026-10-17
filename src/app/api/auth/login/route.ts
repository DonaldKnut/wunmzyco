import { prisma } from "@/lib/db";
import { jsonError, jsonOk, enforceRateLimit, getClientIp } from "@/lib/api/http";
import { loginFormSchema } from "@/lib/schemas/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/permissions";
import { firstZodMessage, zodFieldErrors } from "@/lib/forms/zod";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("auth:login", 10, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = loginFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(firstZodMessage(parsed.error), 422, {
      issues: parsed.error.issues,
      fieldErrors: zodFieldErrors(parsed.error),
    });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return jsonError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return jsonError("Invalid email or password", 401);
  }

  if (!isStaffRole(user.role)) {
    return jsonError("Staff accounts only", 403);
  }

  const ip = await getClientIp();
  const ua = request.headers.get("user-agent") ?? undefined;
  await createSession(user.id, { ipAddress: ip ?? undefined, userAgent: ua });

  return jsonOk({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      redirectTo: "/admin",
    },
  });
}
