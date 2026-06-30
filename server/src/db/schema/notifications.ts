import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", ["SYSTEM", "MPESA", "MEMBER", "EVENT"]);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  time: text("time"),
  type: notificationTypeEnum("type").notNull(),
  read: boolean("read").default(false),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
