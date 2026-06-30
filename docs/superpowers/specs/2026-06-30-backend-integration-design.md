# Backend Integration Design — Imani CMS

**Date:** 2026-06-30
**Status:** Approved

## Overview

Integrate a full backend (Express 5 + BetterAuth + Drizzle ORM + PostgreSQL) into the existing Imani CMS Vite + React 19 SPA. The frontend remains in place; mock data is replaced with real API calls. Backend patterns are adapted from the Keel template (Chafficui/keel) which shares the same tech stack.

## Architecture

```
imani-cms/
├── server/                          # Express 5 backend
│   ├── src/
│   │   ├── index.ts                 # Server entry, helmet, CORS, rate-limit, routes, graceful shutdown
│   │   ├── env.ts                   # Zod-validated environment variables
│   │   ├── auth/
│   │   │   └── index.ts             # BetterAuth (email/password, sessions, email verification)
│   │   ├── db/
│   │   │   ├── index.ts             # postgres.js + Drizzle ORM connection
│   │   │   └── schema/
│   │   │       ├── auth.ts          # BetterAuth tables: users, sessions, accounts, verifications
│   │   │       ├── members.ts       # Members table (extends users)
│   │   │       ├── transactions.ts  # Income/expense tracking
│   │   │       ├── events.ts        # Church events + attendance join table
│   │   │       ├── groups.ts        # Groups + group_members join table
│   │   │       ├── communications.ts# Communication logs
│   │   │       ├── activities.ts    # Member activity timeline
│   │   │       ├── budgets.ts       # Budget tracking
│   │   │       ├── sermons.ts       # Sermon archive
│   │   │       ├── notifications.ts # App notifications
│   │   │       ├── audit_logs.ts    # Audit trail
│   │   │       └── index.ts         # Re-exports all schemas + relations
│   │   ├── middleware/
│   │   │   ├── auth.ts              # requireAuth — validates session from Bearer token or cookie
│   │   │   ├── cors.ts              # Whitelist-based CORS
│   │   │   ├── rate-limit.ts        # 3 tiers: auth (5/min), API (60/min), public (30/min)
│   │   │   └── csrf.ts              # Origin/Referer validation for state-changing requests
│   │   ├── routes/
│   │   │   ├── health.ts            # GET /api/health
│   │   │   ├── profile.ts           # GET/PATCH /api/profile
│   │   │   ├── members.ts           # CRUD /api/members
│   │   │   ├── transactions.ts      # CRUD /api/transactions
│   │   │   ├── events.ts            # CRUD /api/events
│   │   │   ├── groups.ts            # CRUD /api/groups
│   │   │   ├── communications.ts    # POST /api/communications/broadcast
│   │   │   └── gemini.ts            # POST /api/gemini/chat
│   │   ├── services/
│   │   │   └── email.ts             # Resend email service
│   │   └── lib/
│   │       └── logger.ts            # Pino logger
│   ├── drizzle.config.ts            # Drizzle Kit config
│   ├── package.json                 # Backend dependencies
│   ├── tsconfig.json                # Backend TypeScript config
│   └── Dockerfile                   # Production container
├── src/                             # Frontend (existing, modified)
│   ├── lib/
│   │   ├── api.ts                   # Typed fetch client with auth headers, timeout, error handling
│   │   └── auth-client.ts           # BetterAuth React client (createAuthClient)
│   ├── hooks/
│   │   └── useAuth.ts              # Auth hook: login, signup, logout, useSession
│   ├── components/
│   │   └── ProtectedRoute.tsx       # Route guard with loading spinner + redirect
│   └── ...                          # Existing components unchanged except data source
├── docker-compose.yml               # PostgreSQL 16 + app
├── .env                             # Backend env vars added
├── package.json                     # Scripts for dev:server, dev
├── vite.config.ts                   # API proxy added
└── .gitignore                       # Server dist, node_modules
```

## Database Schema

### Auth Tables (BetterAuth managed)
- `users` — id, name, email, emailVerified, image, timestamps
- `sessions` — id, userId, token, expiresAt, ipAddress, userAgent
- `accounts` — id, userId, providerId, accountId, password hash, tokens
- `verifications` — id, identifier, value, expiresAt

### Domain Tables (mapped from existing types.ts)
- `members` — id (FK→users), firstName, lastName, phone, email, location, status (enum), joinDate, birthday, age, gender, maritalStatus, membershipType, photo, stewardshipScore, tenantId (for future multi-tenant)
- `transactions` — id, memberId, memberName, amount, type (enum), paymentMethod (enum), date, reference, category (Income/Expense), notes, phoneNumber, source (MANUAL/INTEGRATED)
- `church_events` — id, title, description, date, time, location, type (enum), coordinator, contactPerson, rsvpDeadline, recurrence, coordinates
- `event_attendance` — eventId, memberId (composite PK)
- `groups` — id, name, description, memberCount
- `group_members` — groupId, memberId (composite PK)
- `communication_logs` — id, type (SMS/Email/WhatsApp), recipientCount, targetGroupName, subject, content, date, status, sender, scheduledFor, deliveryBreakdown
- `member_activities` — id, memberId, type (enum), description, timestamp, metadata
- `budgets` — id, category, amount, spent, month
- `recurring_expenses` — id, category, amount, frequency, nextDate
- `sermons` — id, title, speaker, date, time, scripture, event, eventId, transcript
- `notifications` — id, title, message, time, type (enum), read
- `audit_logs` — id, userId, userName, action, module (enum), timestamp, severity (enum), metadata

All tables include `createdAt` and `updatedAt` timestamps.

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/* | No | BetterAuth (sign-in, sign-up, verify, reset) |
| GET | /api/health | No | Health check |
| GET | /api/profile | Yes | Get current user profile |
| PATCH | /api/profile | Yes | Update profile |
| GET | /api/members | Yes | List members (with search, filter, pagination) |
| POST | /api/members | Yes | Create member |
| POST | /api/members/bulk | Yes | Bulk import members |
| PATCH | /api/members/:id | Yes | Update member |
| DELETE | /api/members/:id | Yes | Delete member |
| GET | /api/transactions | Yes | List transactions |
| POST | /api/transactions | Yes | Create transaction |
| PATCH | /api/transactions/:id | Yes | Update transaction |
| DELETE | /api/transactions/:id | Yes | Delete transaction |
| GET | /api/events | Yes | List events |
| POST | /api/events | Yes | Create event |
| PATCH | /api/events/:id | Yes | Update event |
| DELETE | /api/events/:id | Yes | Delete event |
| POST | /api/events/:id/rsvp | Yes | RSVP to event |
| GET | /api/groups | Yes | List groups |
| POST | /api/groups | Yes | Create group |
| PATCH | /api/groups/:id | Yes | Update group |
| DELETE | /api/groups/:id | Yes | Delete group |
| POST | /api/communications/broadcast | Yes | Send broadcast |
| POST | /api/gemini/chat | Yes | Gemini AI chat |

## Frontend Changes

### New Files (copied/adapted from Keel)
- `src/lib/api.ts` — Typed API client with auth headers, timeout, error handling
- `src/lib/auth-client.ts` — BetterAuth `createAuthClient` with baseURL
- `src/hooks/useAuth.ts` — `login()`, `signup()`, `logout()`, `useSession()`
- `src/components/ProtectedRoute.tsx` — Auth guard with loading state + redirect

### Modified Files
- `App.tsx` — Remove mock state arrays, replace with `useEffect` + `apiGet()` calls in each render path. Keep the view switching and `renderView()` pattern. Pass data as props as before, but data comes from API.
- `Login.tsx` — Replace `localStorage` user storage with `useAuth().login()`. On success, navigate to dashboard.
- `vite.config.ts` — Add `server.proxy` for `/api` → `http://localhost:3005`
- `package.json` — Add scripts: `"dev:server"`, `"dev"` (concurrently frontend + server)
- `.env` — Add `DATABASE_URL`, `BETTER_AUTH_SECRET`, etc.

## Security (adapted from Keel)
- Helmet for security headers
- CORS with whitelist (frontend origin only)
- CSRF protection via Origin/Referer validation
- Rate limiting: auth (5/min), API (60/min), public (30/min)
- BetterAuth session cookies with httpOnly, secure, sameSite
- Zod validation on all API inputs
- Production guardrails (BETTER_AUTH_SECRET length check)

## Keel Patterns Reused (unchanged or trivially adapted)
- `backend/src/index.ts` → `server/src/index.ts` (add domain routes)
- `backend/src/auth/index.ts` → `server/src/auth/index.ts` (change baseURL/trustedOrigins)
- `backend/src/middleware/auth.ts` → `server/src/middleware/auth.ts` (identical)
- `backend/src/middleware/cors.ts` → `server/src/middleware/cors.ts` (change origins)
- `backend/src/middleware/rate-limit.ts` → `server/src/middleware/rate-limit.ts` (identical)
- `backend/src/middleware/csrf.ts` → `server/src/middleware/csrf.ts` (identical)
- `backend/src/db/index.ts` → `server/src/db/index.ts` (identical)
- `backend/src/env.ts` → `server/src/env.ts` (add domain vars)
- `backend/src/lib/logger.ts` → `server/src/lib/logger.ts` (identical)
- `frontend/src/lib/api.ts` → `src/lib/api.ts` (identical)
- `frontend/src/lib/auth-client.ts` → `src/lib/auth-client.ts` (identical)
- `frontend/src/hooks/useAuth.ts` → `src/hooks/useAuth.ts` (identical)
- `frontend/src/components/layout/ProtectedRoute.tsx` → `src/components/ProtectedRoute.tsx` (identical)

## Out of Scope (v1)
- Multi-tenant isolation (schema reserved via tenantId, logic deferred)
- Real-time WebSockets
- File uploads
- Mobile app (Capacitor)
- OAuth social providers
- PWA
