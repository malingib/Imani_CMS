import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { churchEvents } from "./events.js";

export const sermons = pgTable("sermons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  speaker: text("speaker").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  scripture: text("scripture"),
  event: text("event"),
  eventId: text("event_id").references(() => churchEvents.id, { onDelete: "set null" }),
  transcript: text("transcript"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sermonsRelations = relations(sermons, ({ one }) => ({
  event: one(churchEvents, { fields: [sermons.eventId], references: [churchEvents.id] }),
}));
