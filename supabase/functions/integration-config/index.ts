import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("INTEGRATION_ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: cors });
type Provider = "daraja" | "mobiwave_sms";
type Scope = "platform" | "church";

function b64(bytes: Uint8Array) {
  let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s);
}
function unb64(s: string) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
async function cryptoKey() {
  const raw = Deno.env.get("INTEGRATION_ENCRYPTION_KEY");
  if (!raw) throw new Error("Integration encryption key is not configured");
  const bytes = unb64(raw);
  if (bytes.length !== 32) throw new Error("INTEGRATION_ENCRYPTION_KEY must be base64-encoded 32 bytes");
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encrypt(value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await cryptoKey(), new TextEncoder().encode(JSON.stringify(value)));
  return { secret_ciphertext: b64(new Uint8Array(cipher)), secret_iv: b64(iv) };
}
async function decrypt(ciphertext: string, iv: string) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await cryptoKey(), unb64(ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (!["GET", "POST"].includes(req.method)) return json(405, { error: "Method not allowed" });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json(401, { error: "Authentication required" });
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json(401, { error: "Invalid session" });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const input = req.method === "GET" ? Object.fromEntries(new URL(req.url).searchParams) : await req.json();
    const scope = input.scope as Scope;
    const churchId = typeof input.churchId === "string" ? input.churchId : null;
    const provider = input.provider as Provider;
    if (!["platform", "church"].includes(scope) || !["daraja", "mobiwave_sms"].includes(provider) ||
      (scope === "church" && !churchId) || (scope === "platform" && churchId)) {
      return json(400, { error: "Invalid integration scope or provider" });
    }

    if (scope === "platform") {
      const role = String(user.app_metadata?.role ?? user.app_metadata?.system_role ?? "").toLowerCase();
      if (!["superadmin", "platform_admin"].includes(role)) return json(403, { error: "Platform administrator permission required" });
    } else {
      const { data: membership, error: membershipError } = await admin.from("church_memberships")
        .select("role,status").eq("church_id", churchId).eq("user_id", user.id).maybeSingle();
      if (membershipError) throw membershipError;
      const role = String(membership?.role ?? "").toLowerCase();
      if (!membership || !["active", "approved"].includes(String(membership.status).toLowerCase()) ||
        !["admin", "administrator", "treasurer"].includes(role)) {
        return json(403, { error: "Church administrator or treasurer permission required" });
      }
    }

    let existing: Record<string, unknown> | null = null;
    if (scope === "platform") {
      const result = await admin.from("integration_credentials")
        .select("scope,church_id,provider,enabled,config,secret_ciphertext,secret_iv,updated_at")
        .eq("scope", "platform").is("church_id", null).eq("provider", provider).maybeSingle();
      if (result.error) throw result.error;
      existing = result.data;
    } else {
      const result = await admin.from("integration_credentials")
        .select("scope,church_id,provider,enabled,config,secret_ciphertext,secret_iv,updated_at")
        .eq("scope", "church").eq("church_id", churchId).eq("provider", provider).maybeSingle();
      if (result.error) throw result.error;
      existing = result.data;
    }

    if (req.method === "GET") {
      return json(200, { provider, scope, churchId, enabled: existing?.enabled ?? false,
        configured: Boolean(existing?.secret_ciphertext), config: existing?.config ?? {},
        updatedAt: existing?.updated_at ?? null });
    }

    const enabled = input.enabled === true;
    const config = input.config && typeof input.config === "object" && !Array.isArray(input.config) ? input.config : {};
    let ciphertext = existing?.secret_ciphertext ?? null;
    let iv = existing?.secret_iv ?? null;
    const incomingSecrets = input.secrets && typeof input.secrets === "object" && !Array.isArray(input.secrets) ? input.secrets : null;
    if (incomingSecrets && Object.values(incomingSecrets).some(v => typeof v === "string" && v.trim().length > 0)) {
      const previous = ciphertext && iv ? await decrypt(ciphertext, iv) : {};
      const merged: Record<string, string> = { ...(previous && typeof previous === "object" ? previous : {}) };
      for (const [key, value] of Object.entries(incomingSecrets)) {
        if (typeof value === "string" && value.trim()) merged[key] = value.trim();
      }
      const encrypted = await encrypt(merged); ciphertext = encrypted.secret_ciphertext; iv = encrypted.secret_iv;
    }
    const payload = { scope, church_id: scope === "church" ? churchId : null, provider, enabled, config,
      secret_ciphertext: ciphertext, secret_iv: iv, updated_by: user.id, updated_at: new Date().toISOString() };
    const { error: saveError } = await admin.from("integration_credentials").upsert(payload, { onConflict: "scope,church_id,provider" });
    if (saveError) throw saveError;
    return json(200, { provider, scope, churchId, enabled, configured: Boolean(ciphertext), config, updatedAt: payload.updated_at });
  } catch (error) {
    console.error("integration-config error", error instanceof Error ? error.message : "unknown");
    return json(500, { error: "Integration configuration could not be processed" });
  }
});