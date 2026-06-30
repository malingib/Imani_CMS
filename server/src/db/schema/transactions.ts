import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { members } from "./members.js";

export const transactionTypeEnum = pgEnum("transaction_type", ["Tithe", "Offering", "Project", "Harambee", "Benevolence", "Expense", "Salary", "Utility", "Maintenance"]);
export const paymentMethodEnum = pgEnum("payment_method", ["M-Pesa", "Cash", "Bank Transfer", "Cheque"]);
export const transactionCategoryEnum = pgEnum("transaction_category", ["Income", "Expense"]);
export const transactionSourceEnum = pgEnum("transaction_source", ["MANUAL", "INTEGRATED"]);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  memberId: text("member_id").references(() => members.id, { onDelete: "set null" }),
  memberName: text("member_name"),
  amount: numeric("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  date: text("date").notNull(),
  reference: text("reference"),
  category: transactionCategoryEnum("category").notNull(),
  notes: text("notes"),
  phoneNumber: text("phone_number"),
  source: transactionSourceEnum("source").default("MANUAL"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
