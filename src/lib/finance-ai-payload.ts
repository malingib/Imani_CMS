export type FinanceAnalysisPayload = {
  transactionCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  totals: { income: number; expenses: number; net: number };
  monthlyBreakdown: Array<{
    month: string;
    category: "Income" | "Expense";
    transactionType: string;
    count: number;
    amount: number;
  }>;
};

export function buildFinanceAnalysisPayload(transactions: unknown[]): FinanceAnalysisPayload {
  if (transactions.length > 50_000) {
    throw new Error("Finance analysis supports up to 50,000 transactions per request.");
  }

  const groups = new Map<string, { month: string; category: "Income" | "Expense"; transactionType: string; count: number; amount: number }>();
  let income = 0;
  let expenses = 0;
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  let transactionCount = 0;

  for (const item of transactions) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const amount = Number(row.amount);
    const category = row.category;
    const rawDate = typeof row.date === "string" ? row.date : "";
    const parsedDate = new Date(rawDate);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(parsedDate.getTime())) continue;
    if (category !== "Income" && category !== "Expense") continue;

    const month = rawDate.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    const transactionType = typeof row.type === "string" ? row.type.slice(0, 60) : "Uncategorised";
    const key = [month, category, transactionType].join("|");
    const current = groups.get(key) ?? { month, category, transactionType, count: 0, amount: 0 };
    current.count += 1;
    current.amount = Math.round((current.amount + amount) * 100) / 100;
    groups.set(key, current);

    if (category === "Income") income += amount;
    else expenses += amount;
    transactionCount += 1;
    if (!periodStart || month < periodStart) periodStart = month;
    if (!periodEnd || month > periodEnd) periodEnd = month;
  }

  return {
    transactionCount,
    periodStart,
    periodEnd,
    totals: {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      net: Math.round((income - expenses) * 100) / 100,
    },
    monthlyBreakdown: [...groups.values()].sort((a, b) =>
      a.month.localeCompare(b.month) || a.category.localeCompare(b.category) || a.transactionType.localeCompare(b.transactionType)
    ),
  };
}
