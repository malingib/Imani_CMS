import { pgTable, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { members } from "./members.js";

export const groups = pgTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  memberCount: integer("member_count").default(0),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  groupId: text("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  memberId: text("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.groupId, table.memberId] })]);

export const groupsRelations = relations(groups, ({ many }) => ({ members: many(groupMembers) }));
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  member: one(members, { fields: [groupMembers.memberId], references: [members.id] }),
}));
