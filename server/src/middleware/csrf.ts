import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) { next(); return; }
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigins = new Set<string>([env.FRONTEND_URL, env.BACKEND_URL]);
  if (origin) {
    if (allowedOrigins.has(origin)) { next(); return; }
    res.status(403).json({ error: "Forbidden: invalid origin" }); return;
  }
  if (referer) {
    try {
      if (allowedOrigins.has(new URL(referer).origin)) { next(); return; }
    } catch {}
    res.status(403).json({ error: "Forbidden: invalid origin" }); return;
  }
  res.status(403).json({ error: "Forbidden: missing origin" });
}
