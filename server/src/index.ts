import { env } from "./env.js";
import { app } from "./app.js";
import { closeDb, db } from "./db/index.js";
import { logger } from "./lib/logger.js";
import { sql } from "drizzle-orm";

try {
  await db.execute(sql`SELECT 1`);
  logger.info("Database connection verified");
} catch (error) {
  logger.error(error, "Database connection failed");
  process.exit(1);
}

const server = app.listen(env.PORT, () => { logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server started"); });

function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => { await closeDb(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
