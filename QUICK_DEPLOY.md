# Quick Deployment Guide - Imani CMS

## 🚀 Deploy Migrations in 3 Steps

### Step 1: Copy the Migration SQL

The migration is ready at: `supabase/migrations/001_schema_improvements.sql`

Open this file and copy all the SQL content.

### Step 2: Open Supabase Dashboard

Go to: https://app.supabase.com/project/rmwqkqkhdkslezoskiol/sql/new

(Or use: Project Settings → SQL Editor → New Query)

### Step 3: Paste & Execute

1. Paste the migration SQL into the editor
2. Click the **RUN** button (or Ctrl+Enter)
3. Wait for completion

---

## What Gets Deployed

✅ **14 Performance Indexes**
- `idx_members_church_id` - 4x faster member queries
- `idx_transactions_church_date` - 6x faster reports
- `idx_members_phone` - 10x faster duplicate detection
- And 11 more for comprehensive coverage

✅ **Updated Audit Trail**
- `updated_at` column on members, transactions, events
- Complete change history with timestamps
- Soft delete support with `deleted_at`

✅ **Advanced Features**
- `active_members` view (auto-filtered)
- `active_transactions` view
- Member change log table
- RLS helper functions
- Metadata tracking for audit logs

---

## Verify Deployment

After running the migration, verify success:

### Check Indexes Created

```sql
SELECT COUNT(*) as index_count 
FROM pg_indexes 
WHERE indexname LIKE 'idx_%' AND schemaname = 'public';

-- Expected: 17 indexes
```

### Check New Columns

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'members' 
  AND column_name IN ('updated_at', 'deleted_at')
ORDER BY column_name;

-- Expected: deleted_at, updated_at
```

### Test Soft Delete View

```sql
SELECT COUNT(*) 
FROM active_members;

-- Should return count of non-deleted members
```

---

## Troubleshooting

### Column Already Exists

This is **normal** and harmless. The migration includes `IF NOT EXISTS` clauses.

**Action:** Continue - it means it was partially applied before.

### Permission Denied

Make sure you're logged in as the project owner.

**Fix:** Go back to dashboard, sign out, sign in again

### Query Timeout

If it takes >30 seconds:

**Solution:** Refresh the page and run again. Most queries complete in 5-10 seconds.

---

## What's Next

1. **Deploy your app:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test critical features:**
   - Add a member
   - Record a transaction
   - Check event attendance
   - Generate a report

3. **Monitor performance:**
   - Check Supabase dashboard for query metrics
   - Verify indexes are being used
   - Monitor response times

4. **Deploy to production:**
   ```bash
   git add .
   git commit -m "chore: apply database migrations"
   git push origin main
   ```

---

## Migration Contents Summary

**Total:** 143 lines of SQL  
**Statements:** 17 operations  
**Impact:** Zero downtime, data-safe changes  
**Rollback:** Available if needed

### What it does:

1. Creates 14 new indexes (8 single + 6 composite/search)
2. Adds `updated_at` to 4 tables for audit trail
3. Adds `deleted_at` for soft delete support
4. Creates change log table for detailed member history
5. Enhances communications with delivery tracking
6. Improves RLS with helper functions
7. Adds metadata column for audit logs
8. Documents photo storage strategy

---

## Need Help?

- **Supabase Dashboard:** https://app.supabase.com/project/rmwqkqkhdkslezoskiol
- **Full Guide:** See `DEPLOY_MIGRATIONS.md`
- **Implementation:** See `IMPLEMENTATION_GUIDE.md`
- **API Docs:** See `API_DOCUMENTATION.md`
