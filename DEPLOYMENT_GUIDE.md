# Imani CMS Deployment Guide

## Production architecture

- **Frontend hosting:** Cloudflare Pages
- **Production domain:** `imani.co.ke` (existing Cloudflare Worker binding; do not replace without an approved cutover)
- **Pages project:** `imani-cms`
- **Git repository:** `malingib/Imani_CMS`
- **Production branch:** `main`
- **Build command:** `npm run build`
- **Build output:** `dist`
- **Frontend backend:** Supabase project `rmwqkqkhdkslezoskiol`
- **Supabase Edge Functions:** deployed and managed separately from Pages

Cloudflare Pages is the production deployment target. Do not deploy this application to Vercel.

## Cloudflare Pages configuration

The Pages project is configured to build from the GitHub repository's `main` branch. A push to `main` should trigger a production deployment when the Git integration webhook is active.

Required build-time variables (set separately for Production and Preview):

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://rmwqkqkhdkslezoskiol.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key |

The anon key is intended for browser use and is protected by Supabase Auth and Row Level Security. Never put a Supabase service-role key, Daraja secret, MobiWave API secret, or other server credential in a `VITE_*` variable. Provider credentials belong in the server-side Supabase integration/Vault configuration.

Cloudflare Pages settings:
- Framework preset: Vite (or no preset with the same build settings)
- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: use the version supported by the lockfile and current Cloudflare Pages build image

## Local verification

Run before merging application changes:

```bash
npm ci
npm run typecheck
npm run test:run
npm run build
```

Supabase Edge Functions are deployed separately. Type-check them with Deno:

```bash
deno check --node-modules-dir=auto supabase/functions/mpesa-stk/index.ts
deno check --node-modules-dir=auto supabase/functions/mpesa-status/index.ts
deno check --node-modules-dir=auto supabase/functions/mobiwave-send/index.ts
deno check --node-modules-dir=auto supabase/functions/mobiwave-status/index.ts
deno check --node-modules-dir=auto supabase/functions/invite-claim/index.ts
```

## Custom domains and cutover

The existing apex hostname `imani.co.ke` is attached to a separate Cloudflare Worker service named `imani`. Do not remove that Worker domain or its DNS record as part of a routine Pages setup.

The Pages project has a separate `www.imani.co.ke` custom-domain entry. Its CNAME target is `imani-cms.pages.dev`. Confirm Pages domain verification and certificate issuance before using it as a public production hostname.

Apex cutover to Pages requires an explicit migration plan for the existing Worker binding and its current traffic. Do not delete or overwrite the Worker-managed apex record without confirming the current service and an approved cutover window.

## Release verification

After a Git push to `main`:

1. Confirm a new Cloudflare Pages production deployment was created for the expected commit.
2. Confirm the install/build stages complete successfully and the deployment is marked successful.
3. Confirm the Pages deployment URL serves the app.
4. Confirm the custom domain is verified and its TLS certificate is active before routing users to it.
5. Test sign-in, platform-owner workspace, church/client workspace, tenant isolation, finance views, and settings.
6. Test M-Pesa and MobiWave SMS only after production provider credentials have been securely configured. A successful frontend deployment does not prove payment or SMS readiness.

## Database and provider configuration

Supabase schema migrations and Edge Function deployments are independent of Cloudflare Pages deployments. Review and apply database migrations through the approved Supabase migration workflow.

Configure Daraja and MobiWave SMS credentials through the application's secured integration settings/Vault flow. Do not store provider secrets in GitHub, Cloudflare frontend build variables, browser storage, or source files.

## Rollback

Use Cloudflare Pages deployment history to inspect and roll back a failed frontend release. A Pages rollback does not roll back Supabase database migrations or Edge Function versions; those require their own reviewed recovery procedures.
