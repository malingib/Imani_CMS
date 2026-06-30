import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authz.js";
import { bodyLimit } from "../middleware/body-limit.js";
import { db } from "../db/index.js";
import { transactions } from "../db/schema/transactions.js";

const router = Router();
router.use(requireAuth);

router.get("/", requireRole("transactions", "read"), async (req, res) => {
  const category = req.query.category as string | undefined;
  const type = req.query.type as string | undefined;
  let query: any = db.select().from(transactions).orderBy(desc(transactions.date));
  if (category) query = query.where(eq(transactions.category, category as any));
  if (type) query = query.where(eq(transactions.type, type as any));
  res.json(await query);
});

const createSchema = z.object({
  memberId: z.string().max(100).optional(), memberName: z.string().min(1).max(200),
  amount: z.number().positive().max(1_000_000_000),
  type: z.enum(["Tithe","Offering","Project","Harambee","Benevolence","Expense","Salary","Utility","Maintenance"]),
  paymentMethod: z.enum(["M-Pesa","Cash","Bank Transfer","Cheque"]),
  date: z.string().max(20), reference: z.string().min(1).max(100),
  category: z.enum(["Income","Expense"]),
  notes: z.string().max(1000).optional(), phoneNumber: z.string().max(20).optional(),
  source: z.enum(["MANUAL","INTEGRATED"]).default("MANUAL"),
});

router.post("/", bodyLimit(2048), requireRole("transactions", "create"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(transactions).values({ id: crypto.randomUUID(), ...parsed.data } as any).returning();
  res.status(201).json(created);
});

const updateSchema = z.object({
  memberId: z.string().max(100).optional(), memberName: z.string().min(1).max(200).optional(),
  amount: z.number().positive().max(1_000_000_000).optional(),
  type: z.enum(["Tithe","Offering","Project","Harambee","Benevolence","Expense","Salary","Utility","Maintenance"]).optional(),
  paymentMethod: z.enum(["M-Pesa","Cash","Bank Transfer","Cheque"]).optional(),
  date: z.string().max(20).optional(), reference: z.string().min(1).max(100).optional(),
  category: z.enum(["Income","Expense"]).optional(),
  notes: z.string().max(1000).optional(), phoneNumber: z.string().max(20).optional(),
  source: z.enum(["MANUAL","INTEGRATED"]).optional(),
});

router.patch("/:id", requireRole("transactions", "update"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(transactions).set(parsed.data as any).where(eq(transactions.id, req.params.id as string)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/:id", requireRole("transactions", "delete"), async (req, res) => {
  const [deleted] = await db.delete(transactions).where(eq(transactions.id, req.params.id as string)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ deleted: true });
});

export default router;
