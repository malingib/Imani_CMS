import { describe, expect, it } from "vitest";
import type { Budget, RecurringExpense, Transaction } from "../../types";
import { computeBudgetVsActuals, getUpcomingRecurringExpenses, generateFinanceSummary } from "./finance-service";

describe("finance service", () => {
  it("computes budget vs actuals for each budget category", () => {
    const budgets: Budget[] = [
      { id: "b1", category: "Salaries", amount: 50000, spent: 30000, month: "2026-07" },
      { id: "b2", category: "Utilities", amount: 10000, spent: 8000, month: "2026-07" },
    ];
    const transactions: Transaction[] = [
      { id: "t1", memberName: "Staff", amount: 25000, type: "Salary", paymentMethod: "Bank Transfer", date: "2026-07-01", reference: "SL-1", category: "Expense", source: "MANUAL" },
      { id: "t2", memberName: "Staff", amount: 25000, type: "Salary", paymentMethod: "Bank Transfer", date: "2026-07-15", reference: "SL-2", category: "Expense", source: "MANUAL" },
      { id: "t3", memberName: "KPLC", amount: 4000, type: "Utility", paymentMethod: "M-Pesa", date: "2026-07-10", reference: "UT-1", category: "Expense", source: "MANUAL" },
      { id: "t4", memberName: "KPLC", amount: 4000, type: "Utility", paymentMethod: "M-Pesa", date: "2026-07-20", reference: "UT-2", category: "Expense", source: "MANUAL" },
      { id: "t5", memberName: "John", amount: 20000, type: "Tithe", paymentMethod: "M-Pesa", date: "2026-07-05", reference: "OF-1", category: "Income", source: "MANUAL" },
    ];

    const result = computeBudgetVsActuals(budgets, transactions);

    expect(result).toHaveLength(2);
    const salaries = result.find(r => r.category === "Salaries")!;
    expect(salaries.budgetAmount).toBe(50000);
    expect(salaries.actualSpent).toBe(50000);
    expect(salaries.variance).toBe(0);

    const utilities = result.find(r => r.category === "Utilities")!;
    expect(utilities.budgetAmount).toBe(10000);
    expect(utilities.actualSpent).toBe(8000);
    expect(utilities.variance).toBe(2000);
  });

  it("returns empty array when no budgets exist", () => {
    const result = computeBudgetVsActuals([], []);
    expect(result).toEqual([]);
  });

  it("returns zero totals for empty transactions", () => {
    const result = generateFinanceSummary([], []);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netPosition).toBe(0);
    expect(result.expenseRatio).toBe(0);
    expect(result.budgetVariance).toEqual([]);
  });

  it("sorts upcoming recurring expenses by nextDate ascending", () => {
    const expenses: RecurringExpense[] = [
      { id: "r2", category: "Internet", amount: 5000, frequency: "Monthly", nextDate: "2026-08-01" },
      { id: "r1", category: "Rent", amount: 30000, frequency: "Monthly", nextDate: "2026-07-25" },
      { id: "r3", category: "Insurance", amount: 12000, frequency: "Quarterly", nextDate: "2026-09-15" },
    ];

    const result = getUpcomingRecurringExpenses(expenses);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("r1");
    expect(result[1].id).toBe("r2");
    expect(result[2].id).toBe("r3");
  });

  it("generates a finance summary with income, expenses, and budget health", () => {
    const transactions: Transaction[] = [
      { id: "t1", memberName: "John", amount: 100000, type: "Tithe", paymentMethod: "M-Pesa", date: "2026-07-01", reference: "OF-1", category: "Income", source: "MANUAL" },
      { id: "t2", memberName: "Alice", amount: 50000, type: "Offering", paymentMethod: "Cash", date: "2026-07-02", reference: "OF-2", category: "Income", source: "MANUAL" },
      { id: "t3", memberName: "Staff", amount: 80000, type: "Salary", paymentMethod: "Bank Transfer", date: "2026-07-05", reference: "SL-1", category: "Expense", source: "MANUAL" },
      { id: "t4", memberName: "KPLC", amount: 8000, type: "Utility", paymentMethod: "M-Pesa", date: "2026-07-10", reference: "UT-1", category: "Expense", source: "MANUAL" },
    ];
    const budgets: Budget[] = [
      { id: "b1", category: "Salaries", amount: 100000, spent: 80000, month: "2026-07" },
    ];

    const summary = generateFinanceSummary(transactions, budgets);

    expect(summary.totalIncome).toBe(150000);
    expect(summary.totalExpenses).toBe(88000);
    expect(summary.netPosition).toBe(62000);
    expect(summary.expenseRatio).toBeCloseTo(58.67, 1);
    expect(summary.budgetVariance).toHaveLength(1);
    expect(summary.budgetVariance[0].category).toBe("Salaries");
    expect(summary.budgetVariance[0].variance).toBe(20000);
  });
});
