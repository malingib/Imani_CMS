import express from "express";
import helmet from "helmet";
import { env } from "./env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { authLimiter, apiLimiter, publicLimiter } from "./middleware/rate-limit.js";
import { csrfProtection } from "./middleware/csrf.js";
import { toNodeHandler } from "./auth/index.js";
import { closeDb, db } from "./db/index.js";
import { logger } from "./lib/logger.js";
import { sql } from "drizzle-orm";
import healthRoutes from "./routes/health.js";
import profileRoutes from "./routes/profile.js";
import membersRoutes from "./routes/members.js";
import transactionsRoutes from "./routes/transactions.js";
import eventsRoutes from "./routes/events.js";
import groupsRoutes from "./routes/groups.js";
import communicationsRoutes from "./routes/communications.js";
import geminiRoutes from "./routes/gemini.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:", "https:"], connectSrc: ["'self'", env.BACKEND_URL, env.FRONTEND_URL] } } }));
app.use(corsMiddleware);
app.use("/api/auth", authLimiter);
app.all("/api/auth/{*splat}", toNodeHandler);
app.use(express.json({ limit: "100kb" }));
app.use("/api", csrfProtection);
app.use("/api/health", publicLimiter, healthRoutes);
app.use("/api/profile", apiLimiter, profileRoutes);
app.use("/api/members", apiLimiter, membersRoutes);
app.use("/api/transactions", apiLimiter, transactionsRoutes);
app.use("/api/events", apiLimiter, eventsRoutes);
app.use("/api/groups", apiLimiter, groupsRoutes);
app.use("/api/communications", apiLimiter, communicationsRoutes);
app.use("/api/gemini", apiLimiter, geminiRoutes);
app.use("/api/{*splat}", (_req, res) => { res.status(404).json({ error: "Not found" }); });
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err, "Unhandled error");
  res.status(500).json({ error: env.NODE_ENV === "production" ? "Internal server error" : String(err) });
});

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
