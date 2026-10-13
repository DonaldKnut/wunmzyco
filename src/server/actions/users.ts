"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit";
import { ADMIN_ROLES } from "@/lib/permissions";
import { actionRequirePermission } from "@/server/actions/helpers";
import { actionError, actionOk, type ActionResult } from "@/server/actions/result";

const STAFF_ROLES = ADMIN_ROLES;

export async function createAdminUser(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await actionRequirePermission("admins:manage");
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "SUPPORT") as Role;

    if (!name || !email || !password) {
      return actionError("Name, email, and password are required.");
    }
    if (!STAFF_ROLES.includes(role)) {
      return actionError("Invalid staff role.");
    }
    const pwdErr = validatePasswordStrength(password);
    if (pwdErr) return actionError(pwdErr);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return actionError("Email already in use.");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        mustChangePassword: true,
      },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "admin_user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { role },
    });

    revalidatePath("/admin/users");
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to create user.");
  }
}

export async function updateAdminUser(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await actionRequirePermission("admins:manage");
    const userId = String(formData.get("userId") ?? "");
    const role = String(formData.get("role") ?? "") as Role;
    const isActive = formData.get("isActive") === "on";

    if (!userId) return actionError("User id required.");
    if (!STAFF_ROLES.includes(role)) return actionError("Invalid role.");

    await prisma.user.update({
      where: { id: userId },
      data: { role, isActive },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "admin_user.update",
      entityType: "User",
      entityId: userId,
      metadata: { role, isActive },
    });

    revalidatePath("/admin/users");
    return actionOk();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return actionError("You do not have permission.");
    }
    return actionError("Failed to update user.");
  }
}
