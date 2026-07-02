import { describe, expect, it } from "vitest";
import { mapGeminiErrorResponse } from "./gemini-edge";

describe("gemini edge helpers", () => {
  it("preserves upstream status codes and useful messages", () => {
    const quota = mapGeminiErrorResponse(429, '{"error":{"message":"Quota exceeded"}}');
    const auth = mapGeminiErrorResponse(401, "upstream auth failed");

    expect(quota).toEqual({ status: 429, error: "Quota exceeded" });
    expect(auth).toEqual({ status: 401, error: "upstream auth failed" });
  });

  it("falls back to generic message when upstream body is empty", () => {
    expect(mapGeminiErrorResponse(503, "")).toEqual({ status: 503, error: "AI service error" });
  });
});
