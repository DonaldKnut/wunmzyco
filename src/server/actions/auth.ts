"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth/session";
import { setAuthFlash } from "@/lib/auth/flash";

export async function logoutStaff(): Promise<void> {
  await destroySession();
  await setAuthFlash("signedOut");
  redirect("/login");
}
