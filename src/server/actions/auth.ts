"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth/session";

export async function logoutStaff(): Promise<void> {
  await destroySession();
  redirect("/login?next=/admin&signedOut=1");
}
