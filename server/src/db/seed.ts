import crypto from "crypto";
import { db } from "./index.js";
import {
  users,
  accounts,
  members,
  transactions,
  churchEvents,
  auditLogs,
} from "./schema/index.js";

async function seed() {
  const adminId = crypto.randomUUID();
  const adminEmail = "admin@imanichurch.org";
  const passwordHash = crypto.createHash("sha256").update("Admin@123").digest("hex");

  await db.insert(users).values({
    id: adminId,
    name: "Admin User",
    email: adminEmail,
    emailVerified: true,
  });

  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    userId: adminId,
    accountId: adminEmail,
    providerId: "credential",
    password: passwordHash,
  });

  const member1Id = crypto.randomUUID();
  const member2Id = crypto.randomUUID();

  await db.insert(members).values([
    {
      id: member1Id,
      firstName: "David",
      lastName: "Ochieng",
      phone: "+254712345678",
      email: "david.ochieng@example.com",
      location: "Nairobi",
      status: "Active",
      gender: "Male",
    },
    {
      id: member2Id,
      firstName: "Mary",
      lastName: "Wambui",
      phone: "+254723456789",
      email: "mary.wambui@example.com",
      location: "Nairobi",
      status: "Active",
      gender: "Female",
    },
  ]);

  await db.insert(transactions).values([
    {
      id: crypto.randomUUID(),
      memberId: member1Id,
      memberName: "David Ochieng",
      amount: "5000",
      type: "Tithe",
      paymentMethod: "M-Pesa",
      date: new Date().toISOString().split("T")[0],
      reference: "TITHE-001",
      category: "Income",
      notes: "Sunday service tithe",
    },
    {
      id: crypto.randomUUID(),
      memberId: member2Id,
      memberName: "Mary Wambui",
      amount: "4500",
      type: "Utility",
      paymentMethod: "Cash",
      date: new Date().toISOString().split("T")[0],
      reference: "UTILITY-001",
      category: "Expense",
      notes: "Monthly electricity bill",
    },
  ]);

  await db.insert(churchEvents).values({
    id: crypto.randomUUID(),
    title: "Sunday Worship Service",
    description: "Weekly Sunday worship service",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    location: "Main Church",
    type: "WORSHIP",
    coordinator: "Pastor John",
    recurrence: "WEEKLY",
  });

  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    userId: adminId,
    userName: "Admin User",
    action: "SEED_DATA",
    module: "SYSTEM",
    timestamp: new Date().toISOString(),
    severity: "INFO",
    metadata: { description: "Database seeded with initial data" },
  });

  console.log("Seed data inserted successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));
