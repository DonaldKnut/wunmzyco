import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { zodErrorPayload } from "@/lib/forms/zod";
import { subscribeEmail } from "@/lib/newsletter/subscribe";
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
    const payload = zodErrorPayload(parsed.error);
    return jsonError(payload.message, 422, payload);
  }

  try {
    const result = await subscribeEmail(
      parsed.data.email,
      parsed.data.source ?? "website",
    );
    if (!result.ok) return jsonError(result.message, 400);
    return jsonOk({ subscribed: true, created: result.created });
  } catch {
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
