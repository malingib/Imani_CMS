import { describe, expect, it } from "vitest";
import { createChurchAppDataService } from "./app-data";

type QueryResult = { data: unknown[] | null; count: number | null; error: { message: string } | null };

function createQuery(data: unknown[], table: string, calls: string[]) {
  let isHeadQuery = false;
  const query = {
    select(columns = "*", opts?: { count?: string; head?: boolean }) {
      if (opts?.head) isHeadQuery = true;
      calls.push(`${table}.select:${columns}`);
      return query;
    },
    eq(column: string, value: string) {
      calls.push(`${table}.eq:${column}:${value}`);
      return query;
    },
    order(column: string, { ascending }: { ascending: boolean }) {
      calls.push(`${table}.order:${column}:${ascending ? "asc" : "desc"}`);
      return query;
    },
    range(start: number, end: number) {
      calls.push(`${table}.range:${start}:${end}`);
      return query;
    },
    then(resolve: (result: QueryResult) => unknown) {
      if (isHeadQuery) {
        return Promise.resolve(resolve({ data: null, count: data.length, error: null }));
      }
      return Promise.resolve(resolve({ data, count: null, error: null }));
    },
  };
  return query;
}

function createFailingQuery(errorMessage: string) {
  return {
    select(_columns = "*") {
      return this;
    },
    eq(_column: string, _value: string) {
      return this;
    },
    order() {
      return this;
    },
    range() {
      return this;
    },
    then(resolve: (result: QueryResult) => unknown) {
      return Promise.resolve(resolve({ data: null, count: null, error: { message: errorMessage } }));
    },
  };
}

function createInsertQuery(insertedRows: unknown[]) {
  const result = { data: [] as unknown[], error: null };
  result.data = [];
  const insertThen = (resolve: (r: QueryResult) => unknown) =>
    Promise.resolve(resolve(result as unknown as QueryResult));
  return {
    insert(rows: unknown[]) {
      insertedRows.push(...rows);
      result.data = rows;
      return { select: () => ({ then: insertThen }) };
    },
  };
}

describe("createChurchAppDataService", () => {
  it("loads church-scoped data, applies pagination, and merges attendance rows into events", async () => {
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
      rpc() {
        return { then() { return Promise.resolve({ data: null, error: null }); } };
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
    expect(result.totalMembers).toBe(1);
    expect(result.totalTransactions).toBe(1);
    expect(result.totalEvents).toBe(1);
    expect(result.totalBudgets).toBe(1);
    expect(result.totalRecurringExpenses).toBe(1);
    expect(result.totalAuditLogs).toBe(1);
    expect(calls).toContain("members.eq:church_id:church-1");
    expect(calls).toContain("budgets.eq:church_id:church-1");
    expect(calls).toContain("recurring_expenses.eq:church_id:church-1");
    expect(calls).toContain("event_attendance.select:event_id, member_id");
    expect(calls).toContain("members.range:0:99");
    expect(calls).toContain("members.order:created_at:desc");
    expect(calls).toContain("budgets.range:0:99");
    expect(calls).toContain("budgets.order:created_at:desc");
  });

  it("writes audit logs with the supplied church scope", async () => {
    const insertedRows: unknown[] = [];
    const client = {
      from(table: string) {
        expect(table).toBe("audit_logs");
        return createInsertQuery(insertedRows);
      },
      rpc() {
        return { then() { return Promise.resolve({ data: null, error: null }); } };
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

  it("throws when query fails", async () => {
    const client = {
      from(_table: string) {
        return createFailingQuery("Database connection failed");
      },
      rpc() {
        return { then() { return Promise.resolve({ data: null, error: null }); } };
      },
    };
    const service = createChurchAppDataService(client);
    await expect(service.loadChurchAppData("church-1")).rejects.toThrow("Database connection failed");
  });
});
