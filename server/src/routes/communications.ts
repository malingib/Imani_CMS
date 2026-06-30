import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { communications } from "../db/schema/communications.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => { res.json(await db.select().from(communications)); });

const broadcastSchema = z.object({
  type: z.enum(["SMS","Email","WhatsApp"]), recipientCount: z.number(),
  targetGroupName: z.string(), subject: z.string().optional(), content: z.string().min(1),
  sender: z.string(),
});

router.post("/broadcast", async (req, res) => {
  const parsed = broadcastSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(communications).values({
    id: crypto.randomUUID(), ...parsed.data, date: new Date().toISOString(), status: "Sent",
    deliveryBreakdown: { delivered: parsed.data.recipientCount, opened: 0, failed: 0 },
  }).returning();
  res.status(201).json(created);
});

export default router;
