import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string; emailVerified: boolean; image: string | null; createdAt: Date; updatedAt: Date; } | undefined;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const headers = new Headers();
    if (req.headers.authorization) headers.set("authorization", req.headers.authorization);
    if (req.headers.cookie) headers.set("cookie", req.headers.cookie);
    const session = await auth.api.getSession({ headers });
    if (!session) { res.status(401).json({ error: "Unauthorized" }); return; }
    req.user = session.user as Express.Request["user"];
    next();
  } catch { res.status(401).json({ error: "Unauthorized" }); }
}
