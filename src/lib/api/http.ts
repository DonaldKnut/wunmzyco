import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null
  );
}

export async function enforceRateLimit(
  prefix: string,
  limit: number,
  windowMs: number,
): Promise<NextResponse | null> {
  const ip = await getClientIp();
  const result = rateLimit(clientKey(prefix, ip), limit, windowMs);
  if (!result.ok) {
    return jsonError("Too many requests. Please try again later.", 429, {
      retryAfterSec: result.retryAfterSec,
    });
  }
  return null;
}

export function parseJsonBody<T>(
  body: unknown,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
): { data: T } | { error: NextResponse } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { error: jsonError("Invalid request body", 422) };
  }
  return { data: parsed.data };
}
