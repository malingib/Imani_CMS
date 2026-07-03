# EmailJS setup for Invites and Password Resets

This project uses EmailJS to send transactional emails (invitations). Password reset via EmailJS requires a small server-side helper (explained below).

## Install

From the project root run:

```bash
npm install
# or
npm install @emailjs/browser
```

## Environment variables

Create a `.env` or set Vite env vars in your deployment with the following keys (Vite exposes env vars that start with `VITE_`):

- `VITE_EMAILJS_PUBLIC_KEY` — your EmailJS public key (for browser use)
- `VITE_EMAILJS_SERVICE_ID` — EmailJS service id (e.g. `service_xxx`)
- `VITE_EMAILJS_TEMPLATE_INVITE_ID` — EmailJS template id for invites
- `VITE_EMAILJS_TEMPLATE_PASSWORD_RESET_ID` — EmailJS template id for password resets (optional)
- `VITE_APP_URL` — public URL for the app (used to build invite links)

For the Supabase service role key, store it separately as a backend-only secret named `SERVICE_ROLE_KEY`.

This project also uses a Supabase Edge Function at `supabase/functions/password-reset` to:

- generate a password recovery link with the Supabase admin API, and
- send the custom reset email through EmailJS.

Example `.env`:

```
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_INVITE_ID=template_invite_xxx
VITE_EMAILJS_TEMPLATE_PASSWORD_RESET_ID=template_reset_xxx
VITE_APP_URL=https://your-app.example.com
SERVICE_ROLE_KEY=your_service_role_key
```

After changing env, restart the dev server.

## EmailJS template variables

Create a template in EmailJS for invites that uses these variables:

- `to_email` — recipient email
- `token` — invitation token
- `invite_link` — full URL to accept invite
- `church_name` — optional church name
- `role` — role invited for

Create a template for password resets that uses:

- `to_email` — recipient email
- `reset_link` — full URL for resetting the password

## How invites work

- The frontend inserts an invitation row into the `invitations` table and generates a token.
- After insert, the app calls EmailJS to send the invite using the configured template and `invite_link`.

## Password reset notes

To send a fully functional password reset link (the Supabase reset token), you MUST generate the reset link server-side using a Supabase service role key (never expose this key in the browser). Recommended approaches:

1. Create a Supabase Edge Function or small server endpoint that:
   - Accepts an email address
   - Uses the Supabase Admin API / service role key to generate a password reset link for that email
   - Sends an email via EmailJS (server-side) or via a transactional email provider

2. Call that endpoint from the frontend instead of calling `supabase.auth.resetPasswordForEmail` directly.

If you'd like, I can scaffold the Supabase Edge Function and the server-side email sending next.
