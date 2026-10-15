/**
 * Upserts a SUPER_ADMIN from env ADMIN_EMAIL / ADMIN_PASSWORD.
 * Requires ADMIN_SETUP_TOKEN to match .env.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword, validatePasswordStrength } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected) {
    throw new Error("ADMIN_SETUP_TOKEN is required");
  }

  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME ?? "Wunmzy Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const strength = validatePasswordStrength(password);
  if (strength) throw new Error(strength);

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const user = await prisma.user.update({
      where: { email },
      data: {
        name,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
        mustChangePassword: false,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
      },
    });
    console.log(JSON.stringify({ updated: true, userId: user.id, email: user.email, role: user.role }));
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
        mustChangePassword: false,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(JSON.stringify({ created: true, userId: user.id, email: user.email, role: user.role }));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
