import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = (process.env.ADMIN_EMAIL ?? "wunmzy123@gmail.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(JSON.stringify({ found: false, email, envPasswordLength: password.length }));
    process.exit(1);
  }
  const match = password ? await bcrypt.compare(password, user.passwordHash) : null;
  console.log(
    JSON.stringify({
      found: true,
      email: user.email,
      role: user.role,
      active: user.isActive,
      envPasswordLength: password.length,
      envPasswordEndsWithDollar: password.endsWith("$"),
      passwordMatchesEnv: match,
    }),
  );
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
