import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("MPESA_ALLOWED_ORIGIN") ?? "https://imani.co.ke",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: cors });

function normalizePhone(input: unknown): string {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return "254" + digits.slice(1);
  if (/^[17]\d{8}$/.test(digits)) return "254" + digits;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  throw new Error("Enter a valid Kenyan M-Pesa number, e.g. 0712345678.");
}
function callbackValue(items: Array<{Name?: string; Value?: unknown}>, name: string) {
  return items.find((item) => item.Name === name)?.Value;
}
async function accessToken(key: string, secret: string, environment: string) {
  const host = environment === "sandbox" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
  const response = await fetch(host + "/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: "Basic " + btoa(key + ":" + secret) },
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error("Daraja authentication failed.");
  return String(body.access_token);
}
function decodeBase64(value: string) {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
async function decryptSecrets(ciphertext: string, iv: string) {
  const keyValue = Deno.env.get("INTEGRATION_ENCRYPTION_KEY");
  if (!keyValue) throw new Error("Integration encryption key is not configured.");
  const rawKey = decodeBase64(keyValue);
  if (rawKey.length !== 32) throw new Error("Invalid integration encryption key.");
  const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodeBase64(iv) }, key, decodeBase64(ciphertext));
  return JSON.parse(new TextDecoder().decode(plain)) as Record<string, string>;
}
async function loadDarajaConfig(admin: ReturnType<typeof createClient>, churchId: string) {
  const { data: churchConfig, error: churchError } = await admin.from("integration_credentials")
    .select("enabled,config,secret_ciphertext,secret_iv").eq("scope", "church").eq("church_id", churchId).eq("provider", "daraja").maybeSingle();
  if (churchError) throw churchError;
  let row = churchConfig;
  if (!row?.enabled || !row.secret_ciphertext || !row.secret_iv) {
    const { data: platformConfig, error: platformError } = await admin.from("integration_credentials")
      .select("enabled,config,secret_ciphertext,secret_iv").eq("scope", "platform").is("church_id", null).eq("provider", "daraja").maybeSingle();
    if (platformError) throw platformError;
    row = platformConfig;
  }
  if (!row?.enabled || !row.secret_ciphertext || !row.secret_iv) return null;
  const secrets = await decryptSecrets(row.secret_ciphertext, row.secret_iv);
  const config = (row.config ?? {}) as Record<string, string>;
  const environment = String(config.environment ?? "production").toLowerCase();
  return {
    key: secrets.consumerKey, secret: secrets.consumerSecret, passkey: secrets.passkey,
    shortcode: String(config.shortcode ?? ""), callbackUrl: String(config.callbackUrl ?? ""),
    transactionType: String(config.transactionType ?? "CustomerPayBillOnline"),
    partyB: String(config.partyB ?? config.shortcode ?? ""),
    environment: environment === "sandbox" ? "sandbox" : "production",
  };
}
function darajaPassword(shortcode: string, passkey: string) {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return { timestamp, password: btoa(shortcode + passkey + timestamp) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) return json(500, { error: "Payment service is not configured." });
  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  let body: Record<string, any>;
  try { body = await req.json(); } catch { return json(400, { error: "Invalid JSON." }); }

  // Safaricom callback path: public endpoint, correlates only against a server-created checkout ID.
  if (body?.Body?.stkCallback) {
    const cb = body.Body.stkCallback;
    const checkoutId = String(cb.CheckoutRequestID ?? "");
    if (!checkoutId) return json(400, { error: "Missing checkout request ID." });
    const { data: intent, error: lookupError } = await admin
      .from("mpesa_payment_intents")
      .select("id,church_id,amount,phone_number,status")
      .eq("checkout_request_id", checkoutId).maybeSingle();
    if (lookupError || !intent) return json(200, { ResultCode: 0, ResultDesc: "Callback acknowledged." });

    const items = Array.isArray(cb.CallbackMetadata?.Item) ? cb.CallbackMetadata.Item : [];
    const amount = Number(callbackValue(items, "Amount"));
    const receipt = String(callbackValue(items, "MpesaReceiptNumber") ?? "");
    const phone = String(callbackValue(items, "PhoneNumber") ?? "");
    const resultCode = Number(cb.ResultCode);
    let status = resultCode === 0 ? "verification_required" : "failed";
    let description = String(cb.ResultDesc ?? "Daraja callback received").slice(0, 500);

    // A successful callback is only eligible for confirmation when key metadata matches
    // the original request. Mismatches never become a successful ledger entry.
    if (resultCode === 0 && (!receipt || !Number.isFinite(amount) ||
      amount !== Number(intent.amount) || (phone && phone !== intent.phone_number))) {
      status = "verification_required";
      description = "Callback received; payment metadata did not match the request and requires reconciliation.";
    }

    const update: Record<string, unknown> = {
      status,
      result_code: Number.isFinite(resultCode) ? resultCode : null,
      result_description: description,
      callback_payload: body,
      updated_at: new Date().toISOString(),
    };
    if (status === "succeeded") {
      update.mpesa_receipt_number = receipt;
      update.transaction_date = new Date().toISOString();
    }
    // Do not automatically mark successful until metadata checks pass.
    if (resultCode === 0 && status === "verification_required" && receipt &&
        Number.isFinite(amount) && amount === Number(intent.amount) &&
        (!phone || phone === intent.phone_number)) {
      update.mpesa_receipt_number = receipt;
      update.transaction_date = new Date().toISOString();
      update.status = "succeeded";
    }
    await admin.from("mpesa_payment_intents").update(update).eq("id", intent.id);
    return json(200, { ResultCode: 0, ResultDesc: "Callback acknowledged." });
  }

  // Initiation path: requires a valid signed-in Supabase user.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Sign-in required." });
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json(401, { error: "Invalid session." });

  const churchId = String(body.church_id ?? "");
  const amount = Number(body.amount);
  const purpose = String(body.purpose ?? "").trim();
  const memberId = body.member_id ? String(body.member_id) : null;
  let phone: string;
  try { phone = normalizePhone(body.phone_number); } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Invalid phone number." });
  }
  if (!/^[0-9a-f-]{36}$/i.test(churchId) || !Number.isInteger(amount) || amount < 1 || amount > 250000 ||
      purpose.length < 1 || purpose.length > 120) {
    return json(400, { error: "Valid church, whole-KES amount (1–250,000), and payment purpose are required." });
  }

  const { data: membership } = await admin.from("church_memberships")
    .select("id,role").eq("church_id", churchId).eq("user_id", userData.user.id)
    .eq("status", "active").maybeSingle();
  if (!membership) return json(403, { error: "You do not have access to this church." });

  let daraja: Awaited<ReturnType<typeof loadDarajaConfig>>;
  try { daraja = await loadDarajaConfig(admin, churchId); }
  catch { return json(500, { error: "Daraja configuration could not be read securely." }); }
  if (!daraja?.key || !daraja.secret || !daraja.shortcode || !daraja.passkey || !daraja.callbackUrl) {
    return json(503, { error: "Daraja is not enabled or its credentials are incomplete for this church." });
  }
  const { key, secret, shortcode, passkey, callbackUrl, environment, transactionType, partyB } = daraja;

  const accountReference = "IM" + crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const { data: intent, error: insertError } = await admin.from("mpesa_payment_intents").insert({
    church_id: churchId, member_id: memberId, created_by: userData.user.id,
    phone_number: phone, amount, purpose, account_reference: accountReference, status: "initiating",
  }).select("id").single();
  if (insertError || !intent) return json(500, { error: "Could not create payment request." });

  try {
    const token = await accessToken(key, secret, environment);
    const { timestamp, password } = darajaPassword(shortcode, passkey);
    const host = environment === "sandbox" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
    const response = await fetch(host + "/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: phone,
        PartyB: partyB || shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: purpose.slice(0, 13),
      }),
    });
    const result = await response.json();
    if (!response.ok || result.ResponseCode !== "0" || !result.CheckoutRequestID) {
      await admin.from("mpesa_payment_intents").update({
        status: "failed",
        result_description: String(result.errorMessage ?? result.ResponseDescription ?? "Daraja rejected the request").slice(0, 500),
      }).eq("id", intent.id);
      return json(502, { error: "Safaricom could not initiate the payment prompt." });
    }
    await admin.from("mpesa_payment_intents").update({
      status: "pending",
      merchant_request_id: result.MerchantRequestID,
      checkout_request_id: result.CheckoutRequestID,
      result_description: result.CustomerMessage ?? "STK Push sent.",
    }).eq("id", intent.id);
    return json(200, {
      payment_id: intent.id,
      status: "pending",
      customer_message: result.CustomerMessage ?? "Check your phone and enter your M-Pesa PIN.",
    });
  } catch {
    await admin.from("mpesa_payment_intents").update({
      status: "verification_required",
      result_description: "The initiation result was uncertain. Check Daraja before retrying.",
    }).eq("id", intent.id);
    return json(502, { error: "Payment initiation result is uncertain. Check payment status before retrying." });
  }
});
