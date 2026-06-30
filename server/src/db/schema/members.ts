import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
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
