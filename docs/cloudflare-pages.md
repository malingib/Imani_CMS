# Cloudflare Pages deployment

Imani CMS is a React + Vite static frontend backed by Supabase. Cloudflare Pages hosts the frontend; Supabase remains the backend.

## One-time Cloudflare setup

1. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and select `malingib/Imani_CMS`.
3. If using Cloudflare's native Git integration, set production branch to `main`, build command to `npm run build`, and output directory to `dist`. Add the Vite environment variables listed below in Pages **Settings → Environment variables**. This is the simplest setup and does not require the GitHub Actions deployment workflow.
4. Create the Pages project with the name `imani-cms`.
5. Under **Custom domains**, add `imani.co.ke` and `www.imani.co.ke`. Follow Cloudflare's prompts to verify and configure DNS. Do not delete existing mail, API, or other service records.
6. Test the `pages.dev` URL and sign-in, data loading, and client-side route refreshes before changing production DNS.

## Optional GitHub Actions deployment

The repository also includes `.github/workflows/cloudflare-pages.yml`. If using that workflow instead of Cloudflare's native Git integration, add these repository Actions secrets in **GitHub → Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` — token with Cloudflare Pages edit/deploy permission for the account.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.
- `VITE_SUPABASE_URL` — existing Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — existing Supabase publishable/anon key.
- `VITE_CHURCH_ID` — optional, only if this installation currently requires it.

Never commit these values or paste API tokens into issues or chat. The workflow deploys the built `dist` directory to the Pages project named `imani-cms`.

## Environment variables

The Vite values must be available during build. The Supabase anon/publishable key is intended for browser use; enforce access through Supabase RLS and never put a service-role key in a `VITE_*` variable.

## Cutover checklist

- Confirm the Cloudflare Pages deployment succeeds.
- Verify login/signup (unchanged), authenticated client workspace, superadmin workspace, finance/tithes, and hard refresh on nested routes.
- Verify Supabase auth redirect URLs and allowed origins include the new production hostname.
- Add the custom domains in Cloudflare Pages and verify HTTPS.
- Only after smoke tests pass, change the active production DNS/routing to Cloudflare Pages. Preserve unrelated DNS records.
- Keep the previous Vercel deployment available temporarily as rollback until the Cloudflare deployment is verified.
