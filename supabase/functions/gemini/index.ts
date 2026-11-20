import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return respond(405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
    return respond(503, { error: "AI service is not configured." });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(401, { error: "Sign in to use the AI assistant." });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  const user = authData.user;
  if (authError || !user) return respond(401, { error: "Your session is invalid or expired." });

  const role = user.app_metadata?.role;
  if (!["SUPER_ADMIN", "ADMIN", "PASTOR", "TREASURER", "SECRETARY"].includes(String(role))) {
    return respond(403, { error: "Your account is not permitted to use this AI service." });
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > 8_192) return respond(413, { error: "Message is too large." });
  let body: unknown;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) return respond(413, { error: "Message is too large." });
    body = JSON.parse(raw);
  } catch {
    return respond(400, { error: "Invalid request body." });
  }
  const message = (body as { message?: unknown } | null)?.message;
  if (typeof message !== "string" || !message.trim() || message.length > 5_000) {
    return respond(400, { error: "A message between 1 and 5000 characters is required." });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: allowed, error: rateError } = await admin.rpc("consume_gemini_rate_limit", {
    p_user_id: user.id,
    p_limit: 20,
    p_window_seconds: 60,
  });
  if (rateError) {
    console.error("Gemini rate-limit check failed", rateError.message);
    return respond(503, { error: "AI service is temporarily unavailable." });
  }
  if (allowed !== true) return respond(429, { error: "AI request limit reached. Try again in one minute." });

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return respond(503, { error: "AI service is not configured." });

  try {
    const upstream = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: message.trim() }] }] }),
        signal: AbortSignal.timeout(25_000),
      },
    );
    if (!upstream.ok) {
      console.error("Gemini upstream returned", upstream.status);
      return respond(upstream.status === 429 ? 429 : 502, {
        error: upstream.status === 429 ? "AI provider rate limit reached. Try again shortly." : "AI provider request failed.",
      });
    }
    const data = await upstream.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof responseText !== "string") return respond(502, { error: "AI provider returned an empty response." });
    return respond(200, { response: responseText });
  } catch (error) {
    console.error("Gemini request failed", error instanceof Error ? error.message : "Unknown error");
    return respond(502, { error: "AI service is temporarily unavailable." });
  }
});
