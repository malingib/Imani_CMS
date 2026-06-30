import { pgTable, text, integer, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const communicationTypeEnum = pgEnum("communication_type", ["SMS", "Email", "WhatsApp"]);
export const communicationStatusEnum = pgEnum("communication_status", ["Sent", "Scheduled", "Failed"]);

export const communications = pgTable("communications", {
  id: text("id").primaryKey(),
  type: communicationTypeEnum("type").notNull(),
  recipientCount: integer("recipient_count"),
  targetGroupName: text("target_group_name"),
  subject: text("subject"),
  content: text("content").notNull(),
  date: text("date").notNull(),
  status: communicationStatusEnum("status").default("Sent"),
  sender: text("sender"),
  scheduledFor: text("scheduled_for"),
  deliveryBreakdown: jsonb("delivery_breakdown"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
