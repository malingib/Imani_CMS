import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 5,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || "unknown",
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 60,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => (req as any).user?.id ?? (req.ip || req.socket.remoteAddress || "unknown"),
});

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 30,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || "unknown",
});
