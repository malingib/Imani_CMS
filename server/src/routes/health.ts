import { Router } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

const router = Router();
router.get("/", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch { res.status(503).json({ status: "error", message: "Database unavailable" }); }
});
export default router;
