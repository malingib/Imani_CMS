export function mapGeminiErrorResponse(status: number, bodyText: string): { status: number; error: string } {
  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText) as { error?: { message?: string } | string };
      if (typeof parsed.error === "string" && parsed.error.trim()) {
        return { status, error: parsed.error.trim() };
      }
      if (typeof parsed.error === "object" && parsed.error?.message?.trim()) {
        return { status, error: parsed.error.message.trim() };
      }
    } catch {
      if (bodyText.trim()) {
        return { status, error: bodyText.trim() };
      }
    }
  }

  return { status, error: "AI service error" };
}
