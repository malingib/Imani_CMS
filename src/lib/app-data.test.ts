import { describe, expect, it } from "vitest";
import { createChurchAppDataService } from "./app-data";

type QueryResult = { data: unknown[] | null; error: { message: string } | null };

function createQuery(data: unknown[], table: string, calls: string[]) {
  const query = {
    select(columns = "*") {
      calls.push(`${table}.select:${columns}`);
      return query;
    },
    eq(column: string, value: string) {
      calls.push(`${table}.eq:${column}:${value}`);
      return query;
    },
    then(resolve: (result: QueryResult) => unknown) {
      return Promise.resolve(resolve({ data, error: null }));
    },
  };
  return query;
}

function createInsertQuery(insertedRows: unknown[]) {
  return {
    insert(rows: unknown[]) {
      insertedRows.push(...rows);
      return Promise.resolve({ data: rows, error: null });
    },
  };
}

describe("createChurchAppDataService", () => {
  it("loads church-scoped data and merges attendance rows into events", async () => {
    const calls: string[] = [];
    const rowsByTable: Record<string, unknown[]> = {
      members: [
        {
          id: "member-1",
          first_name: "Ada",
          last_name: "Lovelace",
          phone: "0700000000",
          email: "ada@example.com",
          location: "Nairobi",
          groups: [],
          status: "Active",
          join_date: "2026-07-01",
        },
      ],
      transactions: [
        {
          id: "transaction-1",
          member_id: "member-1",
          member_name: "Ada Lovelace",
          amount: 100,
          type: "Tithe",
          payment_method: "M-Pesa",
          date: "2026-07-01",
          reference: "TXN-1",
          category: "Income",
          source: "MANUAL",
        },
      ],
      church_events: [
        {
          id: "event-1",
          title: "Sunday Service",
          description: "Weekly worship",
          date: "2026-07-05",
          time: "10:00",
          location: "Main Hall",
          type: "WORSHIP",
        },
      ],
      event_attendance: [
        { event_id: "event-1", member_id: "member-1" },
        { event_id: "event-1", member_id: "member-2" },
      ],
      budgets: [
        {
          id: "budget-1",
          category: "Salaries",
          amount: 50000,
          spent: 30000,
          month: "2026-07",
        },
      ],
      recurring_expenses: [
        {
          id: "recur-1",
          category: "Internet",
          amount: 5000,
          frequency: "Monthly",
          next_date: "2026-08-01",
        },
      ],
      audit_logs: [
        {
          id: "audit-1",
          user_id: "user-1",
          user_name: "Admin",
          action: "Loaded data",
          module: "DASHBOARD",
          timestamp: "2026-07-01T00:00:00.000Z",
          severity: "INFO",
        },
      ],
    };
    const client = {
      from(table: string) {
        return createQuery(rowsByTable[table] ?? [], table, calls);
      },
    };

    const service = createChurchAppDataService(client);
    const result = await service.loadChurchAppData("church-1");

    expect(result.members).toHaveLength(1);
    expect(result.transactions).toHaveLength(1);
    expect(result.budgets).toHaveLength(1);
    expect(result.budgets[0].category).toBe("Salaries");
    expect(result.recurringExpenses).toHaveLength(1);
    expect(result.recurringExpenses[0].frequency).toBe("Monthly");
    expect(result.auditLogs).toHaveLength(1);
    expect(result.events[0].attendance).toEqual(["member-1", "member-2"]);
    expect(calls).toContain("members.eq:church_id:church-1");
    expect(calls).toContain("budgets.eq:church_id:church-1");
    expect(calls).toContain("recurring_expenses.eq:church_id:church-1");
    expect(calls).toContain("event_attendance.select:event_id, member_id");
  });

  it("writes audit logs with the supplied church scope", async () => {
    const insertedRows: unknown[] = [];
    const client = {
      from(table: string) {
        expect(table).toBe("audit_logs");
        return createInsertQuery(insertedRows);
      },
    };
    const service = createChurchAppDataService(client);

    await service.createAuditLog({
      userId: "user-1",
      userName: "Admin",
      action: "Login success",
      module: "DASHBOARD",
      severity: "INFO",
      churchId: "church-1",
    });

    expect(insertedRows).toEqual([
      {
        user_id: "user-1",
        user_name: "Admin",
        action: "Login success",
        module: "DASHBOARD",
        severity: "INFO",
        church_id: "church-1",
      },
    ]);
  });
});
