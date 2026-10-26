import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = (process.env.ADMIN_EMAIL ?? "wunmzy123@gmail.com").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? "";

console.log("DATABASE_URL host:", (process.env.DATABASE_URL ?? "").replace(/:[^:@/]+@/, ":***@").slice(0, 120));
console.log("password len:", password.length, "endsWith $:", password.endsWith("$"));

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("RESULT: user not found");
    process.exit(1);
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log(
    JSON.stringify({
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordOk: ok,
      hashPrefix: user.passwordHash.slice(0, 10),
    }),
  );
  process.exit(ok ? 0 : 2);
} catch (e) {
  console.error("RESULT: error", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
