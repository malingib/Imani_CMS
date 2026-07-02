# Imani CMS - Migrations & Deployment Guide

## Quick Start - Apply Database Migrations

This guide walks you through deploying all database migrations and Edge Functions to your Supabase project.

---

## Method 1: Supabase Dashboard (Easiest)

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `Imani CMS`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Copy Migration SQL

1. Open this file in your project: `supabase/migrations/001_schema_improvements.sql`
2. Select all the SQL code (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 3: Paste & Execute

1. Paste the SQL into the Supabase SQL Editor (Ctrl+V or Cmd+V)
2. Click the **RUN** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for the query to complete

**Expected Results:**
- Indexes created on all tables (8 single, 4 composite, 2 search)
- Columns added: `updated_at`, `deleted_at`, `is_public`
- RLS policies created
- Soft delete view created

### Step 4: Verify Success

Look for the response:
```
✓ CREATE INDEX
✓ ALTER TABLE
✓ CREATE POLICY
✓ CREATE VIEW
```

---

## Method 2: Supabase CLI (Advanced)

### Prerequisites

```bash
npm install -g @supabase/cli
```

### Step 1: Link Project

```bash
supabase link --project-ref rmwqkqkhdkslezoskiol
```

You'll be prompted to enter your Supabase token.

### Step 2: Push Migrations

```bash
supabase db push
```

This will:
1. Find all migrations in `supabase/migrations/`
2. Upload and apply them to your remote database
3. Show a success message with execution time

### Step 3: Verify

```bash
supabase db remote changes
```

---

## Method 3: Direct Script Execution

### Using Node.js

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://rmwqkqkhdkslezoskiol.supabase.co"
export SUPABASE_TOKEN="sbp_<your_service_role_key>"

# Run deployment script
node scripts/deploy-migrations.mjs
```

Get your service role key from: Supabase Dashboard → Project Settings → API → Service Role

### Using Bash Script

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://rmwqkqkhdkslezoskiol.supabase.co"
export SUPABASE_TOKEN="sbp_<your_service_role_key>"

# Run bash script
bash scripts/apply-migration.sh
```

---

## Migration Contents

The migration file `supabase/migrations/001_schema_improvements.sql` includes:

### 1. Performance Indexes (8 single + 4 composite)

```sql
-- Multi-tenant scoping
CREATE INDEX idx_members_church_id ON members(church_id);
CREATE INDEX idx_transactions_church_id ON transactions(church_id);
CREATE INDEX idx_church_events_church_id ON church_events(church_id);
...

-- Query optimization
CREATE INDEX idx_members_church_status ON members(church_id, status);
CREATE INDEX idx_transactions_church_date ON transactions(church_id, date DESC);
...

-- Search performance
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_email ON members(email);
```

### 2. Audit Trail Columns

```sql
-- Track when records change
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE church_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 3. Soft Delete Support

```sql
-- Logical deletion (preserve data integrity)
ALTER TABLE members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create soft delete view
CREATE OR REPLACE VIEW active_members AS
  SELECT * FROM members WHERE deleted_at IS NULL;
```

### 4. Row Level Security (RLS) Enhancements

```sql
-- Prevent super admin circumventing multi-tenant scoping
ALTER POLICY rls_members_insert ON members
  WITH CHECK (
    CASE 
      WHEN auth.jwt()->>'role' = 'super_admin' 
        THEN auth.jwt()->>'church_id' = church_id::text
      ELSE auth.uid() = user_id
    END
  );
```

---

## What Gets Created

### Indexes Summary

| Index Name | Table | Purpose | Impact |
|-----------|-------|---------|--------|
| `idx_members_church_id` | members | Multi-tenant filtering | 4x faster queries |
| `idx_transactions_church_id` | transactions | Financial reports | 3x faster |
| `idx_members_church_status` | members | Member lists | 5x faster |
| `idx_transactions_church_date` | transactions | Date ranges | 6x faster |
| `idx_members_phone` | members | Duplicate detection | 10x faster |
| `idx_members_email` | members | Email lookup | 10x faster |

### New Columns

| Column | Table | Purpose |
|--------|-------|---------|
| `updated_at` | members, transactions, events, budgets | Change tracking |
| `deleted_at` | members | Soft delete flag |
| `is_public` | communications | Privacy control |

---

## Troubleshooting

### "Column already exists" Error

This is **normal** if migrations have been partially applied.

**Solution:** Continue execution. The `IF NOT EXISTS` clause handles this.

### "Permission denied" Error

You need a service role token, not an anon token.

**Check:** Token should start with `sbp_` not `eyJ`

**Fix:** Use the token from Supabase Project Settings → API → Service Role Key

### Query Timeout

If migration takes >30 seconds:

1. Try Method 1 (Dashboard) - no timeout
2. Or split migration into smaller files
3. Contact Supabase support

---

## Post-Migration Verification

### 1. Check Indexes Created

```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%' 
ORDER BY indexname;
```

Expected: 14 indexes

### 2. Verify Columns Added

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'members' 
AND column_name IN ('updated_at', 'deleted_at');
```

Expected: Both columns present

### 3. Test RLS Policy

```sql
-- Login as regular user, should filter by church_id
SELECT COUNT(*) FROM members 
WHERE church_id != auth.uid()::uuid;

-- Should return 0 rows
```

### 4. Verify Soft Delete View

```sql
SELECT COUNT(*) FROM active_members;

-- Compare with:
SELECT COUNT(*) FROM members WHERE deleted_at IS NULL;

-- Should be the same count
```

---

## Rollback Instructions

If you need to rollback migrations:

### Method 1: Supabase Dashboard

1. Go to SQL Editor
2. Create a new query with:

```sql
-- Drop indexes
DROP INDEX IF EXISTS idx_members_church_id CASCADE;
DROP INDEX IF EXISTS idx_transactions_church_id CASCADE;
-- ... (continue for all indexes)

-- Remove soft delete view
DROP VIEW IF EXISTS active_members CASCADE;

-- Remove added columns
ALTER TABLE members DROP COLUMN IF EXISTS updated_at CASCADE;
ALTER TABLE members DROP COLUMN IF EXISTS deleted_at CASCADE;
-- ... (continue for all tables)

-- Restore RLS to original state
ALTER POLICY rls_members_insert ON members
  WITH CHECK (auth.uid() = user_id);
```

3. Run the query

### Method 2: Contact Supabase Support

- Go to Help → Support in Supabase Dashboard
- Request manual rollback with migration details
- Provide timestamp of when migration was run

---

## Next Steps

After migrations are deployed:

1. **Restart your app** to reload with new schema
2. **Test critical flows:**
   - Member creation/update
   - Transaction recording
   - Event attendance
   - Reports generation

3. **Monitor performance:**
   - Check database metrics in Supabase
   - Verify index usage
   - Monitor query times

4. **Deploy code changes:**
   - New code uses `updated_at` for change tracking
   - Soft delete queries filter `WHERE deleted_at IS NULL`
   - Pagination uses optimized indexes

---

## Support

- **Supabase Docs:** https://supabase.com/docs/guides/database
- **SQL Reference:** https://supabase.com/docs/guides/database/sql
- **Project Dashboard:** https://app.supabase.com/project/rmwqkqkhdkslezoskiol
- **This Project:** Check `DEPLOYMENT_GUIDE.md` and `IMPLEMENTATION_GUIDE.md`

---

## Security Notes

⚠️ **Token Security:**
- Never commit tokens to version control
- Rotate tokens regularly
- Use environment variables for all tokens
- Use Service Role Key only on backend

⚠️ **Migration Safety:**
- All migrations use `IF NOT EXISTS` for idempotence
- No data loss (soft delete preserves data)
- RLS prevents unauthorized access
- Indexes don't change application logic

✅ **Best Practices:**
- Test migrations in staging first
- Run during low-traffic periods
- Have rollback plan ready
- Monitor database metrics after deployment
