/**
 * Starts a local embedded PostgreSQL instance for development
 * when Docker / system Postgres is unavailable.
 *
 * Usage: npx tsx scripts/start-embedded-pg.ts
 * Leave this process running while you develop.
 */
import EmbeddedPostgres from "embedded-postgres";
import path from "path";

const PORT = Number(process.env.PG_PORT ?? 5432);
const PASSWORD = process.env.PG_PASSWORD ?? "postgres";

async function main() {
  process.env.TZ = "UTC";
  process.env.PGTZ = "UTC";

  const pg = new EmbeddedPostgres({
    databaseDir: path.join(process.cwd(), "data", "pg"),
    user: "postgres",
    password: PASSWORD,
    port: PORT,
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C", "--lc-messages=C"],
  });

  console.log("Initialising embedded PostgreSQL…");
  await pg.initialise();
  console.log("Starting embedded PostgreSQL on port", PORT);
  await pg.start();

  try {
    await pg.createDatabase("wunmzyco");
    console.log("Created database wunmzyco");
  } catch {
    console.log("Database wunmzyco already exists (ok)");
  }

  console.log("");
  console.log("Embedded Postgres is ready.");
  console.log(
    `DATABASE_URL=postgresql://postgres:${PASSWORD}@localhost:${PORT}/wunmzyco?schema=public`,
  );
  console.log("Keep this terminal open. Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("\nStopping embedded PostgreSQL…");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep alive
  await new Promise(() => undefined);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
