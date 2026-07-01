# Supabase Migration Design

## Goal
Replace the Express 5 + BetterAuth + Drizzle ORM + PostgreSQL backend with Supabase-only architecture. Frontend talks directly to Supabase via JS client. Edge Functions for server-side logic (Gemini AI).

## Architecture Changes

### Removed
- `server/` directory (Express, Drizzle, BetterAuth, custom routes)
- `api/` directory (Vercel serverless entry)
- `src/lib/api.ts` (custom fetch client)
- Vite proxy for `/api` (no backend to proxy to)
- Helmet, CORS, rate-limit, CSRF middleware (handled by Supabase)
- Dozens of npm dependencies (express, helmet, cors, pino, postgres, drizzle, better-auth, etc.)

### Added
- `src/lib/supabase.ts` — Supabase JS client (anon key)
- `src/lib/supabase-auth.ts` — Auth helpers (signIn, signUp, signOut, useSession)
- `supabase/migrations/` — SQL files for domain tables
- `supabase/functions/gemini/` — Edge Function for Gemini AI
- `supabase/functions/_shared/cors.ts` — CORS helper for Edge Functions

### Changed
- `components/Login.tsx` — Supabase Auth instead of BetterAuth
- `components/ProtectedRoute.tsx` — Supabase session check
- `App.tsx` — data fetching via `supabase.from()` instead of local state
- `vercel.json` — Vite SPA only, no API function
- `vite.config.ts` — remove proxy

### Unchanged
- All UI components (Dashboard, Membership, etc.) — they use mock data locally, data source is the only change
- `types.ts` — shared types stay
- Frontend routing (state-based view switching)
- Tailwind CSS styling

## Data Flow
```
User → Frontend (React) → Supabase JS Client → Supabase (Auth + RLS + Postgres)
                                                      ↕
                                              Edge Functions (Gemini)
```

## Auth
- Supabase Auth handles sign-up, sign-in, sessions (built-in)
- Email/password authentication (matches BetterAuth setup)
- Session is managed by Supabase client (auto-refresh)
- `ProtectedRoute.tsx` checks `supabase.auth.getSession()`

## Database Tables (migrated from Drizzle)
All domain tables use `uuid` primary keys, `timestamptz` timestamps:
- members (with RLS: all authenticated read, SECRETARY+ write)
- transactions (all authenticated read, TREASURER+ write)
- church_events + event_attendance (authenticated read, SECRETARY+ write)
- groups + group_members (authenticated read, SECRETARY+ write)
- communications (authenticated read, SECRETARY+ write)
- activities (insert on action, read own)
- budgets + recurring_expenses (authenticated read, TREASURER+ write)
- sermons (public read)
- notifications (own read/update)
- audit_logs (ADMIN read-only)

## RLS Strategy
Each table gets:
1. `SELECT` — authenticated users with minimum role level (via `auth.jwt() ->> 'role'`)
2. `INSERT/UPDATE/DELETE` — specific roles based on resource

Role stored in `auth.users.raw_app_meta_data ->> 'role'` (set on signup).

## Edge Functions
- `gemini` — POST handler, receives `{ message }`, returns `{ response }`. Calls Google Gemini API with the API key stored as a Supabase secret.

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
- `GEMINI_API_KEY` — stored as Supabase secret for Edge Function

## Migration SQL
Generated from existing Drizzle schema definitions, converted to raw SQL with proper Supabase conventions (UUID primary keys, timestamptz, snake_case columns).
