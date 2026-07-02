# Imani CMS

Church management platform with Supabase backend, AI-powered insights, and multi‑tenant platform operations.

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
- **Tests:** Vitest for unit tests, Playwright for e2e

## Environment

See `.env.example` for required variables.

## Roles & Permissions

| Role | Scope | Capabilities |
|------|-------|-------------|
| SUPER_ADMIN | Platform-wide | Create churches, manage platform settings, view all tenants |
| ADMIN | Church-wide | Manage members, events, finances, groups, settings |
| PASTOR | Church-wide (limited) | Manage members, sermons, groups; view finances |
| STAFF | Church-wide (operational) | Manage events, groups, communications |
| MEMBER | Self-service | View profile, activities, own giving |

RLS enforces this at the database level using `app_role()` and `app_church_id()` helper functions.

## Tenant Onboarding Flow

1. Church admin visits `/signup`, fills in church details + admin account
2. System creates a `churches` row with `status: 'trialing'` and `trial_end_date` = now + 30 days
3. Admin user is created with role `ADMIN`
4. Onboarding steps tracked in `churches.onboarding_step`: `profile` → `members` → `service` → `billing`
5. After trial, church enters an active subscription or is paused

## Migration Workflow

```bash
# Create a new migration
supabase migration new my_migration_name

# Apply to local DB (requires Docker)
supabase db push

# Apply to remote (linked project)
supabase db push --linked

# If Docker isn't available, paste the SQL into Supabase Dashboard SQL Editor
```

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
