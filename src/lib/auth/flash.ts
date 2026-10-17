import { cookies } from "next/headers";
import { AUTH_FLASH_COOKIE, type AuthFlash } from "@/lib/auth/flash-constants";

export { AUTH_FLASH_COOKIE, type AuthFlash };

/** Short-lived client-readable flash so we can toast without a URL bounce. */
export async function setAuthFlash(kind: AuthFlash): Promise<void> {
  const store = await cookies();
  store.set(AUTH_FLASH_COOKIE, kind, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30,
  });
}

/** Only allow same-origin relative paths under /admin (open-redirect safe). */
export function safeAdminPath(next: string | undefined | null): string {
  const raw = (next ?? "").trim();
  if (!raw.startsWith("/admin")) return "/admin";
  if (raw.startsWith("//") || raw.includes("\\")) return "/admin";
  return raw.split("#")[0] || "/admin";
}
