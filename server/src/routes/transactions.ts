import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { transactions, transactionTypeEnum, paymentMethodEnum, transactionCategoryEnum } from "../db/schema/transactions.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const category = req.query.category as string | undefined;
  const type = req.query.type as string | undefined;
  let query: any = db.select().from(transactions).orderBy(desc(transactions.date));
  if (category) query = query.where(eq(transactions.category, category as any));
  if (type) query = query.where(eq(transactions.type, type as any));
  res.json(await query);
});

const createSchema = z.object({
  memberId: z.string().optional(), memberName: z.string().min(1), amount: z.number().positive(),
  type: z.enum(["Tithe","Offering","Project","Harambee","Benevolence","Expense","Salary","Utility","Maintenance"]),
  paymentMethod: z.enum(["M-Pesa","Cash","Bank Transfer","Cheque"]),
  date: z.string(), reference: z.string().min(1), category: z.enum(["Income","Expense"]),
  notes: z.string().optional(), phoneNumber: z.string().optional(),
  source: z.enum(["MANUAL","INTEGRATED"]).default("MANUAL"),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(transactions).values({ id: crypto.randomUUID(), ...parsed.data } as any).returning();
  res.status(201).json(created);
});

const updateSchema = z.object({
  memberId: z.string().optional(), memberName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["Tithe","Offering","Project","Harambee","Benevolence","Expense","Salary","Utility","Maintenance"]).optional(),
  paymentMethod: z.enum(["M-Pesa","Cash","Bank Transfer","Cheque"]).optional(),
  date: z.string().optional(), reference: z.string().min(1).optional(),
  category: z.enum(["Income","Expense"]).optional(),
  notes: z.string().optional(), phoneNumber: z.string().optional(),
  source: z.enum(["MANUAL","INTEGRATED"]).optional(),
});

router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(transactions).set(parsed.data as any).where(eq(transactions.id, req.params.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db.delete(transactions).where(eq(transactions.id, req.params.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ deleted: true });
});

export default router;
