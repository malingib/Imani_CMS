import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const frequencyEnum = pgEnum("frequency", ["Weekly", "Monthly", "Quarterly", "Yearly"]);

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  spent: numeric("spent").default("0"),
  month: text("month").notNull(),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recurringExpenses = pgTable("recurring_expenses", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  nextDate: text("next_date"),
  tenantId: text("tenant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
