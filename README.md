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
| `npm run lint` | Lint check |

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
| SUPER_ADMIN | Configured installation | Technical/support access to the configured church; no platform-wide tenant browsing |
| ADMIN | Church-wide | Manage members, events, finances, groups, settings |
| PASTOR | Church-wide (limited) | Manage members, sermons, groups; view finance |
| TREASURER | Finance | Finance workflows and reports |
| SECRETARY | Operations | Manage members, events, communications |
| MEMBER | No dashboard access | Member records are managed by authorised church staff; member self-service is not available |

Database RLS and server-side role checks remain enabled. The database retains church ownership IDs and membership-backed policies for compatibility and defense in depth; the application does not provide tenant switching.

## Single-Church Deployment

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Set `VITE_CHURCH_ID` to the church record assigned to this installation when using a `SUPER_ADMIN` account or when an account has more than one active church membership.
- If a normal user has exactly one active church membership, Imani resolves that church automatically.
- The platform owner console manages client workspaces; authorised church staff operate within their church/client workspace.
- Removing member self-service does not delete church member records, financial history, or historical database rows.

## Provider Setup

1. **Supabase** — Create a project at supabase.com, copy your URL + anon key
2. **Gemini AI** (optional) — Get an API key from Google AI Studio, store it as a Supabase secret
3. **M-Pesa** (optional) — Configure via the Settings page after login

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Admin User Setup

1. Sign up at the app URL — the first user is auto-assigned as church admin
2. Subsequent users are invited by existing admins
3. Or create manually via the Supabase Dashboard SQL Editor:

```sql
-- Insert into auth.users first, then:
INSERT INTO church_members (church_id, user_id, role)
VALUES ('church-uuid', 'user-uuid', 'ADMIN');
```
