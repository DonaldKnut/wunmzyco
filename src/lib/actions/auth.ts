"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashToken } from "@/lib/auth/session";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/auth/password";
import { isStaffRole } from "@/lib/permissions";

export type AuthFormState = { ok: boolean; message: string };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Check your email and password." };
  }
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
      redirect(safeNext || "/admin");
    }
  } catch {
    return { ok: false, message: "Unable to sign in right now." };
  }
  redirect("/account");
}

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(10),
});

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
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

const forgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
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
      // Email delivery wired separately; avoid leaking whether account exists.
    }
  } catch {
    // still show generic success
  }
  return {
    ok: true,
    message: "If an account exists for that email, reset instructions will be sent shortly.",
  };
}

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(10),
});

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse({
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
