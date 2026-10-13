import { prisma } from "@/lib/db";
import { jsonError, jsonOk, enforceRateLimit, getClientIp } from "@/lib/api/http";
import { registerSchema } from "@/lib/schemas/checkout";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("auth:register", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  const strength = validatePasswordStrength(parsed.data.password);
  if (strength) {
    return jsonError(strength, 422);
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return jsonError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const ip = await getClientIp();
  const ua = request.headers.get("user-agent") ?? undefined;
  await createSession(user.id, { ipAddress: ip ?? undefined, userAgent: ua });

  return jsonOk(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    },
    { status: 201 },
  );
}
