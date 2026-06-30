import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";
import { db } from "../db/index.js";
import { auditLogs } from "../db/schema/audit_logs.js";

interface Attempt {
  count: number;
  firstAt: number;
}

const attempts = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function key(email: string, ip: string): string {
  return `${email}::${ip}`;
}

function isLocked(k: string): boolean {
  const entry = attempts.get(k);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(k);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function increment(k: string): void {
  const entry = attempts.get(k);
  if (!entry) {
    attempts.set(k, { count: 1, firstAt: Date.now() });
    return;
  }
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(k, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count++;
}

export async function loginLockout(req: Request, res: Response, next: NextFunction): Promise<void> {
  const email = req.body?.email as string | undefined;
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!email) { next(); return; }

  const k = key(email, ip);
  if (isLocked(k)) {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: "system",
      userName: email,
      action: "Login blocked: account locked",
      module: "AUTH",
      timestamp: new Date().toISOString(),
      severity: "WARN",
    }).catch(() => {});
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    const b = body as Record<string, unknown> | null;
    if (b && !b.user && b.error) {
      increment(k);
      db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: email,
        userName: email,
        action: `Login failed: ${String(b.error)}`,
        module: "AUTH",
        timestamp: new Date().toISOString(),
        severity: "WARN",
      }).catch(() => {});
      logger.warn({ email, ip, remaining: MAX_ATTEMPTS - (attempts.get(k)?.count ?? 0) }, "Failed login attempt");
    }
    return originalJson(body);
  };

  next();
}
