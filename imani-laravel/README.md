# Imani CMS — Laravel + React (Inertia)

Church management SaaS migrated from React SPA + Supabase to **Laravel 13 + Inertia 3 + React 19**.

## Stack

- **Backend:** Laravel 13, Fortify, Eloquent, PostgreSQL
- **Frontend:** React 19, Inertia 3, Tailwind 4, recharts, lucide-react
- **AI:** Gemini via `GeminiService` (`/ai/*` routes)
- **Payments:** M-Pesa Daraja STK Push for member giving and platform subscriptions
- **Tenancy:** Single-DB `church_id` scoping + SUPER_ADMIN platform layer

## Quick start

Requires **PHP 8.2+**, **Composer**, **PostgreSQL**, **Node 20+**.

```bash
cd imani-laravel
composer install
cp .env.example .env
php artisan key:generate

# Configure DB + GEMINI_API_KEY + MPESA_* in .env
php artisan migrate --seed

npm install
npm run build
php artisan serve
```

Visit `http://localhost:8000`

## Demo accounts (password: `password`)

| Email | Role |
|-------|------|
| superadmin@imani.test | SUPER_ADMIN |
| admin@demo-church.test | ADMIN |
| pastor@demo-church.test | PASTOR |
| treasurer@demo-church.test | TREASURER |
| secretary@demo-church.test | SECRETARY |
| david.ochieng@example.com | MEMBER |

## Project structure

```
imani-laravel/
├── app/
│   ├── Http/Controllers/     # Inertia controllers + CRUD
│   ├── Models/               # Eloquent (18 domain + platform)
│   ├── Services/             # GeminiService, MpesaService, AuditLogger
│   └── Traits/BelongsToChurch.php
├── resources/js/
│   ├── legacy/               # Original UI components (preserved UX)
│   ├── pages/                # Inertia pages (thin wrappers)
│   ├── layouts/              # AppLayout, AuthLayout
│   └── components/           # AppSidebar, ToastProvider, brand
├── database/migrations/      # Ported from Supabase SQL
└── routes/web.php            # All church + platform routes
```

## UI preservation

Original components live in `resources/js/legacy/` with **unchanged Tailwind classes**. Inertia pages wrap them in `AppLayout` and pass server data as props.

Brand tokens: navy `#1E293B`, gold `#FFB800`, indigo `#4F46E5` — see `tailwind.config.js`.

## Routes

| Area | Examples |
|------|----------|
| Church | `/dashboard`, `/members`, `/finance`, `/events`, … |
| Member | `/portal`, `/giving` |
| Platform | `/platform`, `/platform/tenants`, … |
| AI | `POST /ai/daily-verse`, `/ai/sermon-outline`, … |
| M-Pesa | `POST /giving/mpesa/stk-push`, `/billing/mpesa/stk-push`, `/mpesa/callback` |

## M-Pesa Daraja

Both **member giving** and **church subscription billing** use Safaricom STK Push.

Set in `.env`:

```
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-domain.com/mpesa/callback
MPESA_TIER_BASIC_KES=2500
MPESA_TIER_PRO_KES=4500
```

For local sandbox testing, expose your app via ngrok and set `MPESA_CALLBACK_URL` to the public URL. Safaricom sandbox test phone: `254708374149`.

Flow:
1. User initiates payment → STK Push to handset
2. Safaricom POSTs to `/mpesa/callback`
3. `MpesaService` fulfills giving (creates finance transaction) or subscription (extends `paid_until`)

## Legacy SPA

The original Supabase SPA remains in the repo root (`components/`, `supabase/`). Use `imani-laravel/` for all new development.

## Next steps

1. Install PHP 8.2+ and Composer (`sudo apt install php-cli php-pgsql composer` on Ubuntu/Pop!_OS)
2. Run the setup script: `bash scripts/setup-dev.sh` (installs deps, migrates, runs `boost:install`)
3. Set `GEMINI_API_KEY` and `MPESA_*` in `.env`
4. Deploy to Laravel Cloud (Growth plan recommended)

Or manually:

```bash
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
composer require laravel/boost --dev   # already in composer.json
php artisan boost:install              # interactive — enable Cursor MCP
```

## E2E tests (Playwright)

Targets Laravel Inertia routes at `http://localhost:8000` with real Fortify session auth (no Supabase mocks).

```bash
# Prerequisites: PHP, PostgreSQL, migrated + seeded DB
php artisan migrate:fresh --seed
npm install
npx playwright install chromium
npm run test:e2e          # headless
npm run test:e2e:ui       # interactive UI
npm run test:e2e:report   # open HTML report
```

Specs live in `e2e/specs/` (login, platform, tenants). Demo login: `superadmin@imani.test` / `password`.

To use an already-running server: `E2E_SKIP_SERVER=1 npm run test:e2e`

Legacy Supabase E2E specs remain in the repo root `e2e/` for the old SPA.

See also: [docs/laravel-migration-plan.md](../docs/laravel-migration-plan.md)
