import type { Request, Response, NextFunction } from "express";

export type Resource = "members" | "transactions" | "events" | "groups" | "communications" | "gemini" | "profile";
export type Action = "create" | "read" | "update" | "delete";

const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 100,
  PASTOR: 60,
  TREASURER: 50,
  SECRETARY: 40,
  MEMBER: 10,
};

const PERMISSIONS: Record<Resource, Record<Action, number>> = {
  members:      { create: 40, read: 10, update: 40, delete: 100 },
  transactions: { create: 50, read: 10, update: 50, delete: 100 },
  events:       { create: 40, read: 10, update: 40, delete: 60 },
  groups:       { create: 40, read: 10, update: 40, delete: 60 },
  communications: { create: 40, read: 10, update: 40, delete: 60 },
  gemini:       { create: 10, read: 10, update: 10, delete: 10 },
  profile:      { create: 0,  read: 10, update: 10, delete: 0 },
};

export function requireRole(resource: Resource, action: Action) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = (req.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const userLevel = ROLE_HIERARCHY[role ?? ""] ?? 0;
    const requiredLevel = PERMISSIONS[resource]?.[action] ?? 100;
    if (userLevel < requiredLevel) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };
}
