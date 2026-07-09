import { supabase } from "../src/lib/supabase";

type GeminiResponse = {
  response?: string;
  error?: string;
};

const MAX_RESPONSE_LENGTH = 10000;

function validateInput(input: unknown, name: string): asserts input is string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
}

async function getFunctionErrorMessage(error: unknown): Promise<string> {
  const fallback = error instanceof Error ? error.message : "AI request failed";
  const context = (error as { context?: Response } | null)?.context;
  if (!context) return fallback;

  try {
    const payload = (await context.json()) as GeminiResponse;
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

async function invokeGemini(message: string): Promise<string> {
  if (!message || message.length > 5000) {
    throw new Error("Request too large");
  }

  const { data, error } = await supabase.functions.invoke<GeminiResponse>("gemini", {
    body: { message },
  });

  if (error) throw new Error(await getFunctionErrorMessage(error));
  if (data?.error) throw new Error(data.error);
  if (!data?.response) throw new Error("AI returned an empty response");

  return data.response.slice(0, MAX_RESPONSE_LENGTH);
}

export const generateSermonOutline = async (topic: string, scripture: string) => {
  validateInput(topic, "Topic");
  validateInput(scripture, "Scripture");
  return invokeGemini(
    `Act as a seasoned Kenyan pastor. Create a structured sermon outline for the topic: "${topic}" based on scripture "${scripture}". Include an introduction, 3 main points with Kenyan context/examples, and a concluding call to action. Keep it inspiring and culturally relevant.`
  );
};

export const getBibleScriptureAndReflection = async (reference: string) => {
  validateInput(reference, "Scripture reference");
  return invokeGemini(`Act as a Bible Scholar and Kenyan Pastor.
Task: Retrieve the text of the following scripture reference: "${reference}".
Provide the response in two parts:
1. The exact text of the verse(s).
2. A brief, 100-word reflection or "Exegesis" focusing on its application for a modern Kenyan congregation.

Format:
TEXT: [Verse text here]
REFLECTION: [Your reflection here]`);
};

export const generateShortInspirationalSermon = async (topic: string) => {
  validateInput(topic, "Topic");
  return invokeGemini(
    `Write a short, powerful, 100-word inspirational message for a church WhatsApp group. Topic: "${topic}". Use Kenyan cultural nuances and include 1 relevant Bible verse.`
  );
};

export const generateDailyVerse = async () => {
  const seed = new Date().getTime();
  return invokeGemini(`Generate one unique, powerful, and encouraging Bible verse.
Seed: ${seed}.
Avoid repeating common verses like Jeremiah 29:11 or Psalm 23 unless they are exceptionally fitting.
Focus on themes of hope, resilience, leadership, or community grace.
IMPORTANT: Return ONLY in this exact format: "Verse Text | Reference".`);
};

export const scoutOutreachLocations = async (query: string, latitude?: number, longitude?: number) => {
  validateInput(query, "Query");
  const locationHint = latitude && longitude ? ` User coordinates: ${latitude}, ${longitude}.` : "";
  const text = await invokeGemini(
    `As a church outreach coordinator, find 3-4 specific real-world locations for this request: "${query}". Focus on public accessibility, safety, and community visibility in a Kenyan context.${locationHint}`
  );

  return { text, groundingChunks: [] };
};

export const analyzeFinances = async (transactions: unknown[]) => {
  if (!Array.isArray(transactions)) throw new Error("Transactions must be an array");
  if (transactions.length === 0) return { summary: "No transactions to analyze", recommendations: [] };

  const text = await invokeGemini(`Analyze these church transactions from a Kenyan context. Return strict JSON with keys "summary" and "recommendations" where recommendations is an array of strings. Transactions: ${JSON.stringify(transactions)}`);
  try {
    const parsed = JSON.parse(text);
    if (!parsed.summary || !Array.isArray(parsed.recommendations)) {
      throw new Error("Missing required fields");
    }
    return parsed;
  } catch {
    return {
      summary: text,
      recommendations: [],
    };
  }
};
