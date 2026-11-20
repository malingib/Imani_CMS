# Imani CMS

Church management platform with Supabase backend and AI-powered insights. Imani has two authenticated workspaces: the platform-owner console and the church/client workspace. Church members are managed as administrative records; there is no member self-service portal.

## Setup

```bash
cp .env.example .env
# Fill in your Supabase URL + anon key
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run test:run` | Run Vitest unit tests |
| 
## Architecture

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Data layer:** `src/lib/` services with injectable clients for testability
- **Workspaces:** platform owner console and church/client administration; no member portal or personal giving dashboard
- **Tests:** Vitest for unit tests, Playwright for e2e

## Environment

See `.env.example` for required variables.

## Roles & Permissions

| Role | Scope | Capabilities |
|------|-------|-------------|
| SUPER_ADMIN | Platform-wide | Manage client registry, subscriptions, restrictions, suspensions, platform integrations and enter authorised church workspaces |
| ADMIN | Church-wide | Manage members, events, finances, groups, settings |
| PASTOR | Church-wide (limited) | Manage members, sermons, groups; view finance |
| TREASURER | Finance | Finance workflows and reports |
| SECRETARY | Operations | Manage members, events, communications |
| MEMBER | No dashboard access | Member records are managed by authorised church staff; member self-service is not available |

Database RLS and server-side role checks remain enabled. Church staff are resolved through active `church_memberships`; browser-supplied tenant IDs are not trusted. Platform owners can enter client workspaces through a server-authorised tenant selection flow. Platform navigation and routes are restricted to platform context and are not exposed inside a tenant workspace.

## Multi-Tenant Deployment

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the connected Imani Supabase project.
- Platform owners sign in to the platform console and manage clients through the Tenant Registry.
- Church staff resolve their tenant from trusted user app metadata plus an active `church_memberships` row; the browser cannot select an arbitrary tenant ID.
- Suspended and archived clients are blocked from church operations. Platform owners can review account status and restore eligible clients from the platform console.
- Member self-service is disabled. Member records, financial history and historical records remain managed by authorised church staff.
- New staff access is invitation-based; do not enable public self-registration in production.

## Provider Setup

1. **Supabase** — Create a project at supabase.com, copy your URL + anon key
2. **Gemini AI** (optional) — Get an API key from Google AI Studio, store it as a Supabase secret
3. **M-Pesa** (optional) — Configure via the Settings page after login

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Transactional email (Edge Functions)

Invitation and password-reset messages are sent server-side through Resend. Configure these as Supabase Edge Function secrets; never expose them as Vite/browser variables:

```sh
supabase secrets set RESEND_API_KEY=... EMAIL_FROM="Imani CMS <no-reply@your-verified-domain>"
supabase secrets set APP_URL=https://your-imani-domain
```

The sending domain must be verified with Resend. The password-reset endpoint is public by design, returns non-enumerating responses, and applies hashed per-email and per-IP rate limits. Staff invitation delivery requires a valid JWT and a current active ADMIN membership or current SUPER_ADMIN role. Deploy `send-invitation` and `password-reset` after applying their migrations.

## Admin User Setup

1. Provision the initial platform owner through the secured Supabase administration process.
2. Platform owners create client workspaces and invite the first church administrator.
3. Church administrators invite additional staff using the supported invitation workflow.
4. Membership roles are managed through the server-authorised membership RPCs; do not write role claims or membership rows directly from a browser client.
