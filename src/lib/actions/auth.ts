"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashToken } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isStaffRole } from "@/lib/permissions";
import { safeAdminPath, setAuthFlash } from "@/lib/auth/flash";
import { parseFormData } from "@/lib/forms/zod";
import {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "@/lib/schemas/auth";

export type AuthFormState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

const initialFail = (message: string, fieldErrors?: Record<string, string>): AuthFormState => ({
  ok: false,
  message,
  fieldErrors,
});

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseFormData(loginFormSchema, formData);
  if (!parsed.ok) {
    return initialFail(parsed.message, parsed.fieldErrors);
  }

  let destination = "/admin";

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return initialFail("Invalid email or password.");
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return initialFail("Invalid email or password.");
    }

    // Admin portal only — customers shop as guests.
    if (!isStaffRole(user.role)) {
      return initialFail("This sign-in is for staff only.", {
        email: "Staff account required.",
      });
    }

    await createSession(user.id);
    destination = safeAdminPath(parsed.data.next);
    await setAuthFlash("signedIn");
  } catch (err) {
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
    return initialFail(`Unable to sign in right now.${detail}`);
  }

  redirect(destination);
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseFormData(registerFormSchema, formData);
  if (!parsed.ok) {
    return initialFail(parsed.message, parsed.fieldErrors);
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existing) {
      return initialFail("An account with this email already exists.", {
        email: "Email already in use.",
      });
    }
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "CUSTOMER",
        phone: parsed.data.phone || null,
      },
    });
    await createSession(user.id);
    await setAuthFlash("signedIn");
  } catch {
    return initialFail("Unable to create account right now.");
  }
  redirect("/account");
}

export async function logoutAction() {
  await destroySession();
  await setAuthFlash("signedOut");
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseFormData(forgotPasswordFormSchema, formData);
  if (!parsed.ok) {
    return initialFail(parsed.message, parsed.fieldErrors);
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (user && isStaffRole(user.role)) {
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
    message: "If a staff account exists for that email, reset instructions will be sent shortly.",
  };
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseFormData(resetPasswordFormSchema, formData);
  if (!parsed.ok) {
    return initialFail(parsed.message, parsed.fieldErrors);
  }
  try {
    const tokenHash = hashToken(parsed.data.token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.isActive) {
      return initialFail("This reset link is invalid or expired.");
    }
    if (!isStaffRole(record.user.role)) {
      return initialFail("This reset link is invalid or expired.");
    }
    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, mustChangePassword: false },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    await setAuthFlash("reset");
  } catch {
    return initialFail("Unable to reset password.");
  }
  redirect("/login");
}
