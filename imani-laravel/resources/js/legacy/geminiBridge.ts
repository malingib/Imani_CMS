import { ai } from '@/lib/ai';

export const generateDailyVerse = async () => {
  const r = await ai.dailyVerse();
  return r.response;
};

export const generateShortInspirationalSermon = async (topic: string) => {
  const r = await ai.inspirationalMessage(topic);
  return r.response;
};

export const getBibleScriptureAndReflection = async (reference: string) => {
  const r = await ai.bibleReflection(reference);
  return r.response;
};

export const generateSermonOutline = async (topic: string, scripture: string) => {
  const r = await ai.sermonOutline(topic, scripture);
  return r.response;
};

export const scoutOutreachLocations = async (query: string, latitude?: number, longitude?: number) => {
  const r = await ai.outreachScout(query, latitude, longitude);
  return { text: r.response, groundingChunks: r.groundingChunks ?? [] };
};

export const analyzeFinances = async (transactions: unknown[]) => {
  return ai.financeAnalysis(transactions);
};
