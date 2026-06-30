import { Router } from "express";
import { eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authz.js";
import { bodyLimit } from "../middleware/body-limit.js";
import { db } from "../db/index.js";
import { members } from "../db/schema/members.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(requireAuth);

router.get("/", requireRole("members", "read"), async (req, res) => {
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

router.get("/:id", requireRole("members", "read"), async (req, res) => {
  const [member] = await db.select().from(members).where(eq(members.id, req.params.id as string));
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  res.json(member);
});

const createSchema = z.object({
  firstName: z.string().min(1).max(100), lastName: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(254), location: z.string().max(200).optional(),
  groups: z.array(z.string().max(100)).max(50).optional(),
  status: z.enum(["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]).optional(),
  joinDate: z.string().max(20).optional(), birthday: z.string().max(20).optional(),
  age: z.number().min(0).max(150).optional(), gender: z.string().max(20).optional(),
  maritalStatus: z.enum(["Single", "Married", "Widowed", "Divorced"]).optional(),
  membershipType: z.enum(["Full Member", "Probation", "Associate", "Clergy", "Non-Communicant"]).optional(),
  photo: z.string().max(500).optional(), stewardshipScore: z.number().min(0).max(100).optional(),
});

router.post("/", bodyLimit(2048), requireRole("members", "create"), async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const id = crypto.randomUUID();
    await db.insert(members).values({ id, ...parsed.data, groups: parsed.data.groups || [] } as any);
    const [created] = await db.select().from(members).where(eq(members.id, id));
    res.status(201).json(created);
  } catch (err) { logger.error(err, "Failed to create member"); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/bulk", bodyLimit(524288), requireRole("members", "create"), async (req, res) => {
  try {
    const schema = z.array(z.object({
      firstName: z.string().min(1).max(100), lastName: z.string().min(1).max(100),
      phone: z.string().min(1).max(20),
      email: z.string().email().max(254), location: z.string().max(200).optional(),
      status: z.enum(["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]).optional(),
    })).max(1000);
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const values = parsed.data.map((d) => ({ id: crypto.randomUUID(), ...d }));
    await db.insert(members).values(values as any);
    res.status(201).json({ count: values.length });
  } catch (err) { logger.error(err, "Bulk import failed"); res.status(500).json({ error: "Internal server error" }); }
});

const updateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(), lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(), email: z.string().email().max(254).optional(),
  location: z.string().max(200).optional(),
  groups: z.array(z.string().max(100)).max(50).optional(),
  status: z.enum(["Active", "Inactive", "Visitor", "Youth", "Deceased", "Archived"]).optional(),
  age: z.number().min(0).max(150).optional(), gender: z.string().max(20).optional(),
  maritalStatus: z.enum(["Single", "Married", "Widowed", "Divorced"]).optional(),
  membershipType: z.enum(["Full Member", "Probation", "Associate", "Clergy", "Non-Communicant"]).optional(),
  photo: z.string().max(500).optional(),
});

router.patch("/:id", requireRole("members", "update"), async (req, res) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const [updated] = await db.update(members).set({ ...parsed.data, updatedAt: new Date() } as any)
      .where(eq(members.id, req.params.id as string)).returning();
    if (!updated) { res.status(404).json({ error: "Member not found" }); return; }
    res.json(updated);
  } catch (err) { logger.error(err, "Failed to update member"); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/:id", requireRole("members", "delete"), async (req, res) => {
  const [deleted] = await db.delete(members).where(eq(members.id, req.params.id as string)).returning();
  if (!deleted) { res.status(404).json({ error: "Member not found" }); return; }
  res.json({ deleted: true });
});

export default router;
