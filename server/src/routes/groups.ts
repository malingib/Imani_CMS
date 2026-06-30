import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authz.js";
import { db } from "../db/index.js";
import { groups } from "../db/schema/groups.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  memberCount: z.number().min(0).max(100_000).optional(),
});

router.get("/", requireRole("groups", "read"), async (_req, res) => {
  res.json(await db.select().from(groups));
});

router.get("/:id", requireRole("groups", "read"), async (req, res) => {
  const [group] = await db.select().from(groups).where(eq(groups.id, req.params.id as string));
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  res.json(group);
});

router.post("/", requireRole("groups", "create"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(groups).values({ id: crypto.randomUUID(), ...parsed.data } as any).returning();
  res.status(201).json(created);
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  memberCount: z.number().min(0).max(100_000).optional(),
});

router.patch("/:id", requireRole("groups", "update"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(groups).set(parsed.data as any).where(eq(groups.id, req.params.id as string)).returning();
  if (!updated) { res.status(404).json({ error: "Group not found" }); return; }
  res.json(updated);
});

router.delete("/:id", requireRole("groups", "delete"), async (req, res) => {
  const [deleted] = await db.delete(groups).where(eq(groups.id, req.params.id as string)).returning();
  if (!deleted) { res.status(404).json({ error: "Group not found" }); return; }
  res.json({ deleted: true });
});

export default router;
