import { handleCors, corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "";

const JSON_HEADERS = { "Content-Type": "application/json", ...corsHeaders };

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] ?? char);
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return respond(405, { error: "Method not allowed." });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RESEND_API_KEY || !EMAIL_FROM || !APP_URL) {
    return respond(503, { success: false, error: "Password reset email service is not configured." });
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > 4_096) return respond(413, { success: false, error: "Request is too large." });
  let payload: unknown;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4_096) return respond(413, { success: false, error: "Request is too large." });
    payload = JSON.parse(raw);
  } catch {
    return respond(400, { success: false, error: "Invalid request body." });
  }

  const rawEmail = typeof payload === "object" && payload !== null && "email" in payload
    ? (payload as { email?: unknown }).email
    : null;
  if (typeof rawEmail !== "string" || rawEmail.length > 254) {
    return respond(400, { success: false, error: "A valid email is required." });
  }
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(400, { success: false, error: "A valid email is required." });
  }

  try {
    const resetResponse = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ type: "recovery", email, redirect_to: `${APP_URL.replace(/\/$/, "")}/login` }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!resetResponse.ok) {
      // Keep the same response for unknown addresses to prevent account enumeration.
      return respond(200, { success: true, message: "If an account exists, reset instructions will be sent." });
    }

    const resetJson = await resetResponse.json();
    const actionLink = resetJson?.data?.properties?.action_link || resetJson?.properties?.action_link;
    if (typeof actionLink !== "string" || !actionLink.startsWith("https://")) {
      return respond(200, { success: true, message: "If an account exists, reset instructions will be sent." });
    }

    const safeEmail = escapeHtml(email);
    const safeLink = escapeHtml(actionLink);
    const html = `<!doctype html><html><body style="margin:0;background:#f4f7f6;font-family:Arial,sans-serif;color:#173b3a"><main style="max-width:560px;margin:40px auto;background:#fff;padding:36px;border:1px solid #dfe9e5;border-radius:12px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#58726d">Imani CMS</p><h1 style="font-size:24px">Reset your password</h1><p>A password reset was requested for ${safeEmail}.</p><p style="margin:28px 0"><a href="${safeLink}" style="display:inline-block;padding:13px 20px;background:#173b3a;color:#fff;text-decoration:none;border-radius:7px">Reset password</a></p><p style="font-size:12px;color:#58726d">If you did not request this, you can ignore this email. The link is single-use and expires automatically.</p></main></body></html>`;
    const text = `A password reset was requested for ${email}. Reset your password using this link: ${actionLink}. If you did not request this, ignore this email.`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `imani-password-reset-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Reset your Imani CMS password",
        html,
        text,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!emailResponse.ok) {
      console.error("Password reset email provider failed", emailResponse.status);
      return respond(503, { success: false, error: "Unable to send reset instructions right now. Please try again later." });
    }

    return respond(200, { success: true, message: "If an account exists, reset instructions will be sent." });
  } catch (error) {
    console.error("Password reset request failed", error instanceof Error ? error.message : "Unknown error");
    return respond(503, { success: false, error: "Unable to process the reset request right now. Please try again later." });
  }
});
