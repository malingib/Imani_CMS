import { handleCors, corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY');
const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID');
const EMAILJS_TEMPLATE_PASSWORD_RESET_ID = Deno.env.get('EMAILJS_TEMPLATE_PASSWORD_RESET_ID');
const APP_URL = Deno.env.get('VITE_APP_URL') ?? Deno.env.get('APP_URL');

const JSON_HEADERS = { 'Content-Type': 'application/json', ...corsHeaders };

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), { status: 400, headers: JSON_HEADERS });
}

function serverError(message: string) {
  return new Response(JSON.stringify({ error: message }), { status: 500, headers: JSON_HEADERS });
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_PASSWORD_RESET_ID || !APP_URL) {
    return serverError('Server email reset configuration is incomplete');
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const email = typeof payload === 'object' && payload !== null && 'email' in payload ? (payload as any).email : null;
  if (!email || typeof email !== 'string') {
    return badRequest('A valid email is required');
  }

  try {
    const resetResponse = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        type: 'recovery',
        email,
        redirect_to: `${APP_URL}/login`,
      }),
    });

    const resetJson = await resetResponse.json();
    if (!resetResponse.ok) {
      const message = resetJson?.error || resetJson?.msg || 'Failed to generate password reset link';
      return serverError(message);
    }

    const actionLink = resetJson?.data?.properties?.action_link || resetJson?.properties?.action_link;
    if (!actionLink || typeof actionLink !== 'string') {
      return serverError('Could not generate password reset link');
    }

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_PASSWORD_RESET_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          reset_link: actionLink,
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('EmailJS error', errorText);
      return serverError('Failed to send password reset email');
    }

    return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
  } catch (error) {
    console.error('Password reset function failed', error);
    return serverError('Unable to process password reset request');
  }
});
