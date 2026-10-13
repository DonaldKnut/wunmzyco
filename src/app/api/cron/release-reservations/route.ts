import { releaseExpiredReservations } from "@/lib/inventory/reservations";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getEnv } from "@/lib/env";

function authorizeCron(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  const querySecret = new URL(request.url).searchParams.get("secret");

  let env: ReturnType<typeof getEnv> | null = null;
  try {
    env = getEnv();
  } catch {
    return false;
  }

  const token = bearer ?? headerSecret ?? querySecret;
  if (!token) return false;

  if (env.CRON_SECRET && token === env.CRON_SECRET) return true;
  if (env.ADMIN_SETUP_TOKEN && token === env.ADMIN_SETUP_TOKEN) return true;

  return false;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return jsonError("Unauthorized", 401);
  }

  const released = await releaseExpiredReservations();
  return jsonOk({ released });
}
