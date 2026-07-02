import type { AppNotification, AuditLog, AppView, Budget, ChurchEvent, CommunicationLog, Member, RecurringExpense, Transaction } from "../../types";
import { mapAuditLog, mapBudget, mapCommunication, mapEvent, mapMember, mapNotification, mapRecurringExpense, mapTransaction } from "./mappers";

type QueryResult<T> = { data: T[] | null; error: { message: string } | null };
export type SupabaseLikeClient = {
  from(table: string): any;
};

export type ChurchAppData = {
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  communications: CommunicationLog[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
};

export type CreateAuditLogInput = {
  userId: string;
  userName: string;
  action: string;
  module: AppView;
  severity: AuditLog["severity"];
  churchId?: string | null;
};

function scopedQuery(client: SupabaseLikeClient, table: string, churchId?: string | null, select = "*"): PromiseLike<QueryResult<unknown>> {
  let query = client.from(table).select(select);
  if (churchId) query = query.eq("church_id", churchId);
  return query;
}

async function runQuery<T>(query: PromiseLike<QueryResult<unknown>>, mapRow: (row: unknown) => T) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(mapRow);
}

function mergeEventAttendance(events: ChurchEvent[], attendanceRows: unknown[]) {
  const attendanceByEvent = new Map<string, string[]>();
  attendanceRows.forEach((row) => {
    const attendanceRow = row as { event_id?: string; member_id?: string };
    if (!attendanceRow.event_id || !attendanceRow.member_id) return;
    const eventAttendance = attendanceByEvent.get(attendanceRow.event_id) || [];
    eventAttendance.push(attendanceRow.member_id);
    attendanceByEvent.set(attendanceRow.event_id, eventAttendance);
  });
  return events.map((event) => ({ ...event, attendance: attendanceByEvent.get(event.id) || [] }));
}

export function createChurchAppDataService(client: SupabaseLikeClient) {
  return {
    async loadChurchAppData(churchId?: string | null): Promise<ChurchAppData> {
      const members = runQuery(scopedQuery(client, "members", churchId), mapMember);
      const transactions = runQuery(scopedQuery(client, "transactions", churchId), mapTransaction);
      const events = runQuery(scopedQuery(client, "church_events", churchId), mapEvent);
      const attendance = scopedQuery(client, "event_attendance", churchId, "event_id, member_id");
      const budgets = runQuery(scopedQuery(client, "budgets", churchId), mapBudget);
      const recurringExpenses = runQuery(scopedQuery(client, "recurring_expenses", churchId), mapRecurringExpense);
      const communications = runQuery(scopedQuery(client, "communications", churchId), mapCommunication);
      const notifications = runQuery(scopedQuery(client, "notifications", churchId), mapNotification);
      const auditLogs = runQuery(scopedQuery(client, "audit_logs", churchId), mapAuditLog);

      const [loadedMembers, loadedTransactions, loadedEvents, attendanceResult, loadedBudgets, loadedRecurringExpenses, loadedCommunications, loadedNotifications, loadedAuditLogs] = await Promise.all([
        members,
        transactions,
        events,
        attendance,
        budgets,
        recurringExpenses,
        communications,
        notifications,
        auditLogs,
      ]);
      if (attendanceResult.error) throw new Error(attendanceResult.error.message);

      return {
        members: loadedMembers,
        transactions: loadedTransactions,
        events: mergeEventAttendance(loadedEvents, attendanceResult.data || []),
        budgets: loadedBudgets,
        recurringExpenses: loadedRecurringExpenses,
        communications: loadedCommunications,
        notifications: loadedNotifications,
        auditLogs: loadedAuditLogs,
      };
    },

    async createAuditLog(input: CreateAuditLogInput): Promise<void> {
      const insert = client.from("audit_logs").insert;
      if (!insert) throw new Error("Audit log client does not support inserts.");

      const { error } = await insert([
        {
          user_id: input.userId,
          user_name: input.userName,
          action: input.action,
          module: input.module,
          severity: input.severity,
          church_id: input.churchId,
        },
      ]);
      if (error) throw new Error(error.message);
    },
  };
}
