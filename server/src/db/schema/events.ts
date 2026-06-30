import { pgTable, text, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { members } from "./members.js";

export const eventTypeEnum = pgEnum("event_type", ["WORSHIP", "BIBLE_STUDY", "PRAYER", "OUTREACH", "YOUTH", "OTHER"]);
export const recurrenceEnum = pgEnum("recurrence", ["NONE", "DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]);

export const churchEvents = pgTable("church_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  type: eventTypeEnum("type").default("OTHER"),
  coordinator: text("coordinator"),
  contactPerson: text("contact_person"),
  rsvpDeadline: text("rsvp_deadline"),
  recurrence: recurrenceEnum("recurrence").default("NONE"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventAttendance = pgTable("event_attendance", {
  eventId: text("event_id").notNull().references(() => churchEvents.id, { onDelete: "cascade" }),
  memberId: text("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.eventId, table.memberId] })]);

export const churchEventsRelations = relations(churchEvents, ({ many }) => ({ attendance: many(eventAttendance) }));
export const eventAttendanceRelations = relations(eventAttendance, ({ one }) => ({
  event: one(churchEvents, { fields: [eventAttendance.eventId], references: [churchEvents.id] }),
  member: one(members, { fields: [eventAttendance.memberId], references: [members.id] }),
}));
