import { supabase } from "../src/lib/supabase";

type GeminiResponse = {
  response?: string;
  error?: string;
};

async function invokeGemini(message: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<GeminiResponse>("gemini", {
    body: { message },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data?.response || "";
}

export const generateSermonOutline = async (topic: string, scripture: string) => {
  return invokeGemini(
    `Act as a seasoned Kenyan pastor. Create a structured sermon outline for the topic: "${topic}" based on scripture "${scripture}". Include an introduction, 3 main points with Kenyan context/examples, and a concluding call to action. Keep it inspiring and culturally relevant.`
  );
};

export const getBibleScriptureAndReflection = async (reference: string) => {
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
  const locationHint = latitude && longitude ? ` User coordinates: ${latitude}, ${longitude}.` : "";
  const text = await invokeGemini(
    `As a church outreach coordinator, find 3-4 specific real-world locations for this request: "${query}". Focus on public accessibility, safety, and community visibility in a Kenyan context.${locationHint}`
  );

  return { text, groundingChunks: [] };
};

export const analyzeFinances = async (transactions: unknown[]) => {
  const text = await invokeGemini(`Analyze these church transactions from a Kenyan context. Return strict JSON with keys "summary" and "recommendations" where recommendations is an array of strings. Transactions: ${JSON.stringify(transactions)}`);
  try {
    return JSON.parse(text || "{}");
  } catch {
    return {
      summary: text,
      recommendations: [],
    };
  }
};
