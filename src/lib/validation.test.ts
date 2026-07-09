import { describe, expect, it } from "vitest";
import {
  MemberFormSchema,
  CsvMemberSchema,
  LoginFormSchema,
  SignupFormSchema,
  PasswordResetSchema,
  AcceptInviteFormSchema,
  TransactionFormSchema,
  MpesaPaymentSchema,
  EventFormSchema,
  GroupFormSchema,
  BudgetFormSchema,
  validateFormData,
} from "./validation";

describe("MemberFormSchema", () => {
  it("accepts valid member data", () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
      phone: "+254700000000",
      email: "john@test.com",
      location: "Nairobi",
      groups: ["Youth"],
      status: "Active",
      joinDate: "2026-01-01",
    };
    const result = MemberFormSchema.parse(data);
    expect(result.firstName).toBe("John");
    expect(result.status).toBe("Active");
  });

  it("rejects short name", () => {
    const data = {
      firstName: "J",
      lastName: "Doe",
      phone: "+254700000000",
      location: "Nairobi",
      joinDate: "2026-01-01",
    };
    expect(() => MemberFormSchema.parse(data)).toThrow();
  });

  it("rejects invalid phone format", () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
      phone: "abc",
      location: "Nairobi",
      joinDate: "2026-01-01",
    };
    expect(() => MemberFormSchema.parse(data)).toThrow();
  });

  it("rejects invalid email", () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
      phone: "+254700000000",
      email: "not-an-email",
      location: "Nairobi",
      joinDate: "2026-01-01",
    };
    expect(() => MemberFormSchema.parse(data)).toThrow();
  });

  it("applies default status", () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
      phone: "+254700000000",
      location: "Nairobi",
      joinDate: "2026-01-01",
    };
    const result = MemberFormSchema.parse(data);
    expect(result.status).toBe("Active");
  });

  it("rejects invalid gender", () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
      phone: "+254700000000",
      location: "Nairobi",
      joinDate: "2026-01-01",
      gender: "Alien",
    };
    expect(() => MemberFormSchema.parse(data)).toThrow();
  });
});

describe("CsvMemberSchema", () => {
  it("accepts valid CSV row data", () => {
    const data = {
      firstname: "Jane",
      lastname: "Smith",
      phone: "0712345678",
      location: "Mombasa",
      email: "jane@test.com",
    };
    const result = CsvMemberSchema.parse(data);
    expect(result.firstname).toBe("Jane");
  });

  it("accepts CSV row with empty optional fields", () => {
    const data = {
      firstname: "Jane",
      lastname: "Smith",
      phone: "0712345678",
      location: "Mombasa",
    };
    const result = CsvMemberSchema.parse(data);
    expect(result.location).toBe("Mombasa");
  });

  it("rejects CSV row with missing required fields", () => {
    const data = { firstname: "Jane" };
    expect(() => CsvMemberSchema.parse(data)).toThrow();
  });
});

describe("LoginFormSchema", () => {
  it("accepts valid login data", () => {
    const data = { email: "admin@test.com", password: "secret123" };
    const result = LoginFormSchema.parse(data);
    expect(result.email).toBe("admin@test.com");
  });

  it("rejects invalid email", () => {
    expect(() => LoginFormSchema.parse({ email: "bad", password: "secret123" })).toThrow();
  });

  it("rejects short password", () => {
    expect(() => LoginFormSchema.parse({ email: "a@b.com", password: "12" })).toThrow();
  });
});

describe("SignupFormSchema", () => {
  it("accepts valid signup data", () => {
    const data = { name: "New User", email: "new@test.com", password: "Password1", confirmPassword: "Password1" };
    const result = SignupFormSchema.parse(data);
    expect(result.name).toBe("New User");
  });

  it("rejects password without uppercase", () => {
    expect(() =>
      SignupFormSchema.parse({ name: "Test", email: "t@t.com", password: "password1", confirmPassword: "password1" })
    ).toThrow();
  });

  it("rejects password without number", () => {
    expect(() =>
      SignupFormSchema.parse({ name: "Test", email: "t@t.com", password: "PasswordA", confirmPassword: "PasswordA" })
    ).toThrow();
  });

  it("rejects mismatched passwords", () => {
    expect(() =>
      SignupFormSchema.parse({ name: "Test", email: "t@t.com", password: "Password1", confirmPassword: "Password2" })
    ).toThrow();
  });
});

describe("PasswordResetSchema", () => {
  it("accepts valid email", () => {
    const result = PasswordResetSchema.parse({ email: "user@test.com" });
    expect(result.email).toBe("user@test.com");
  });

  it("rejects invalid email", () => {
    expect(() => PasswordResetSchema.parse({ email: "" })).toThrow();
  });
});

describe("AcceptInviteFormSchema", () => {
  it("accepts valid accept-invite data", () => {
    const data = { name: "John Kamau", password: "Password1", confirmPassword: "Password1" };
    const result = AcceptInviteFormSchema.parse(data);
    expect(result.name).toBe("John Kamau");
  });

  it("rejects password without uppercase", () => {
    expect(() =>
      AcceptInviteFormSchema.parse({ name: "John", password: "password1", confirmPassword: "password1" })
    ).toThrow();
  });

  it("rejects password without number", () => {
    expect(() =>
      AcceptInviteFormSchema.parse({ name: "John", password: "PasswordA", confirmPassword: "PasswordA" })
    ).toThrow();
  });

  it("rejects mismatched passwords", () => {
    expect(() =>
      AcceptInviteFormSchema.parse({ name: "John", password: "Password1", confirmPassword: "Password2" })
    ).toThrow();
  });

  it("rejects short name", () => {
    expect(() =>
      AcceptInviteFormSchema.parse({ name: "J", password: "Password1", confirmPassword: "Password1" })
    ).toThrow();
  });
});

describe("TransactionFormSchema", () => {
  const validTx = {
    memberName: "John Doe",
    amount: 1000,
    type: "Tithe",
    paymentMethod: "M-Pesa",
    date: "2026-07-01",
    reference: "REF-001",
    category: "Income",
  };

  it("accepts valid transaction data", () => {
    const result = TransactionFormSchema.parse(validTx);
    expect(result.amount).toBe(1000);
  });

  it("rejects negative amount", () => {
    expect(() => TransactionFormSchema.parse({ ...validTx, amount: -10 })).toThrow();
  });

  it("rejects invalid transaction type", () => {
    expect(() => TransactionFormSchema.parse({ ...validTx, type: "InvalidType" })).toThrow();
  });

  it("rejects invalid payment method", () => {
    expect(() => TransactionFormSchema.parse({ ...validTx, paymentMethod: "Credit" })).toThrow();
  });

  it("accepts optional notes and phoneNumber", () => {
    const data = { ...validTx, notes: "Test note", phoneNumber: "0712345678" };
    const result = TransactionFormSchema.parse(data);
    expect(result.notes).toBe("Test note");
  });
});

describe("MpesaPaymentSchema", () => {
  it("accepts valid M-Pesa payment", () => {
    const data = { phoneNumber: "+254700000000", amount: 500, accountRef: "TITHE001" };
    const result = MpesaPaymentSchema.parse(data);
    expect(result.amount).toBe(500);
  });

  it("rejects invalid phone", () => {
    expect(() =>
      MpesaPaymentSchema.parse({ phoneNumber: "abc", amount: 500, accountRef: "TITHE001" })
    ).toThrow();
  });

  it("rejects negative amount", () => {
    expect(() =>
      MpesaPaymentSchema.parse({ phoneNumber: "+254700000000", amount: -1, accountRef: "TITHE001" })
    ).toThrow();
  });

  it("rejects empty account reference", () => {
    expect(() =>
      MpesaPaymentSchema.parse({ phoneNumber: "+254700000000", amount: 500, accountRef: "" })
    ).toThrow();
  });
});

describe("EventFormSchema", () => {
  const validEvent = {
    title: "Sunday Service",
    description: "Weekly service",
    date: "2026-07-12",
    time: "10:00",
    location: "Main Hall",
    type: "WORSHIP",
  };

  it("accepts valid event data", () => {
    const result = EventFormSchema.parse(validEvent);
    expect(result.title).toBe("Sunday Service");
  });

  it("rejects invalid event type", () => {
    expect(() => EventFormSchema.parse({ ...validEvent, type: "INVALID" })).toThrow();
  });

  it("accepts optional coordinator and recurrence", () => {
    const data = { ...validEvent, coordinator: "Pastor John", recurrence: "WEEKLY" };
    const result = EventFormSchema.parse(data);
    expect(result.coordinator).toBe("Pastor John");
    expect(result.recurrence).toBe("WEEKLY");
  });

  it("rejects short location", () => {
    expect(() => EventFormSchema.parse({ ...validEvent, location: "X" })).toThrow();
  });
});

describe("GroupFormSchema", () => {
  it("accepts valid group data", () => {
    const data = { name: "Youth Group", description: "For young members" };
    const result = GroupFormSchema.parse(data);
    expect(result.name).toBe("Youth Group");
  });

  it("rejects short name", () => {
    expect(() => GroupFormSchema.parse({ name: "Y", description: "Test" })).toThrow();
  });
});

describe("BudgetFormSchema", () => {
  it("accepts valid budget data", () => {
    const data = { category: "Salaries", amount: 50000, month: "2026-07" };
    const result = BudgetFormSchema.parse(data);
    expect(result.amount).toBe(50000);
  });

  it("applies default spent of 0", () => {
    const data = { category: "Salaries", amount: 50000, month: "2026-07" };
    const result = BudgetFormSchema.parse(data);
    expect(result.spent).toBe(0);
  });

  it("rejects negative spent", () => {
    expect(() =>
      BudgetFormSchema.parse({ category: "Salaries", amount: 50000, spent: -10, month: "2026-07" })
    ).toThrow();
  });
});

describe("validateFormData", () => {
  it("returns data and empty errors on success", () => {
    const result = validateFormData(LoginFormSchema, { email: "a@b.com", password: "secret123" });
    expect(result.data).not.toBeNull();
    expect(result.errors).toEqual({});
  });

  it("returns null data and field errors on failure", () => {
    const result = validateFormData(LoginFormSchema, { email: "bad", password: "12" });
    expect(result.data).toBeNull();
    expect(result.errors).toHaveProperty("email");
    expect(result.errors).toHaveProperty("password");
  });

  it("handles deeply nested paths", () => {
    const result = validateFormData(SignupFormSchema, {
      name: "X",
      email: "bad",
      password: "1",
      confirmPassword: "2",
    });
    expect(result.data).toBeNull();
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it("returns generic error for non-Zod exceptions", () => {
    const throwingSchema = { parse: () => { throw new Error("Boom"); } };
    const result = validateFormData(throwingSchema as any, {});
    expect(result.data).toBeNull();
    expect(result.errors.form).toBe("Validation failed");
  });
});
