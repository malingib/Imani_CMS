import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { members } from "./members.js";

export const activityTypeEnum = pgEnum("activity_type", ["PAYMENT", "EVENT_RSVP", "PROFILE_UPDATE", "GROUP_JOIN"]);

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  memberId: text("member_id").references(() => members.id, { onDelete: "cascade" }),
  type: activityTypeEnum("type").notNull(),
  description: text("description"),
  timestamp: text("timestamp"),
  metadata: jsonb("metadata"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  member: one(members, { fields: [activities.memberId], references: [members.id] }),
}));
