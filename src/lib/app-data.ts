import type { AppNotification, AuditLog, AppView, Budget, ChurchEvent, CommunicationLog, Member, RecurringExpense, Transaction, Group, Sermon } from "../../types";
import { mapAuditLog, mapBudget, mapCommunication, mapEvent, mapGroup, mapMember, mapNotification, mapRecurringExpense, mapTransaction, mapSermon } from "./mappers";

type QueryResult<T> = { data: T[] | null; count: number | null; error: { message: string } | null };
export type SupabaseLikeClient = {
  from(table: string): any;
  rpc(fn: string, params: any): any;
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
  groups: Group[];
  sermons: Sermon[];
};

export type PaginatedChurchAppData = ChurchAppData & {
  totalMembers: number;
  totalTransactions: number;
  totalEvents: number;
  totalBudgets: number;
  totalRecurringExpenses: number;
  totalCommunications: number;
  totalNotifications: number;
  totalAuditLogs: number;
  totalGroups: number;
  totalSermons: number;
};

export type CreateAuditLogInput = {
  userId: string;
  userName: string;
  action: string;
  module: AppView;
  severity: AuditLog["severity"];
  churchId?: string | null;
};

function scopedQuery(
  client: SupabaseLikeClient,
  table: string,
  churchId?: string | null,
  select = "*",
  options?: { range?: { start: number; end: number }; order?: { column: string; ascending: boolean } }
): PromiseLike<QueryResult<unknown>> {
  let query = client.from(table).select(select);
  if (churchId) query = query.eq("church_id", churchId);
  if (options?.order) query = query.order(options.order.column, { ascending: options.order.ascending });
  if (options?.range) query = query.range(options.range.start, options.range.end);
  return query;
}

async function runQuery<T>(query: PromiseLike<QueryResult<unknown>>, mapRow: (row: unknown) => T) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(mapRow);
}

async function getCount(client: SupabaseLikeClient, table: string, churchId?: string | null): Promise<number> {
  let query = client.from(table).select("*", { count: "exact", head: true });
  if (churchId) query = query.eq("church_id", churchId);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
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
    async loadChurchAppData(churchId?: string | null, page = 0, pageSize = 100): Promise<PaginatedChurchAppData> {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      const paginationOpts = { range: { start, end }, order: { column: "created_at", ascending: false } };

      const members = runQuery(scopedQuery(client, "members", churchId, "*", paginationOpts), mapMember);
      const transactions = runQuery(scopedQuery(client, "transactions", churchId, "*", paginationOpts), mapTransaction);
      const events = runQuery(scopedQuery(client, "church_events", churchId, "*", paginationOpts), mapEvent);
      const attendance = scopedQuery(client, "event_attendance", churchId, "event_id, member_id", paginationOpts);
      const budgets = runQuery(scopedQuery(client, "budgets", churchId, "*", paginationOpts), mapBudget);
      const recurringExpenses = runQuery(scopedQuery(client, "recurring_expenses", churchId, "*", paginationOpts), mapRecurringExpense);
      const communications = runQuery(scopedQuery(client, "communications", churchId, "*", paginationOpts), mapCommunication);
      const notifications = runQuery(scopedQuery(client, "notifications", churchId, "*", paginationOpts), mapNotification);
      const auditLogs = runQuery(scopedQuery(client, "audit_logs", churchId, "*", paginationOpts), mapAuditLog);
      const groups = runQuery(scopedQuery(client, "groups", churchId, "*", paginationOpts), mapGroup);
      const sermons = runQuery(scopedQuery(client, "sermons", churchId, "*", paginationOpts), mapSermon);

      const countMembers = getCount(client, "members", churchId);
      const countTransactions = getCount(client, "transactions", churchId);
      const countEvents = getCount(client, "church_events", churchId);
      const countBudgets = getCount(client, "budgets", churchId);
      const countRecurringExpenses = getCount(client, "recurring_expenses", churchId);
      const countCommunications = getCount(client, "communications", churchId);
      const countNotifications = getCount(client, "notifications", churchId);
      const countAuditLogs = getCount(client, "audit_logs", churchId);
      const countGroups = getCount(client, "groups", churchId);
      const countSermons = getCount(client, "sermons", churchId);

      const [loadedMembers, loadedTransactions, loadedEvents, attendanceResult, loadedBudgets, loadedRecurringExpenses, loadedCommunications, loadedNotifications, loadedAuditLogs, loadedGroups, loadedSermons, totalMembers, totalTransactions, totalEvents, totalBudgets, totalRecurringExpenses, totalCommunications, totalNotifications, totalAuditLogs, totalGroups, totalSermons] = await Promise.all([
        members,
        transactions,
        events,
        attendance,
        budgets,
        recurringExpenses,
        communications,
        notifications,
        auditLogs,
        groups,
        sermons,
        countMembers,
        countTransactions,
        countEvents,
        countBudgets,
        countRecurringExpenses,
        countCommunications,
        countNotifications,
        countAuditLogs,
        countGroups,
        countSermons,
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
        groups: loadedGroups,
        sermons: loadedSermons,
        totalMembers,
        totalTransactions,
        totalEvents,
        totalBudgets,
        totalRecurringExpenses,
        totalCommunications,
        totalNotifications,
        totalAuditLogs,
        totalGroups,
        totalSermons,
      };
    },

    async createAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
      const insert = client.from("audit_logs").insert;
      if (!insert) throw new Error("Audit log client does not support inserts.");

      const { data, error } = await insert([
        {
          user_id: input.userId,
          user_name: input.userName,
          action: input.action,
          module: input.module,
          severity: input.severity,
          church_id: input.churchId,
        },
      ]).select();
      
      if (error) throw new Error(error.message);
      if (!data || !data[0]) throw new Error('Failed to create audit log');
      
      // Return the created log mapped to AuditLog type
      return mapAuditLog(data[0]);
    },
  };
}
