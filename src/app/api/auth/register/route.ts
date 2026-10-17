import { jsonError, enforceRateLimit } from "@/lib/api/http";

/** Public self-registration is disabled — staff are invited; shoppers use guest checkout. */
export async function POST() {
  const limited = await enforceRateLimit("auth:register", 5, 60_000);
  if (limited) return limited;
  return jsonError("Public registration is disabled. Staff accounts are invited only.", 403);
}
