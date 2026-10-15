import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const rows = await prisma.$queryRawUnsafe("SELECT 1 as ok");
  console.log("db-ok", rows);
  process.exit(0);
} catch (e) {
  console.error("db-fail", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
