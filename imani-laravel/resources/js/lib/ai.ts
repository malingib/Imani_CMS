export async function postAi<T = { response?: string }>(
  endpoint: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': token,
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `AI request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const ai = {
  dailyVerse: () => postAi<{ response: string }>('/ai/daily-verse'),
  sermonOutline: (topic: string, scripture: string) =>
    postAi<{ response: string }>('/ai/sermon-outline', { topic, scripture }),
  bibleReflection: (reference: string) =>
    postAi<{ response: string }>('/ai/bible-reflection', { reference }),
  inspirationalMessage: (topic: string) =>
    postAi<{ response: string }>('/ai/inspirational-message', { topic }),
  outreachScout: (query: string, latitude?: number, longitude?: number) =>
    postAi<{ response: string; groundingChunks: unknown[] }>('/ai/outreach-scout', {
      query,
      latitude,
      longitude,
    }),
  financeAnalysis: (transactions: unknown[]) =>
    postAi<{ summary: string; recommendations: string[] }>('/ai/finance-analysis', {
      transactions,
    }),
};
