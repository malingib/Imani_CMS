import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authz.js";
import { db } from "../db/index.js";
import { churchEvents, eventAttendance } from "../db/schema/events.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  date: z.string().min(1).max(20),
  time: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  type: z.enum(["WORSHIP", "BIBLE_STUDY", "PRAYER", "OUTREACH", "YOUTH", "OTHER"]).optional(),
  coordinator: z.string().max(100).optional(),
  contactPerson: z.string().max(100).optional(),
  rsvpDeadline: z.string().max(20).optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]).optional(),
});

router.get("/", requireRole("events", "read"), async (_req, res) => {
  res.json(await db.select().from(churchEvents));
});

router.get("/:id", requireRole("events", "read"), async (req, res) => {
  const [event] = await db.select().from(churchEvents).where(eq(churchEvents.id, req.params.id as string));
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(event);
});

router.post("/", requireRole("events", "create"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [created] = await db.insert(churchEvents).values({ id: crypto.randomUUID(), ...parsed.data } as any).returning();
  res.status(201).json(created);
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  date: z.string().min(1).max(20).optional(),
  time: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  type: z.enum(["WORSHIP", "BIBLE_STUDY", "PRAYER", "OUTREACH", "YOUTH", "OTHER"]).optional(),
  coordinator: z.string().max(100).optional(),
  contactPerson: z.string().max(100).optional(),
  rsvpDeadline: z.string().max(20).optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]).optional(),
});

router.patch("/:id", requireRole("events", "update"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [updated] = await db.update(churchEvents).set(parsed.data as any).where(eq(churchEvents.id, req.params.id as string)).returning();
  if (!updated) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(updated);
});

router.delete("/:id", requireRole("events", "delete"), async (req, res) => {
  const [deleted] = await db.delete(churchEvents).where(eq(churchEvents.id, req.params.id as string)).returning();
  if (!deleted) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ deleted: true });
});

router.post("/:id/rsvp", requireRole("events", "read"), async (req, res) => {
  const { memberId } = z.object({ memberId: z.string().max(100) }).parse(req.body);
  const existing = await db.select().from(eventAttendance)
    .where(and(eq(eventAttendance.eventId, req.params.id as string), eq(eventAttendance.memberId, memberId)));
  if (existing.length > 0) {
    await db.delete(eventAttendance).where(and(eq(eventAttendance.eventId, req.params.id as string), eq(eventAttendance.memberId, memberId)));
    res.json({ rsvpd: false });
  } else {
    await db.insert(eventAttendance).values({ eventId: req.params.id as string, memberId });
    res.json({ rsvpd: true });
  }
});

export default router;
