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
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "MEMBER", input: false },
    },
  },
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
