/**
 * Creates the first SUPER_ADMIN account.
 *
 * Requires ADMIN_SETUP_TOKEN to match (header, env, or --token=).
 * Credentials via env ADMIN_EMAIL / ADMIN_PASSWORD or --email= / --password=.
 *
 * See docs/ADMIN_BOOTSTRAP.md
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword, validatePasswordStrength } from "../src/lib/auth/password";

const prisma = new PrismaClient();

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function usage(): never {
  console.error(`
Usage:
  ADMIN_SETUP_TOKEN=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:bootstrap
  npm run admin:bootstrap -- --token=... --email=... --password=...

Options:
  --token=     Must match ADMIN_SETUP_TOKEN in the environment
  --email=     Super admin email
  --password=  Initial password (mustChangePassword will be true)
`);
  process.exit(1);
}

async function main() {
  const expectedToken = process.env.ADMIN_SETUP_TOKEN;
  const providedToken = argValue("token") ?? expectedToken;
  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    console.error("Invalid or missing ADMIN_SETUP_TOKEN.");
    usage();
  }

  const email = (process.env.ADMIN_EMAIL ?? argValue("email"))?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? argValue("password");

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    usage();
  }

  const strength = validatePasswordStrength(password);
  if (strength) {
    console.error(strength);
    process.exit(1);
  }

  const existingStaff = await prisma.user.count({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
  });

  const duplicate = await prisma.user.findUnique({ where: { email } });
  if (duplicate) {
    console.error(`User already exists: ${email}`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name: "Store Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      mustChangePassword: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(
    JSON.stringify(
      {
        created: true,
        userId: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: true,
        note:
          existingStaff === 0
            ? "First admin created."
            : "Additional super admin created.",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
