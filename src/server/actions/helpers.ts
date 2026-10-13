"use server";

import type { SessionUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/auth/session";
import { forbidUnless } from "@/lib/admin/auth";
import type { Permission } from "@/lib/permissions";

export async function actionRequireStaff(): Promise<SessionUser> {
  return requireStaff();
}

export async function actionRequirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireStaff();
  forbidUnless(user, permission);
  return user;
}
