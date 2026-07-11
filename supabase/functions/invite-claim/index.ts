import { handleCors, corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
const ANON_KEY = Deno.env.get('VITE_SUPABASE_ANON_KEY') ?? '';

const JSON_HEADERS = { 'Content-Type': 'application/json', ...corsHeaders };

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), { status: 400, headers: JSON_HEADERS });
}

function serverError(message: string) {
  return new Response(JSON.stringify({ error: message }), { status: 500, headers: JSON_HEADERS });
}

function supabaseAdmin(method: string, path: string, body?: unknown) {
  const url = `${SUPABASE_URL!.replace(/\/$/, '')}/auth/v1/admin/${path.replace(/^\//, '')}`;
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY!}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function getUserByEmail(email: string): Promise<{ id: string; churchId?: string } | null> {
  const res = await supabaseAdmin('GET', `users?filter=email=eq.${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const json = await res.json();
  const users = Array.isArray(json) ? json : json?.users ?? [];
  const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const existingChurch = user.app_metadata?.church_id || user.user_metadata?.church_id;
  return { id: user.id, churchId: existingChurch ? String(existingChurch) : undefined };
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return serverError('Server configuration incomplete: missing SUPABASE_URL or SERVICE_ROLE_KEY');
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const { token, password, name } = (payload || {}) as Record<string, unknown>;
  if (!token || typeof token !== 'string') return badRequest('Invitation token is required');
  if (!password || typeof password !== 'string' || password.length < 6) return badRequest('Password must be at least 6 characters');
  if (!name || typeof name !== 'string' || name.trim().length < 1) return badRequest('Name is required');

  try {
    const inviteRes = await fetch(`${SUPABASE_URL}/rest/v1/invitations?token=eq.${encodeURIComponent(token)}&select=*`, {
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (!inviteRes.ok) {
      const errText = await inviteRes.text();
      console.error('invitation lookup failed', inviteRes.status, errText);
      return serverError('Failed to look up invitation');
    }

    const invites = await inviteRes.json();
    const invite = Array.isArray(invites) && invites.length > 0 ? invites[0] : null;

    if (!invite) return badRequest('Invalid or expired invitation token');
    if (invite.accepted_at) return badRequest('This invitation has already been accepted');
    if (new Date(invite.expires_at) < new Date()) return badRequest('This invitation has expired');

    const email: string = invite.email;
    const role: string = invite.role;
    const churchId: string = invite.church_id;

    let userId: string | null = null;
    let createdNew = false;

    const createRes = await supabaseAdmin('POST', 'users', {
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role },
      app_metadata: { provider: 'email', role, church_id: churchId },
    });

    if (createRes.ok) {
      const created = await createRes.json();
      userId = created?.id ?? null;
      createdNew = true;
    } else {
      const createErr = await createRes.json();
      const errMsg = createErr?.msg || createErr?.error || '';

      if (errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('already registered') || createRes.status === 409) {
        const existing = await getUserByEmail(email);
        if (!existing) return serverError('User already registered but could not be found via admin API');

        if (existing.churchId && existing.churchId !== churchId) {
          return badRequest('This email is already registered to another church. Contact your admin for access.');
        }

        userId = existing.id;

        const updateRes = await supabaseAdmin('PUT', `users/${userId}`, {
          email_confirm: true,
          user_metadata: { name: name.trim(), role },
          app_metadata: { provider: 'email', role, church_id: churchId },
        });

        if (!updateRes.ok) {
          const updateErr = await updateRes.text();
          console.error('user metadata update failed', updateRes.status, updateErr);
          return serverError('Failed to update user role');
        }
      } else {
        console.error('user creation failed', createRes.status, errMsg);
        return serverError('Failed to create user account');
      }
    }

    const acceptRes = await fetch(`${SUPABASE_URL}/rest/v1/invitations?id=eq.${invite.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ accepted_at: new Date().toISOString() }),
    });

    if (!acceptRes.ok) {
      console.error('failed to mark invitation accepted', await acceptRes.text());
    }

    return new Response(JSON.stringify({ success: true, email, userId }), { headers: JSON_HEADERS });
  } catch (error) {
    console.error('invite-claim function failed', error);
    return serverError('Unable to process invitation');
  }
});
