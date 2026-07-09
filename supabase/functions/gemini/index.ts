import { handleCors, corsHeaders } from "../_shared/cors.ts";

function mapGeminiErrorResponse(status: number, bodyText: string): { status: number; error: string } {
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

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }) },
    );

    if (!response.ok) {
      const text = await response.text();
      const mapped = mapGeminiErrorResponse(response.status, text);
      console.error("Gemini upstream error", { status: response.status, body: text });
      return new Response(JSON.stringify({ error: mapped.error }), {
        status: mapped.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "AI service error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
