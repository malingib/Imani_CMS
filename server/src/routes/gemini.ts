import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(requireAuth);

const chatSchema = z.object({ message: z.string().min(1).max(5000) });

router.post("/chat", async (req, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "Gemini API key not configured" }); return; }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: parsed.data.message });
    res.json({ response: response.text });
  } catch (err) {
    logger.error(err, "Gemini API error");
    res.status(500).json({ error: "AI service error" });
  }
});

export default router;
