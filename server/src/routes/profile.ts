import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authz.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

const router = Router();
router.use(requireAuth);

router.get("/", requireRole("profile", "read"), (req, res) => { res.json({ user: req.user }); });

const updateSchema = z.object({ name: z.string().min(1).max(100).optional(), image: z.string().url().optional() });

router.patch("/", requireRole("profile", "update"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updateData["name"] = parsed.data.name;
  if (parsed.data.image !== undefined) updateData["image"] = parsed.data.image;
  const [updated] = await db.update(users).set(updateData).where(eq(users.id, req.user!.id)).returning();
  res.json({ user: updated });
});

export default router;
