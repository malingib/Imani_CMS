import { GoogleGenAI, Type } from "@google/genai";

export const generateSermonOutline = async (topic: string, scripture: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a seasoned Kenyan pastor. Create a structured sermon outline for the topic: "${topic}" based on scripture "${scripture}". Include an introduction, 3 main points with Kenyan context/examples, and a concluding call to action. Keep it inspiring and culturally relevant.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const generateShortInspirationalSermon = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short, powerful, 100-word inspirational message for a church WhatsApp group. Topic: "${topic}". Use Kenyan cultural nuances and include 1 relevant Bible verse. Format it with emojis suitable for WhatsApp.`,
    config: {
      temperature: 0.8,
    }
  });
  return response.text;
};

export const generateDailyVerse = async () => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  // Add a unique seed based on time to force variety
  const seed = new Date().getTime();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate one unique, powerful, and encouraging Bible verse. 
    Seed: ${seed}.
    Avoid repeating common verses like Jeremiah 29:11 or Psalm 23 unless they are exceptionally fitting.
    Focus on themes of hope, resilience, leadership, or community grace. 
    IMPORTANT: Return ONLY in this exact format: "Verse Text | Reference".
    Example: "For I know the plans I have for you... | Jeremiah 29:11"`,
    config: {
      temperature: 1.0, // Increased temperature for more variety
    }
  });
  return response.text;
};

export const scoutOutreachLocations = async (query: string, latitude: number, longitude: number) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find 3 public spaces or community centers near these coordinates for a church outreach event: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude
          }
        }
      }
    },
  });
  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const analyzeFinances = async (transactions: any[]) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const dataSummary = JSON.stringify(transactions);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these church transactions from a Kenyan context. Identify trends in Tithes vs Offerings, and provide 3 brief strategic recommendations for the church board to improve financial sustainability. Transactions: ${dataSummary}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "recommendations"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
