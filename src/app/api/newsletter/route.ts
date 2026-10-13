import { prisma } from "@/lib/db";
import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { newsletterSchema } from "@/lib/schemas/api";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("newsletter", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 422, { issues: parsed.error.issues });
  }

  const email = parsed.data.email.toLowerCase();

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      source: parsed.data.source ?? "website",
      isActive: true,
    },
    update: {
      isActive: true,
      unsubscribedAt: null,
      source: parsed.data.source ?? undefined,
    },
  });

  return jsonOk({ subscribed: true });
}
