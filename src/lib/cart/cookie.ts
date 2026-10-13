import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export const GUEST_CART_COOKIE = "wunmzy_guest";

export async function getOrCreateGuestId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_CART_COOKIE)?.value;
  if (existing) return existing;

  const guestId = nanoid(24);
  store.set(GUEST_CART_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return guestId;
}
