import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "";
const HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
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
  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY || !RESEND_API_KEY || !EMAIL_FROM || !APP_URL) {
    return respond(503, { error: "Invitation email delivery is not configured. Contact the platform administrator." });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(401, { error: "Sign in to send an invitation." });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  const user = authData.user;
  if (authError || !user) return respond(401, { error: "Your session is invalid or expired." });

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4_096) return respond(413, { error: "Request is too large." });
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return respond(400, { error: "Invalid request body." });
  }

  const invitationId = typeof body.invitationId === "string" ? body.invitationId : "";
  const churchId = typeof body.churchId === "string" ? body.churchId : "";
  if (!/^[0-9a-f-]{36}$/i.test(invitationId) || !/^[0-9a-f-]{36}$/i.test(churchId)) {
    return respond(400, { error: "A valid invitation and church are required." });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const isPlatformOwner = user.app_metadata?.role === "SUPER_ADMIN";
  if (!isPlatformOwner) {
    const { data: membership, error: membershipError } = await admin
      .from("church_memberships")
      .select("role")
      .eq("church_id", churchId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (membershipError || membership?.role !== "ADMIN") {
      return respond(403, { error: "Only an active church administrator can send staff invitations." });
    }
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("id,church_id,email,role,token,expires_at,accepted_at")
    .eq("id", invitationId)
    .eq("church_id", churchId)
    .maybeSingle();
  if (invitationError || !invitation) return respond(404, { error: "Invitation not found." });
  if (invitation.accepted_at || new Date(invitation.expires_at).getTime() <= Date.now()) {
    return respond(409, { error: "This invitation has already been accepted or has expired." });
  }

  const { data: church, error: churchError } = await admin
    .from("churches")
    .select("name")
    .eq("id", churchId)
    .maybeSingle();
  if (churchError || !church) return respond(404, { error: "Church workspace not found." });

  const inviteUrl = new URL("/accept-invite", APP_URL);
  inviteUrl.searchParams.set("token", invitation.token);
  const churchName = String(church.name);
  const safeChurch = escapeHtml(churchName);
  const safeRole = escapeHtml(String(invitation.role));
  const safeEmail = escapeHtml(String(invitation.email));
  const link = inviteUrl.toString();
  const html = `<!doctype html><html><body style="margin:0;background:#f4f7f6;font-family:Arial,sans-serif;color:#173b3a"><main style="max-width:560px;margin:40px auto;background:#fff;padding:36px;border:1px solid #dfe9e5;border-radius:12px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#58726d">Imani CMS</p><h1 style="font-size:24px">You are invited to join ${safeChurch}</h1><p>You have been invited as <strong>${safeRole}</strong> using ${safeEmail}.</p><p>Use the secure invitation link below to create your account and access your church workspace. This link expires on ${escapeHtml(new Date(invitation.expires_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }))}.</p><p style="margin:28px 0"><a href="${escapeHtml(link)}" style="display:inline-block;padding:13px 20px;background:#173b3a;color:#fff;text-decoration:none;border-radius:7px">Accept invitation</a></p><p style="font-size:12px;color:#58726d">If you were not expecting this invitation, you can ignore this email.</p></main></body></html>`;
  const text = `You are invited to join ${churchName} as ${invitation.role}. Accept your invitation: ${link}. This link expires on ${invitation.expires_at}.`;

  try {
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `imani-invitation-${invitation.id}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [invitation.email],
        subject: `Invitation to join ${churchName} on Imani CMS`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!providerResponse.ok) {
      console.error("Invitation email provider failed", providerResponse.status);
      return respond(502, { error: "Invitation was created, but email delivery failed. Check the email provider configuration and resend." });
    }
    const result = await providerResponse.json().catch(() => ({}));
    return respond(200, { success: true, providerMessageId: result?.id ?? null });
  } catch (error) {
    console.error("Invitation email request failed", error instanceof Error ? error.message : "Unknown error");
    return respond(502, { error: "Invitation was created, but email delivery could not be confirmed. Retry safely." });
  }
});
