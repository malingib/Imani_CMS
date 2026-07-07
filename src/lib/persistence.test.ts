import { describe, expect, it, vi } from "vitest";
import {
  memberToRow,
  transactionToRow,
  eventToRow,
  budgetToRow,
  recurringExpenseToRow,
  communicationToRow,
  notificationToRow,
  groupToRow,
  createPersistenceService,
} from "./persistence";
import type { Member, Transaction, ChurchEvent, Budget, RecurringExpense, CommunicationLog, AppNotification, Group } from "../../types";

const churchId = "church-1";
const uuidId = "123e4567-e89b-12d3-a456-426614174000";

describe("memberToRow", () => {
  const member: Member = {
    id: "m-1",
    firstName: "John",
    lastName: "Doe",
    phone: "+254700000000",
    email: "john@test.com",
    location: "Nairobi",
    groups: ["Youth"],
    status: "Active" as Member["status"],
    joinDate: "2026-01-01",
  };

  it("maps member to DB row without id", () => {
    const row = memberToRow(member, churchId);
    expect(row.first_name).toBe("John");
    expect(row.last_name).toBe("Doe");
    expect(row.church_id).toBe(churchId);
    expect(row.id).toBeUndefined();
  });

  it("includes id when includeId is true and id is UUID", () => {
    const m = { ...member, id: uuidId };
    const row = memberToRow(m, churchId, true);
    expect(row.id).toBe(uuidId);
  });

  it("omits id when includeId is true but id is not UUID", () => {
    const row = memberToRow(member, churchId, true);
    expect(row.id).toBeUndefined();
  });
});

describe("transactionToRow", () => {
  const tx: Transaction = {
    id: "t-1",
    memberId: "m-1",
    memberName: "John Doe",
    amount: 5000,
    type: "Tithe",
    paymentMethod: "M-Pesa",
    date: "2026-07-01",
    reference: "REF-001",
    category: "Income",
    source: "MANUAL",
  };

  it("maps transaction to DB row", () => {
    const row = transactionToRow(tx, churchId);
    expect(row.member_name).toBe("John Doe");
    expect(row.payment_method).toBe("M-Pesa");
    expect(row.amount).toBe(5000);
    expect(row.member_id).toBeNull(); // non-UUID memberId
  });

  it("includes member_id when it is UUID", () => {
    const tx2 = { ...tx, memberId: uuidId };
    const row = transactionToRow(tx2, churchId);
    expect(row.member_id).toBe(uuidId);
  });
});

describe("eventToRow", () => {
  const event: ChurchEvent = {
    id: "e-1",
    title: "Service",
    description: "Morning service",
    date: "2026-07-05",
    time: "10:00",
    location: "Hall",
    type: "WORSHIP",
    attendance: [],
  };

  it("maps event to DB row", () => {
    const row = eventToRow(event, churchId);
    expect(row.title).toBe("Service");
    expect(row.recurrence).toBe("NONE");
  });

  it("preserves recurrence when set", () => {
    const e = { ...event, recurrence: "WEEKLY" as const };
    const row = eventToRow(e, churchId);
    expect(row.recurrence).toBe("WEEKLY");
  });
});

describe("budgetToRow", () => {
  it("maps budget to DB row", () => {
    const budget: Budget = { id: "b-1", category: "Salaries", amount: 50000, spent: 30000, month: "2026-07" };
    const row = budgetToRow(budget, churchId);
    expect(row.category).toBe("Salaries");
    expect(row.spent).toBe(30000);
  });
});

describe("recurringExpenseToRow", () => {
  it("maps recurring expense to DB row", () => {
    const expense: RecurringExpense = { id: "r-1", category: "Internet", amount: 5000, frequency: "Monthly", nextDate: "2026-08-01" };
    const row = recurringExpenseToRow(expense, churchId);
    expect(row.frequency).toBe("Monthly");
    expect(row.next_date).toBe("2026-08-01");
  });
});

describe("communicationToRow", () => {
  it("maps communication log to DB row", () => {
    const log: CommunicationLog = {
      id: "c-1", type: "SMS", recipientCount: 50, targetGroupName: "All", subject: "Reminder",
      content: "Test", date: "2026-07-01", status: "Sent", sender: "Admin",
    };
    const row = communicationToRow(log, churchId);
    expect(row.recipient_count).toBe(50);
    expect(row.target_group_name).toBe("All");
  });
});

describe("notificationToRow", () => {
  it("maps notification to DB row", () => {
    const notif: AppNotification = {
      id: "n-1", title: "Test", message: "Hello", time: "2026-07-01T10:00:00Z", type: "SYSTEM", read: false,
    };
    const row = notificationToRow(notif, churchId);
    expect(row.church_id).toBe(churchId);
    expect(row.user_id).toBeNull();
  });

  it("sets user_id when provided", () => {
    const notif: AppNotification = {
      id: "n-1", title: "Test", message: "Hello", time: "2026-07-01T10:00:00Z", type: "SYSTEM", read: false,
    };
    const row = notificationToRow(notif, churchId, "user-1");
    expect(row.user_id).toBe("user-1");
  });
});

describe("groupToRow", () => {
  it("maps group to DB row", () => {
    const group: Group = { id: "g-1", name: "Youth", description: "Young members", memberCount: 10, createdAt: "", updatedAt: "" };
    const row = groupToRow(group, churchId);
    expect(row.name).toBe("Youth");
    expect(row.member_count).toBe(10);
  });
});

describe("createPersistenceService", () => {
  function mockClient() {
    const result = { data: null, error: null };
    const builder = {
      select: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      single: vi.fn(() => builder),
      upsert: vi.fn(() => builder),
      then: vi.fn((onfulfilled: (v: typeof result) => any) => Promise.resolve(result).then(onfulfilled)),
    };
    const client = {
      from: vi.fn(() => builder),
      rpc: vi.fn(),
    };
    return { client, builder, result };
  }

  it("creates a member", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    const member: Member = {
      id: "m-1", firstName: "Jane", lastName: "Doe", phone: "+254700000000",
      email: "", location: "Nairobi", groups: [], status: "Active" as Member["status"], joinDate: "2026-01-01",
    };

    result.data = { id: "m-new", first_name: "Jane", last_name: "Doe", phone: "+254700000000", email: "", location: "Nairobi", groups: [], status: "Active", join_date: "2026-01-01" };

    const res = await service.createMember(member, churchId);
    expect(client.from).toHaveBeenCalledWith("members");
    expect(res.firstName).toBe("Jane");
  });

  it("throws on create error", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    result.error = { message: "DB error" };

    const member: Member = {
      id: "m-1", firstName: "Jane", lastName: "Doe", phone: "+254700000000",
      email: "", location: "Nairobi", groups: [], status: "Active" as Member["status"], joinDate: "2026-01-01",
    };

    await expect(service.createMember(member, churchId)).rejects.toThrow("DB error");
  });

  it("fetches members", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    result.data = [
      { id: "m-1", first_name: "John", last_name: "Doe", phone: "+254700000000", email: "", location: "Nairobi", groups: [], status: "Active", join_date: "2026-01-01" },
    ];

    const members = await service.getMembers(churchId);
    expect(members).toHaveLength(1);
    expect(members[0].firstName).toBe("John");
  });

  it("creates multiple members", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    result.data = [
      { id: "m-1", first_name: "A", last_name: "B", phone: "+254700000000", email: "", location: "L", groups: [], status: "Active", join_date: "2026-01-01" },
    ];

    const members = await service.createMembers([{
      id: "m-1", firstName: "A", lastName: "B", phone: "+254700000000",
      email: "", location: "L", groups: [], status: "Active" as Member["status"], joinDate: "2026-01-01",
    }], churchId);
    expect(members).toHaveLength(1);
    expect(client.from).toHaveBeenCalledWith("members");
  });

  it("replaces event attendance", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    result.error = null;

    await service.replaceEventAttendance("event-1", ["m-1", "m-2"], churchId);
    expect(client.from).toHaveBeenCalledWith("event_attendance");
    expect(client.from().insert).toHaveBeenCalled();
  });

  it("handles platform settings", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    result.data = { flags: { category1: { key1: "val1" } } };

    await service.setPlatformSetting("category1", "key2", "val2");
    expect(client.from).toHaveBeenCalledWith("platform_settings");
    expect(client.from().upsert).toHaveBeenCalled();
  });

  it("returns null for missing platform setting", async () => {
    const { client, result } = mockClient();
    const service = createPersistenceService(client);

    result.data = null;
    result.error = { code: "PGRST116", message: "not found" };

    const val = await service.getPlatformSetting("category1", "key1");
    expect(val).toBeNull();
  });
});
