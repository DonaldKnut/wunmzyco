"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashToken } from "@/lib/auth/session";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/auth/password";
import { isStaffRole } from "@/lib/permissions";
import {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "@/lib/schemas/auth";

export type AuthFormState = { ok: boolean; message: string };

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Check your email and password." };
  }
  let staffRedirect: string | null = null;
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !user.isActive) {
      return { ok: false, message: "Invalid email or password." };
    }
    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return { ok: false, message: "Invalid email or password." };
    }
    await createSession(user.id);
    const next = String(formData.get("next") ?? "").trim();
    const safeNext = next.startsWith("/") ? next : "";
    if (isStaffRole(user.role)) {
      staffRedirect = safeNext || "/admin";
    }
  } catch (err) {
    // Next.js redirect() throws; never swallow it as a login failure.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("[loginAction]", err);
    const detail =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? ` (${err.message})`
        : "";
    return { ok: false, message: `Unable to sign in right now.${detail}` };
  }
  redirect(staffRedirect || "/account");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const strength = validatePasswordStrength(parsed.data.password);
  if (strength) return { ok: false, message: strength };
  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existing) {
      return { ok: false, message: "An account with this email already exists." };
    }
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "CUSTOMER",
      },
    });
    await createSession(user.id);
  } catch {
    return { ok: false, message: "Unable to create account right now." };
  }
  redirect("/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordFormSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email." };
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (user) {
      const { generateToken } = await import("@/lib/auth/session");
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt,
        },
      });
    }
  } catch {
    // still show generic success
  }
  return {
    ok: true,
    message: "If an account exists for that email, reset instructions will be sent shortly.",
  };
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordFormSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const strength = validatePasswordStrength(parsed.data.password);
  if (strength) return { ok: false, message: strength };
  try {
    const tokenHash = hashToken(parsed.data.token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.isActive) {
      return { ok: false, message: "This reset link is invalid or expired." };
    }
    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  } catch {
    return { ok: false, message: "Unable to reset password." };
  }
  redirect("/login?reset=1");
}
