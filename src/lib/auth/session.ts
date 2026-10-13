import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { isStaffRole } from "@/lib/permissions";

export const SESSION_COOKIE = "wunmzy_session";
const SESSION_DAYS = 14;

export type SessionUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "mustChangePassword" | "isActive"
>;

function secretKey() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string },
): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  });

  const jwt = await new SignJWT({ sid: tokenHash, sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return jwt;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (value) {
    try {
      const { payload } = await jwtVerify(value, secretKey());
      const sid = typeof payload.sid === "string" ? payload.sid : null;
      if (sid) {
        await prisma.session.deleteMany({ where: { tokenHash: sid } });
      }
    } catch {
      // ignore invalid token
    }
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  try {
    const { payload } = await jwtVerify(value, secretKey());
    const sid = typeof payload.sid === "string" ? payload.sid : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sid || !sub) return null;

    const session = await prisma.session.findUnique({
      where: { tokenHash: sid },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            mustChangePassword: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isStaffRole(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
