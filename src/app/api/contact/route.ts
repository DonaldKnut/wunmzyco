import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { zodErrorPayload } from "@/lib/forms/zod";
import { contactSchema } from "@/lib/schemas/api";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const limited = await enforceRateLimit("contact", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const payload = zodErrorPayload(parsed.error);
    return jsonError(payload.message, 422, payload);
  }

  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const to = settings?.contactEmail ?? "Wunmzy123@gmail.com";

  await sendEmail({
    to,
    subject: `[Contact] ${parsed.data.subject}`,
    template: "contact_form",
    html: `<p><strong>From:</strong> ${parsed.data.name} &lt;${parsed.data.email}&gt;</p><p>${parsed.data.message.replace(/\n/g, "<br/>")}</p>`,
    metadata: { from: parsed.data.email },
  });

  return jsonOk({ sent: true });
}
