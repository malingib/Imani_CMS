import { Router } from "express";
import { eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { members } from "../db/schema/members.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let query: any = db.select().from(members);
    const conditions: any[] = [];
    if (search) {
      conditions.push(like(members.firstName, `%${search}%`));
      conditions.push(like(members.lastName, `%${search}%`));
      conditions.push(like(members.email, `%${search}%`));
      conditions.push(like(members.phone, `%${search}%`));
    }
    if (conditions.length > 0) query = query.where(or(...conditions));
    if (status) query = query.where(eq(members.status, status as any));

    const result = await query.limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(members);
    res.json({ data: result, total: Number(count), page, limit });
  } catch (err) { logger.error(err, "Failed to fetch members"); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/:id", async (req, res) => {
  const [member] = await db.select().from(members).where(eq(members.id, req.params.id));
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  res.json(member);
});

const createSchema = z.object({
  firstName: z.string().min(1), lastName: z.string().min(1), phone: z.string().min(1),
  email: z.string().email(), location: z.string().optional(), groups: z.array(z.string()).optional(),
  status: z.enum(["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]).optional(),
  joinDate: z.string().optional(), birthday: z.string().optional(),
  age: z.number().optional(), gender: z.string().optional(),
  maritalStatus: z.enum(["Single", "Married", "Widowed", "Divorced"]).optional(),
  membershipType: z.enum(["Full Member", "Probation", "Associate", "Clergy", "Non-Communicant"]).optional(),
  photo: z.string().optional(), stewardshipScore: z.number().optional(),
});

router.post("/", async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const id = crypto.randomUUID();
    await db.insert(members).values({ id, ...parsed.data, groups: parsed.data.groups || [] } as any);
    const [created] = await db.select().from(members).where(eq(members.id, id));
    res.status(201).json(created);
  } catch (err) { logger.error(err, "Failed to create member"); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/bulk", async (req, res) => {
  try {
    const schema = z.array(z.object({
      firstName: z.string().min(1), lastName: z.string().min(1), phone: z.string().min(1),
      email: z.string().email(), location: z.string().optional(),
      status: z.enum(["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]).optional(),
    }));
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const values = parsed.data.map((d) => ({ id: crypto.randomUUID(), ...d }));
    await db.insert(members).values(values as any);
    res.status(201).json({ count: values.length });
  } catch (err) { logger.error(err, "Bulk import failed"); res.status(500).json({ error: "Internal server error" }); }
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(), lastName: z.string().min(1).optional(),
  phone: z.string().optional(), email: z.string().email().optional(), location: z.string().optional(),
  groups: z.array(z.string()).optional(),
  status: z.enum(["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]).optional(),
  age: z.number().optional(), gender: z.string().optional(),
  maritalStatus: z.enum(["Single", "Married", "Widowed", "Divorced"]).optional(),
  membershipType: z.enum(["Full Member", "Probation", "Associate", "Clergy", "Non-Communicant"]).optional(),
  photo: z.string().optional(),
});

router.patch("/:id", async (req, res) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const [updated] = await db.update(members).set({ ...parsed.data, updatedAt: new Date() } as any)
      .where(eq(members.id, req.params.id)).returning();
    if (!updated) { res.status(404).json({ error: "Member not found" }); return; }
    res.json(updated);
  } catch (err) { logger.error(err, "Failed to update member"); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db.delete(members).where(eq(members.id, req.params.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Member not found" }); return; }
  res.json({ deleted: true });
});

export default router;
