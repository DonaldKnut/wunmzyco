import { jsonOk } from "@/lib/api/http";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession();
  return jsonOk({ loggedOut: true });
}
