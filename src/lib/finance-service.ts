import type { Budget, RecurringExpense, Transaction } from "../../types";

export type BudgetVsActual = {
  category: string;
  budgetAmount: number;
  actualSpent: number;
  variance: number;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  expenseRatio: number;
  budgetVariance: BudgetVsActual[];
};

const CATEGORY_MAP: Record<string, string[]> = {
  Salaries: ["Salary"],
  Utilities: ["Utility", "Maintenance"],
  Benevolence: ["Benevolence"],
  General: ["Expense"],
};

function findMapping(budgetCategory: string, type: string): boolean {
  const mapped = CATEGORY_MAP[budgetCategory];
  if (!mapped) return budgetCategory.toLowerCase() === type.toLowerCase();
  return mapped.some(m => m.toLowerCase() === type.toLowerCase());
}

export function computeBudgetVsActuals(budgets: Budget[], transactions: Transaction[]): BudgetVsActual[] {
  const expenses = transactions.filter(t => t.category === "Expense");

  return budgets.map(budget => {
    const matching = expenses.filter(t => findMapping(budget.category, t.type));
    const actualSpent = matching.reduce((sum, t) => sum + t.amount, 0);
    return {
      category: budget.category,
      budgetAmount: budget.amount,
      actualSpent,
      variance: budget.amount - actualSpent,
    };
  });
}

export function getUpcomingRecurringExpenses(expenses: RecurringExpense[]): RecurringExpense[] {
  return [...expenses].sort((a, b) => a.nextDate.localeCompare(b.nextDate));
}

export function generateFinanceSummary(transactions: Transaction[], budgets: Budget[]): FinanceSummary {
  const totalIncome = transactions.filter(t => t.category === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.category === "Expense").reduce((sum, t) => sum + t.amount, 0);
  const netPosition = totalIncome - totalExpenses;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const budgetVariance = computeBudgetVsActuals(budgets, transactions);

  return {
    totalIncome,
    totalExpenses,
    netPosition,
    expenseRatio: Math.round(expenseRatio * 100) / 100,
    budgetVariance,
  };
}
