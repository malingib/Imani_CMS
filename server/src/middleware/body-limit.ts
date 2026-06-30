import type { Request, Response, NextFunction } from "express";

export function bodyLimit(maxBytes: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const len = parseInt(req.headers["content-length"] || "0", 10);
    if (!isNaN(len) && len > maxBytes) {
      res.status(413).json({ error: "Request too large" });
      return;
    }
    next();
  };
}
