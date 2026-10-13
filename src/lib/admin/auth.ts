import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { requireStaff, type SessionUser } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/permissions";

export async function getStaffUser(): Promise<SessionUser | null> {
  try {
    return await requireStaff();
  } catch {
    return null;
  }
}

export async function requireStaffUser(): Promise<SessionUser> {
  try {
    return await requireStaff();
  } catch {
    redirect("/login?next=/admin");
  }
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireStaffUser();
  if (!hasPermission(user.role, permission)) {
    redirect("/admin?error=forbidden");
  }
  return user;
}

export async function requireAnyPermission(...permissions: Permission[]): Promise<SessionUser> {
  const user = await requireStaffUser();
  if (!permissions.some((p) => hasPermission(user.role, p))) {
    redirect("/admin?error=forbidden");
  }
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireStaffUser();
  if (!roles.includes(user.role)) {
    redirect("/admin?error=forbidden");
  }
  return user;
}

export function forbidUnless(user: SessionUser, permission: Permission): void {
  if (!hasPermission(user.role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
