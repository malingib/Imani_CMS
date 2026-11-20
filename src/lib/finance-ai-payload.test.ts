import { describe, expect, it } from "vitest";
import { buildFinanceAnalysisPayload } from "./finance-ai-payload";

describe("buildFinanceAnalysisPayload", () => {
  it("aggregates totals and monthly categories without carrying personal or reference data", () => {
    const payload = buildFinanceAnalysisPayload([
      { id: "private-id", memberName: "Ada Lovelace", phoneNumber: "+254700000000", reference: "MPESA-SECRET", notes: "private", amount: 1000.25, category: "Income", type: "Tithe", date: "2026-10-01" },
      { id: "private-id-2", memberName: "Grace", amount: 200.10, category: "Expense", type: "Utility", date: "2026-10-02" },
      { memberName: "John", amount: 500, category: "Income", type: "Offering", date: "2026-11-01" },
    ]);

    expect(payload.transactionCount).toBe(3);
    expect(payload.periodStart).toBe("2026-10");
    expect(payload.periodEnd).toBe("2026-11");
    expect(payload.totals).toEqual({ income: 1500.25, expenses: 200.1, net: 1300.15 });
    expect(JSON.stringify(payload)).not.toContain("Ada Lovelace");
    expect(JSON.stringify(payload)).not.toContain("MPESA-SECRET");
    expect(JSON.stringify(payload)).not.toContain("+254700000000");
  });

  it("ignores malformed or unsupported rows and rejects oversized requests", () => {
    const payload = buildFinanceAnalysisPayload([
      null,
      { amount: "bad", category: "Income", type: "Tithe", date: "2026-10-01" },
      { amount: 20, category: "Income", type: "Tithe", date: "not-a-date" },
      { amount: 30, category: "Unknown", type: "Other", date: "2026-10-01" },
    ]);
    expect(payload.transactionCount).toBe(0);
    expect(payload.totals.net).toBe(0);
    expect(() => buildFinanceAnalysisPayload(new Array(50_001))).toThrow("50,000");
  });
});
