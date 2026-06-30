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
