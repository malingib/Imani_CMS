import { describe, expect, it } from "vitest";
import { mapBudget, mapCommunication, mapEvent, mapMember, mapNotification, mapRecurringExpense, mapTransaction, mapAuditLog } from "./mappers";

describe("mappers", () => {
  it("maps member rows to camelCase", () => {
    const row = {
      id: "m-1",
      first_name: "John",
      last_name: "Doe",
      phone: "0700000000",
      email: "john@test.com",
      location: "Nairobi",
      groups: ["Youth"],
      status: "Active",
      join_date: "2026-01-01",
      gender: "Male",
      marital_status: "Single",
    };
    const result = mapMember(row as any);
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Doe");
    expect(result.gender).toBe("Male");
    expect(result.maritalStatus).toBe("Single");
  });

  it("maps transaction rows to camelCase", () => {
    const row = {
      id: "t-1",
      member_id: "m-1",
      member_name: "John Doe",
      amount: 5000,
      type: "Tithe",
      payment_method: "M-Pesa",
      date: "2026-07-01",
      reference: "REF-001",
      category: "Income",
      source: "MANUAL",
    };
    const result = mapTransaction(row as any);
    expect(result.memberId).toBe("m-1");
    expect(result.memberName).toBe("John Doe");
    expect(result.paymentMethod).toBe("M-Pesa");
    expect(result.amount).toBe(5000);
  });

  it("maps budget rows to camelCase", () => {
    const row = { id: "b-1", category: "Salaries", amount: 50000, spent: 30000, month: "2026-07" };
    const result = mapBudget(row as any);
    expect(result.category).toBe("Salaries");
    expect(result.spent).toBe(30000);
    expect(result.month).toBe("2026-07");
  });

  it("maps recurring expense rows to camelCase", () => {
    const row = { id: "r-1", category: "Internet", amount: 5000, frequency: "Monthly", next_date: "2026-08-01" };
    const result = mapRecurringExpense(row as any);
    expect(result.frequency).toBe("Monthly");
    expect(result.nextDate).toBe("2026-08-01");
  });

  it("maps event rows to camelCase with attendance", () => {
    const row = { id: "e-1", title: "Service", description: "Morning", date: "2026-07-05", time: "10:00", location: "Hall", type: "WORSHIP" };
    const result = mapEvent(row as any);
    expect(result.title).toBe("Service");
    expect(result.attendance).toEqual([]);
  });

  it("maps communication rows to camelCase", () => {
    const row = {
      id: "c-1",
      type: "SMS",
      recipient_count: 50,
      target_group_name: "All Members",
      subject: "Reminder",
      content: "Service tomorrow",
      date: "2026-07-01",
      status: "Sent",
      sender: "Admin",
    };
    const result = mapCommunication(row as any);
    expect(result.recipientCount).toBe(50);
    expect(result.targetGroupName).toBe("All Members");
    expect(result.sender).toBe("Admin");
  });

  it("maps notification rows to camelCase", () => {
    const row = { id: "n-1", title: "New Member", message: "John joined", time: "2026-07-01T10:00:00Z", type: "SYSTEM", read: false };
    const result = mapNotification(row as any);
    expect(result.title).toBe("New Member");
    expect(result.read).toBe(false);
  });

  it("maps audit log rows to camelCase", () => {
    const row = { id: "a-1", user_id: "u-1", user_name: "Admin", action: "Login", module: "DASHBOARD", severity: "INFO" };
    const result = mapAuditLog(row as any);
    expect(result.userId).toBe("u-1");
    expect(result.userName).toBe("Admin");
    expect(result.module).toBe("DASHBOARD");
  });

  it("maps empty status to Active", () => {
    const row = {
      id: "m-1",
      first_name: "John",
      last_name: "Doe",
      phone: "0700000000",
      email: "john@test.com",
      location: "Nairobi",
      groups: [],
      status: "",
      join_date: "2026-01-01",
    };
    const result = mapMember(row as any);
    expect(result.status).toBe("Active");
  });

  it("does not crash on null or missing optional fields", () => {
    const row = {
      id: "m-1",
      first_name: "Jane",
      last_name: "Smith",
      phone: null,
      email: null,
      location: null,
      groups: null,
      status: "Active",
      join_date: null,
    };
    const result = mapMember(row as any);
    expect(result.phone).toBe("");
    expect(result.email).toBe("");
    expect(result.location).toBe("");
    expect(result.groups).toEqual([]);
    expect(result.joinDate).toBe("");
  });

  it("does not crash on invalid date strings", () => {
    const row = {
      id: "m-1",
      first_name: "Bob",
      last_name: "Brown",
      phone: "0700000000",
      email: "bob@test.com",
      location: "Mombasa",
      groups: [],
      status: "Active",
      join_date: "not-a-date",
    };
    const result = mapMember(row as any);
    expect(result.joinDate).toBe("not-a-date");
  });
});
