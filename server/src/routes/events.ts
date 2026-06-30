import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { churchEvents, eventAttendance } from "../db/schema/events.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  time: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["WORSHIP", "BIBLE_STUDY", "PRAYER", "OUTREACH", "YOUTH", "OTHER"]).optional(),
  coordinator: z.string().optional(),
  contactPerson: z.string().optional(),
  rsvpDeadline: z.string().optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]).optional(),
});

router.get("/", async (_req, res) => {
  res.json(await db.select().from(churchEvents));
});

router.get("/:id", async (req, res) => {
  const [event] = await db.select().from(churchEvents).where(eq(churchEvents.id, req.params.id));
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(event);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(churchEvents).values({ id: crypto.randomUUID(), ...parsed.data } as any).returning();
  res.status(201).json(created);
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().min(1).optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["WORSHIP", "BIBLE_STUDY", "PRAYER", "OUTREACH", "YOUTH", "OTHER"]).optional(),
  coordinator: z.string().optional(),
  contactPerson: z.string().optional(),
  rsvpDeadline: z.string().optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]).optional(),
});

router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(churchEvents).set(parsed.data as any).where(eq(churchEvents.id, req.params.id)).returning();
  if (!updated) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const [deleted] = await db.delete(churchEvents).where(eq(churchEvents.id, req.params.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ deleted: true });
});

router.post("/:id/rsvp", async (req, res) => {
  const { memberId } = z.object({ memberId: z.string() }).parse(req.body);
  const existing = await db.select().from(eventAttendance)
    .where(and(eq(eventAttendance.eventId, req.params.id), eq(eventAttendance.memberId, memberId)));
  if (existing.length > 0) {
    await db.delete(eventAttendance).where(and(eq(eventAttendance.eventId, req.params.id), eq(eventAttendance.memberId, memberId)));
    res.json({ rsvpd: false });
  } else {
    await db.insert(eventAttendance).values({ eventId: req.params.id, memberId });
    res.json({ rsvpd: true });
  }
});

export default router;
