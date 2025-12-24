
import { GoogleGenAI, Type } from "@google/genai";

export const generateSermonOutline = async (topic: string, scripture: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a seasoned Kenyan pastor. Create a structured sermon outline for the topic: "${topic}" based on scripture "${scripture}". Include an introduction, 3 main points with Kenyan context/examples, and a concluding call to action. Keep it inspiring and culturally relevant.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const analyzeFinances = async (transactions: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
