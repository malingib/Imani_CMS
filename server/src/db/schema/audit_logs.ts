import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const severityEnum = pgEnum("severity", ["INFO", "WARN", "CRITICAL"]);

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  userName: text("user_name"),
  action: text("action").notNull(),
  module: text("module").notNull(),
  timestamp: text("timestamp"),
  severity: severityEnum("severity").default("INFO"),
  metadata: jsonb("metadata"),
  tenantId: text("tenant_id"),
});
