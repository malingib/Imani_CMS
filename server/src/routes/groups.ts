import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { groups } from "../db/schema/groups.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  memberCount: z.number().optional(),
});

router.get("/", async (_req, res) => {
  res.json(await db.select().from(groups));
});

router.get("/:id", async (req, res) => {
  const [group] = await db.select().from(groups).where(eq(groups.id, req.params.id));
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  res.json(group);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(groups).values({ id: crypto.randomUUID(), ...parsed.data } as any).returning();
  res.status(201).json(created);
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  memberCount: z.number().optional(),
});

router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(groups).set(parsed.data as any).where(eq(groups.id, req.params.id)).returning();
  if (!updated) { res.status(404).json({ error: "Group not found" }); return; }
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db.delete(groups).where(eq(groups.id, req.params.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Group not found" }); return; }
  res.json({ deleted: true });
});

export default router;
