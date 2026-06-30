# Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Express 5 + BetterAuth + Drizzle ORM + PostgreSQL backend to Imani CMS, replacing mock data with real API calls.

**Architecture:** `server/` directory at project root with self-contained package.json. Frontend unchanged structurally — data source swaps from `useState` mock arrays to `useEffect` + API calls. Security middleware adapted from Keel template. PostgreSQL via Docker Compose.

**Tech Stack:** Express 5, TypeScript, Drizzle ORM, PostgreSQL (postgres.js), BetterAuth, Zod, Pino, Helmet, express-rate-limit

**Source references:** Keel template cached at `~/.opensrc/repos/github.com/Chafficui/keel/main/packages/backend/`

## Global Constraints

- All new backend files go under `server/` directory
- Use `postgres` driver (not `pg` or `pg-promise`) — matches Drizzle ORM convention
- BetterAuth version: `^1.6.20` (matches Keel)
- Drizzle ORM: `^0.45.2`
- Node.js >= 20 requirement
- All env vars validated via Zod at startup
- Tenant ID columns reserved as nullable on domain tables (multi-tenant deferred to v2)

---

### Task 1: Server Foundation

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.env.example`
- Create: `docker-compose.yml` (project root)
- Modify: `.gitignore`
- Modify: `.env` (add backend vars)

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "imani-cms-server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc --build",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "better-auth": "^1.6.20",
    "cors": "^2.8.6",
    "drizzle-orm": "^0.45.2",
    "@google/genai": "^1.34.0",
    "express": "^5.2.0",
    "express-rate-limit": "^8.3.2",
    "helmet": "^8.1.0",
    "pino": "^10.3.1",
    "postgres": "^3.4.9",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^25.5.2",
    "drizzle-kit": "^0.31.0",
    "pino-pretty": "^13.0.0",
    "tsx": "^4.19.0",
    "typescript": "~5.8.2"
  }
}
```

- [ ] **Step 2: Create `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `server/.env.example`**

```env
# Server
PORT=3005
NODE_ENV=development
BACKEND_URL=http://localhost:3005
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://imani:imani@localhost:5432/imani_cms

# Auth
BETTER_AUTH_SECRET=change-me-to-a-random-32-char-string

# Gemini
GEMINI_API_KEY=
```

- [ ] **Step 4: Create `docker-compose.yml`** (project root)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: imani
      POSTGRES_PASSWORD: imani
      POSTGRES_DB: imani_cms
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 5: Modify `.gitignore`** — add:

```
server/dist
server/node_modules
```

- [ ] **Step 6: Modify `.env`** — add backend vars at the end:

```
DATABASE_URL=postgresql://imani:imani@localhost:5432/imani_cms
BETTER_AUTH_SECRET=dev-secret-change-me-in-production
```

---

### Task 2: Server Core — Env, Logger, DB Connection

**Files:**
- Create: `server/src/env.ts`
- Create: `server/src/lib/logger.ts`
- Create: `server/src/db/index.ts`
- Create: `server/drizzle.config.ts`

- [ ] **Step 1: Create `server/src/env.ts`**

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3005),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BACKEND_URL: z.string().url().default("http://localhost:3005"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("postgresql://imani:imani@localhost:5432/imani_cms"),
  BETTER_AUTH_SECRET: z.string().default("dev-secret-change-me-in-production"),
  GEMINI_API_KEY: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === "production" && env.BETTER_AUTH_SECRET.length < 32) {
  console.error("FATAL: BETTER_AUTH_SECRET must be at least 32 characters in production");
  process.exit(1);
}
```

- [ ] **Step 2: Create `server/src/lib/logger.ts`**

```typescript
import pino from "pino";
import { env } from "../env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  ...(env.NODE_ENV !== "production" && { transport: { target: "pino-pretty" } }),
});
```

- [ ] **Step 3: Create `server/src/db/index.ts`**

Adapted from Keel: `postgres` driver + Drizzle ORM connection.

```typescript
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../env.js";
import * as schema from "./schema/index.js";

const client = postgres(env.DATABASE_URL, { max: 10, idle_timeout: 20, connect_timeout: 10 });
export const db = drizzle(client, { schema });
export const closeDb = async () => { await client.end(); };
```

- [ ] **Step 4: Create `server/drizzle.config.ts`**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL || "" },
});
```

---

### Task 3: Auth Schema + BetterAuth Configuration

**Files:**
- Create: `server/src/db/schema/auth.ts`
- Create: `server/src/db/schema/index.ts`
- Create: `server/src/auth/index.ts`

- [ ] **Step 1: Create `server/src/db/schema/auth.ts`**

```typescript
import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("sessions_user_id_idx").on(table.userId), index("sessions_expires_at_idx").on(table.expiresAt)]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("accounts_user_id_idx").on(table.userId), index("accounts_provider_account_idx").on(table.providerId, table.accountId)]);

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [index("verifications_identifier_idx").on(table.identifier), index("verifications_expires_at_idx").on(table.expiresAt)]);

export const usersRelations = relations(users, ({ many }) => ({ sessions: many(sessions), accounts: many(accounts) }));
export const sessionsRelations = relations(sessions, ({ one }) => ({ user: one(users, { fields: [sessions.userId], references: [users.id] }) }));
export const accountsRelations = relations(accounts, ({ one }) => ({ user: one(users, { fields: [accounts.userId], references: [users.id] }) }));
```

- [ ] **Step 2: Create `server/src/db/schema/index.ts`** — re-export auth schema (domain tables added later)

```typescript
export { users, sessions, accounts, verifications, usersRelations, sessionsRelations, accountsRelations } from "./auth.js";
```

- [ ] **Step 3: Create `server/src/auth/index.ts`**

```typescript
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNodeHandler as betterAuthToNodeHandler } from "better-auth/node";
import { db } from "../db/index.js";
import * as schema from "../db/schema/index.js";
import { env } from "../env.js";

const authConfig: BetterAuthOptions = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.users, session: schema.sessions, account: schema.accounts, verification: schema.verifications },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  baseURL: env.BACKEND_URL,
  trustedOrigins: [env.FRONTEND_URL],
  advanced: {
    defaultCookieAttributes: { sameSite: "lax" as const, secure: env.NODE_ENV === "production" },
  },
};

export const auth = betterAuth(authConfig);
export const toNodeHandler = betterAuthToNodeHandler(auth);
```

---

### Task 4: Security Middleware

**Files:**
- Create: `server/src/middleware/cors.ts`
- Create: `server/src/middleware/rate-limit.ts`
- Create: `server/src/middleware/csrf.ts`
- Create: `server/src/middleware/auth.ts`

All adapted directly from Keel at `~/.opensrc/repos/github.com/Chafficui/keel/main/packages/backend/src/middleware/`.

- [ ] **Step 1: Create `server/src/middleware/cors.ts`**

```typescript
import cors from "cors";
import { env } from "../env.js";

export const corsMiddleware = cors({
  origin: [env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

- [ ] **Step 2: Create `server/src/middleware/rate-limit.ts`**

```typescript
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 5,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || "unknown",
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 60,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => (req as any).user?.id ?? (req.ip || req.socket.remoteAddress || "unknown"),
});

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 30,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || "unknown",
});
```

- [ ] **Step 3: Create `server/src/middleware/csrf.ts`**

```typescript
import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) { next(); return; }
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigins = new Set<string>([env.FRONTEND_URL, env.BACKEND_URL]);
  if (origin) {
    if (allowedOrigins.has(origin)) { next(); return; }
    res.status(403).json({ error: "Forbidden: invalid origin" }); return;
  }
  if (referer) {
    try {
      if (allowedOrigins.has(new URL(referer).origin)) { next(); return; }
    } catch {}
    res.status(403).json({ error: "Forbidden: invalid origin" }); return;
  }
  res.status(403).json({ error: "Forbidden: missing origin" });
}
```

- [ ] **Step 4: Create `server/src/middleware/auth.ts`**

```typescript
import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string; emailVerified: boolean; image: string | null; createdAt: Date; updatedAt: Date; } | undefined;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const headers = new Headers();
    if (req.headers.authorization) headers.set("authorization", req.headers.authorization);
    if (req.headers.cookie) headers.set("cookie", req.headers.cookie);
    const session = await auth.api.getSession({ headers });
    if (!session) { res.status(401).json({ error: "Unauthorized" }); return; }
    req.user = session.user as Express.Request["user"];
    next();
  } catch { res.status(401).json({ error: "Unauthorized" }); }
}
```

---

### Task 5: Server Entry + Base Routes

**Files:**
- Create: `server/src/index.ts`
- Create: `server/src/routes/health.ts`
- Create: `server/src/routes/profile.ts`

- [ ] **Step 1: Create `server/src/index.ts`**

```typescript
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
```

- [ ] **Step 2: Create `server/src/routes/health.ts`**

```typescript
import { Router } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

const router = Router();
router.get("/", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch { res.status(503).json({ status: "error", message: "Database unavailable" }); }
});
export default router;
```

- [ ] **Step 3: Create `server/src/routes/profile.ts`**

```typescript
import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => { res.json({ user: req.user }); });

const updateSchema = z.object({ name: z.string().min(1).max(100).optional(), image: z.string().url().optional() });

router.patch("/", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updateData["name"] = parsed.data.name;
  if (parsed.data.image !== undefined) updateData["image"] = parsed.data.image;
  const [updated] = await db.update(users).set(updateData).where(eq(users.id, req.user!.id)).returning();
  res.json({ user: updated });
});

export default router;
```

---

### Task 6: Domain Schema

**Files:**
- Create: `server/src/db/schema/members.ts`
- Create: `server/src/db/schema/transactions.ts`
- Create: `server/src/db/schema/events.ts`
- Create: `server/src/db/schema/groups.ts`
- Create: `server/src/db/schema/communications.ts`
- Create: `server/src/db/schema/activities.ts`
- Create: `server/src/db/schema/budgets.ts`
- Create: `server/src/db/schema/sermons.ts`
- Create: `server/src/db/schema/notifications.ts`
- Create: `server/src/db/schema/audit_logs.ts`
- Modify: `server/src/db/schema/index.ts` (re-export all)

- [ ] **Step 1: Create `server/src/db/schema/members.ts`**

```typescript
import { pgTable, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const memberStatusEnum = pgEnum("member_status", ["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]);
export const maritalStatusEnum = pgEnum("marital_status", ["Single", "Married", "Widowed", "Divorced"]);
export const membershipTypeEnum = pgEnum("membership_type", ["Full Member", "Probation", "Associate", "Clergy", "Non-Communicant"]);

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  location: text("location"),
  groups: text("groups").array(),
  status: memberStatusEnum("status").default("Active"),
  joinDate: text("join_date"),
  birthday: text("birthday"),
  age: integer("age"),
  gender: text("gender"),
  maritalStatus: maritalStatusEnum("marital_status"),
  membershipType: membershipTypeEnum("membership_type"),
  photo: text("photo"),
  stewardshipScore: integer("stewardship_score"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 2: Create domain schema files** (Repeat pattern for each domain table)

Key tables and their columns mapped from `types.ts`:

**transactions.ts** — `id`, `memberId`, `memberName`, `amount`, `type` (enum: Tithe/Offering/Project/Harambee/Benevolence/Expense/Salary/Utility/Maintenance), `paymentMethod` (enum: M-Pesa/Cash/Bank Transfer/Cheque), `date`, `reference`, `category` (enum: Income/Expense), `notes`, `phoneNumber`, `source` (enum: MANUAL/INTEGRATED), `tenantId`, timestamps

**events.ts** — `id`, `title`, `description`, `date`, `time`, `location`, `type` (enum: WORSHIP/BIBLE_STUDY/PRAYER/OUTREACH/YOUTH/OTHER), `coordinator`, `contactPerson`, `rsvpDeadline`, `recurrence` (enum: NONE/DAILY/WEEKLY/MONTHLY/ANNUALLY), `tenantId`, timestamps. Plus `eventAttendance` join table: `eventId`, `memberId` (composite PK).

**groups.ts** — `id`, `name`, `description`, `memberCount`, `tenantId`, timestamps. Plus `groupMembers` join table: `groupId`, `memberId` (composite PK).

**communications.ts** — `id`, `type` (enum: SMS/Email/WhatsApp), `recipientCount`, `targetGroupName`, `subject`, `content`, `date`, `status` (enum: Sent/Scheduled/Failed), `sender`, `scheduledFor`, `deliveryBreakdown` (jsonb), `tenantId`, timestamps

**activities.ts** — `id`, `memberId`, `type` (enum: PAYMENT/EVENT_RSVP/PROFILE_UPDATE/GROUP_JOIN), `description`, `timestamp`, `metadata` (jsonb), `tenantId`

**budgets.ts** — `id`, `category`, `amount`, `spent`, `month`, `tenantId`, timestamps

**recurring_expenses.ts** — `id`, `category`, `amount`, `frequency` (enum: Weekly/Monthly/Quarterly/Yearly), `nextDate`, `tenantId`, timestamps

**sermons.ts** — `id`, `title`, `speaker`, `date`, `time`, `scripture`, `event`, `eventId`, `transcript`, `tenantId`, timestamps

**notifications.ts** — `id`, `title`, `message`, `time`, `type` (enum: SYSTEM/MPESA/MEMBER/EVENT), `read` (boolean), `tenantId`, timestamps

**audit_logs.ts** — `id`, `userId`, `userName`, `action`, `module` (text), `timestamp`, `severity` (enum: INFO/WARN/CRITICAL), `metadata` (jsonb), `tenantId`

- [ ] **Step 3: Update `server/src/db/schema/index.ts`** — re-export all domain schemas

```typescript
export * from "./auth.js";
export * from "./members.js";
export * from "./transactions.js";
export * from "./events.js";
export * from "./groups.js";
export * from "./communications.js";
export * from "./activities.js";
export * from "./budgets.js";
export * from "./sermons.js";
export * from "./notifications.js";
export * from "./audit_logs.js";
```

---

### Task 7: Domain Routes

**Files:**
- Create: `server/src/routes/members.ts`
- Create: `server/src/routes/transactions.ts`
- Create: `server/src/routes/events.ts`
- Create: `server/src/routes/groups.ts`
- Create: `server/src/routes/communications.ts`

- [ ] **Step 1: Create `server/src/routes/members.ts`** — CRUD + bulk import

```typescript
import { Router } from "express";
import { eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { members } from "../db/schema/members.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let query = db.select().from(members);
    const conditions: ReturnType<typeof like>[] = [];
    if (search) {
      conditions.push(like(members.firstName, `%${search}%`));
      conditions.push(like(members.lastName, `%${search}%`));
      conditions.push(like(members.email, `%${search}%`));
      conditions.push(like(members.phone, `%${search}%`));
    }
    if (status) query = query.where(eq(members.status, status as any));

    const result = await query.limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(members);
    res.json({ data: result, total: Number(count), page, limit });
  } catch (err) { logger.error(err, "Failed to fetch members"); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/:id", async (req, res) => {
  const [member] = await db.select().from(members).where(eq(members.id, req.params.id));
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  res.json(member);
});

router.post("/", async (req, res) => {
  try {
    const schema = z.object({
      firstName: z.string().min(1), lastName: z.string().min(1), phone: z.string().min(1),
      email: z.string().email(), location: z.string().optional(), groups: z.array(z.string()).optional(),
      status: z.string().optional(), joinDate: z.string().optional(), birthday: z.string().optional(),
      age: z.number().optional(), gender: z.string().optional(), maritalStatus: z.string().optional(),
      membershipType: z.string().optional(), photo: z.string().optional(), stewardshipScore: z.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const id = crypto.randomUUID();
    await db.insert(members).values({ id, ...parsed.data, groups: parsed.data.groups || [] });
    const [created] = await db.select().from(members).where(eq(members.id, id));
    res.status(201).json(created);
  } catch (err) { logger.error(err, "Failed to create member"); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/bulk", async (req, res) => {
  try {
    const schema = z.array(z.object({
      firstName: z.string().min(1), lastName: z.string().min(1), phone: z.string().min(1),
      email: z.string().email(), location: z.string().optional(), status: z.string().optional(),
    }));
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const values = parsed.data.map((d) => ({ id: crypto.randomUUID(), ...d }));
    await db.insert(members).values(values);
    res.status(201).json({ count: values.length });
  } catch (err) { logger.error(err, "Bulk import failed"); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const schema = z.object({
      firstName: z.string().min(1).optional(), lastName: z.string().min(1).optional(),
      phone: z.string().optional(), email: z.string().email().optional(), location: z.string().optional(),
      groups: z.array(z.string()).optional(), status: z.string().optional(),
      age: z.number().optional(), gender: z.string().optional(), maritalStatus: z.string().optional(),
      membershipType: z.string().optional(), photo: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const [updated] = await db.update(members).set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(members.id, req.params.id)).returning();
    if (!updated) { res.status(404).json({ error: "Member not found" }); return; }
    res.json(updated);
  } catch (err) { logger.error(err, "Failed to update member"); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db.delete(members).where(eq(members.id, req.params.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Member not found" }); return; }
  res.json({ deleted: true });
});

export default router;
```

- [ ] **Step 2: Create `server/src/routes/transactions.ts`** — CRUD with search/filter

```typescript
import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { transactions, transactionTypeEnum, paymentMethodEnum, transactionCategoryEnum } from "../db/schema/transactions.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const category = req.query.category as string | undefined;
  const type = req.query.type as string | undefined;
  let query = db.select().from(transactions).orderBy(desc(transactions.date));
  if (category) query = query.where(eq(transactions.category, category as any));
  if (type) query = query.where(eq(transactions.type, type as any));
  res.json(await query);
});

const createSchema = z.object({
  memberId: z.string().optional(), memberName: z.string().min(1), amount: z.number().positive(),
  type: z.enum(["Tithe","Offering","Project","Harambee","Benevolence","Expense","Salary","Utility","Maintenance"]),
  paymentMethod: z.enum(["M-Pesa","Cash","Bank Transfer","Cheque"]),
  date: z.string(), reference: z.string().min(1), category: z.enum(["Income","Expense"]),
  notes: z.string().optional(), phoneNumber: z.string().optional(), source: z.enum(["MANUAL","INTEGRATED"]).default("MANUAL"),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(transactions).values({ id: crypto.randomUUID(), ...parsed.data }).returning();
  res.status(201).json(created);
});

router.patch("/:id", async (req, res) => {
  const schema = createSchema.partial();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(transactions).set(parsed.data).where(eq(transactions.id, req.params.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db.delete(transactions).where(eq(transactions.id, req.params.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ deleted: true });
});

export default router;
```

- [ ] **Step 2b: Create `server/src/routes/events.ts`** — CRUD + RSVP

Same pattern as transactions but with ChurchEvent fields. Includes additional `POST /:id/rsvp` endpoint that inserts into `eventAttendance` table:

```typescript
router.post("/:id/rsvp", async (req, res) => {
  const { memberId } = z.object({ memberId: z.string() }).parse(req.body);
  const existing = await db.select().from(eventAttendance)
    .where(and(eq(eventAttendance.eventId, req.params.id), eq(eventAttendance.memberId, memberId)));
  if (existing.length > 0) {
    await db.delete(eventAttendance).where(and(eq(eventAttendance.eventId, req.params.id), eq(eventAttendance.memberId, memberId)));
    res.json({ rsvpd: false });
  } else {
    await db.insert(eventAttendance).values({ eventId: req.params.id, memberId });
    res.json({ rsvpd: true });
  }
});
```

- [ ] **Step 2c: Create `server/src/routes/groups.ts`** — CRUD

Same CRUD pattern as members, no additional endpoints.

- [ ] **Step 2d: Create `server/src/routes/communications.ts`** — broadcast log

```typescript
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { communicationLogs } from "../db/schema/communications.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => { res.json(await db.select().from(communicationLogs)); });

const broadcastSchema = z.object({
  type: z.enum(["SMS","Email","WhatsApp"]), recipientCount: z.number(),
  targetGroupName: z.string(), subject: z.string().optional(), content: z.string().min(1),
  sender: z.string(),
});

router.post("/broadcast", async (req, res) => {
  const parsed = broadcastSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(communicationLogs).values({
    id: crypto.randomUUID(), ...parsed.data, date: new Date().toISOString(), status: "Sent",
    deliveryBreakdown: { delivered: parsed.data.recipientCount, opened: 0, failed: 0 },
  }).returning();
  res.status(201).json(created);
});

export default router;
```

---

### Task 8: Gemini Service Route

**Files:**
- Create: `server/src/routes/gemini.ts`

- [ ] **Step 1: Create `server/src/routes/gemini.ts`**

```typescript
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(requireAuth);

const chatSchema = z.object({ message: z.string().min(1).max(5000) });

router.post("/chat", async (req, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "Gemini API key not configured" }); return; }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: parsed.data.message });
    res.json({ response: response.text });
  } catch (err) {
    logger.error(err, "Gemini API error");
    res.status(500).json({ error: "AI service error" });
  }
});

export default router;
```

---

### Task 9: Frontend API Layer

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create `src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: (import.meta.env.VITE_API_URL as string) || "",
});

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
```

- [ ] **Step 2: Create `src/lib/api.ts`**

```typescript
export class ApiError extends Error {
  constructor(public status: number, public statusText: string, public data?: unknown) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

const BASE_URL = "";
const DEFAULT_TIMEOUT_MS = 30_000;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options, signal: options.signal ?? controller.signal,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!response.ok) {
      let data: unknown;
      try { data = await response.json(); } catch {}
      throw new ApiError(response.status, response.statusText, data);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  } finally { clearTimeout(timeoutId); }
}

export function apiGet<T>(endpoint: string): Promise<T> { return apiFetch<T>(endpoint, { method: "GET" }); }
export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) });
}
export function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PATCH", ...(body ? { body: JSON.stringify(body) } : {}) });
}
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
```

- [ ] **Step 3: Create `src/hooks/useAuth.ts`**

```typescript
import { useCallback } from "react";
import { authClient, useSession } from "../lib/auth-client";

export function useAuth() {
  const { data: sessionData, isPending: isLoading } = useSession();
  const user = sessionData?.user ?? null;
  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message ?? "Login failed");
    return result.data;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const result = await authClient.signUp.email({ email, password, name });
    if (result.error) throw new Error(result.error.message ?? "Signup failed");
    return result.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authClient.signOut(); } catch {}
    window.location.href = "/login";
  }, []);

  return { user, isLoading, isAuthenticated, login, signup, logout };
}
```

- [ ] **Step 4: Create `src/components/ProtectedRoute.tsx`**

```typescript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface Props { children: React.ReactNode; }

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) { setTimedOut(false); return; }
    const timer = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !timedOut) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (timedOut || !isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}
```

---

### Task 10: Frontend Integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Login.tsx`
- Modify: `vite.config.ts`
- Modify: `package.json` (project root)

- [ ] **Step 1: Modify `vite.config.ts`** — add API proxy and VITE_API_URL

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3005',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_API_URL': JSON.stringify(''),
      },
      resolve: {
        alias: { '@': path.resolve(__dirname, '.') },
      },
    };
});
```

- [ ] **Step 2: Modify `package.json`** — add backend scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:server\"",
    "dev:frontend": "vite",
    "dev:server": "npm run dev --prefix server",
    "build": "vite build",
    "build:server": "npm run build --prefix server",
    "preview": "vite preview"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

- [ ] **Step 3: Modify `src/components/Login.tsx`** — replace localStorage auth with BetterAuth

The current Login component has a `handleLogin` call. Replace its body to use `useAuth().login()` instead of creating a mock user and storing in localStorage. On successful login, navigate to dashboard. Remove all mock user creation code.

- [ ] **Step 4: Modify `src/App.tsx`** — replace mock data with API calls

Remove all `useState` initializations that contain hardcoded mock data arrays (members, transactions, events, etc.). Replace with `useEffect` + `apiGet()` calls at app mount:

```typescript
useEffect(() => {
  apiGet<{ data: Member[] }>('/api/members').then(r => setMembers(r.data)).catch(() => {});
  apiGet<Transaction[]>('/api/transactions').then(setTransactions).catch(() => {});
  apiGet<ChurchEvent[]>('/api/events').then(setEvents).catch(() => {});
}, []);
```

Keep the handler functions (handleAddMember, etc.) but replace the `setState` calls with `apiPost`/`apiPatch`/`apiDelete` followed by a refetch.

---

### Task 11: Seed Data + Verification

**Files:**
- Create: `server/src/db/seed.ts`

- [ ] **Step 1: Create `server/src/db/seed.ts`**

Seed script that populates the database with the same mock data currently in App.tsx — 2 members, sample transactions, events, etc. Uses Drizzle insert.

```bash
npx tsx src/db/seed.ts
```

- [ ] **Step 2: Verify end-to-end**

```bash
# Terminal 1: Start PostgreSQL
docker compose up -d

# Terminal 2: Run migrations + seed
cd server && npx drizzle-kit push && npx tsx src/db/seed.ts

# Terminal 3: Start backend
cd server && npm run dev

# Terminal 4: Start frontend
npm run dev:frontend

# Verify
curl http://localhost:3005/api/health
curl http://localhost:3005/api/members
```
