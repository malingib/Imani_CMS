import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": Deno.env.get("MPESA_ALLOWED_ORIGIN") ?? "https://imani.co.ke", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const reply = (status: number, data: Record<string, unknown>) => new Response(JSON.stringify(data), { status, headers });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed." });
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization");
  if (!url || !serviceKey || !anonKey || !authorization?.startsWith("Bearer ")) return reply(401, { error: "Sign-in required." });

  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: userData, error: authError } = await userClient.auth.getUser();
  if (authError || !userData.user) return reply(401, { error: "Invalid session." });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(400, { error: "Invalid JSON." }); }
  const paymentId = String(body.payment_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return reply(400, { error: "Valid payment ID is required." });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: intent, error } = await admin.from("mpesa_payment_intents")
    .select("id,church_id,created_by,status,amount,purpose,phone_number,mpesa_receipt_number,result_description,created_at,updated_at")
    .eq("id", paymentId).maybeSingle();
  if (error || !intent) return reply(404, { error: "Payment request not found." });

  const { data: membership } = await admin.from("church_memberships").select("id")
    .eq("church_id", intent.church_id).eq("user_id", userData.user.id).eq("status", "active").maybeSingle();
  if (!membership || intent.created_by !== userData.user.id) return reply(403, { error: "You cannot view this payment request." });

  return reply(200, {
    payment_id: intent.id, status: intent.status, amount: intent.amount,
    purpose: intent.purpose, phone_number: intent.phone_number,
    receipt_number: intent.mpesa_receipt_number,
    message: intent.result_description, created_at: intent.created_at, updated_at: intent.updated_at,
  });
});
