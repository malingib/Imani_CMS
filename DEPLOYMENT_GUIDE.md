# Imani CMS Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase database migrations applied
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] All tests passing (`npm run test`)
- [ ] Sensitive data removed from code (API keys, tokens)
- [ ] Browser console has no errors in production build
- [ ] Mobile responsive design tested
- [ ] Core user flows tested (login, add member, finance, etc.)

---

## Environment Variables

### Required Variables

Create a `.env.production` file with:

```
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Optional: Stripe for billing
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional: Analytics
VITE_ANALYTICS_KEY=your-analytics-key
```

**Security Notes:**
- Never commit `.env.production` to version control
- Store secrets in your hosting provider's environment variable settings
- Use separate Supabase projects for development and production
- Rotate API keys regularly (quarterly minimum)

---

## Vercel Deployment (Recommended)

### 1. Connect Repository

```bash
vercel link
```

### 2. Configure Project

In Vercel dashboard:

1. Go to Settings → Environment Variables
2. Add all required variables
3. Set to production environment

### 3. Deploy

```bash
vercel --prod
```

Or automatically deploy on git push:
- Push to main branch triggers production deploy
- Push to feature branches triggers preview deploy

### 4. Monitor Deployment

- Check Vercel dashboard for build status
- View logs for any errors
- Test deployed site thoroughly

---

## Database Migrations

### Before First Deployment

Run Supabase migrations to set up indexes and improvements:

```bash
# Using Supabase CLI
supabase migration new schema_improvements

# Copy migration from /supabase/migrations/001_schema_improvements.sql
# Then apply:
supabase db push
```

### Production Migration Safety

1. **Test first:** Always test migrations in staging environment
2. **Backup:** Create database backup before running migrations
3. **Minimal downtime:** Plan migrations during low-traffic windows
4. **Monitoring:** Monitor database performance after migration

---

## Performance Optimization

### 1. Build Optimization

```bash
npm run build
```

Check bundle size:
```bash
npm run build -- --stats
```

Target sizes:
- Main bundle: < 300KB (gzipped)
- Lazy chunks: < 100KB each

### 2. Image Optimization

- Use WebP format where possible
- Compress SVGs and PNGs
- Implement lazy loading for images
- Consider CDN (Vercel provides automatic CDN)

### 3. Database Optimization

Already implemented:
- Indexes on `church_id` for multi-tenant queries
- Indexes on common filter fields
- Composite indexes for joins

Monitor with:
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## Security Configuration

### 1. HTTPS

✅ Automatically configured by Vercel
- All traffic redirected to HTTPS
- HSTS header enabled
- Certificate auto-renewed

### 2. CORS (Cross-Origin Resource Sharing)

Supabase handles CORS automatically. If issues:

```typescript
// In headers configuration
{
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Credentials': 'true'
}
```

### 3. CSP (Content Security Policy)

Add to vercel.json:
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    }]
  }]
}
```

### 4. Rate Limiting

For production, implement rate limiting on Supabase Edge Functions:

```typescript
// Example in Supabase Edge Function
const limiter = new RateLimiter();
if (!limiter.check(userId)) {
  throw new HTTPException(429, 'Rate limit exceeded');
}
```

### 5. Regular Security Audits

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

---

## Monitoring & Logging

### 1. Application Monitoring

Use Vercel Analytics:
- Web Vitals (LCP, FID, CLS)
- Performance metrics
- Error tracking

### 2. Database Monitoring

Supabase dashboard provides:
- Query performance
- Connection pooling status
- Storage usage
- Row counts per table

Alert thresholds:
- Database usage > 80%
- Query time > 1 second
- Error rate > 1%

### 3. Error Tracking

Configure Sentry for production:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/...',
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

---

## Scaling Considerations

### Database Scaling

- **Reads**: Supabase automatically handles read scaling
- **Writes**: Consider write replicas for high-volume scenarios
- **Storage**: Monitor and archive old audit logs (>1 year old)

### Application Scaling

Vercel handles automatic scaling:
- Auto-scales functions based on demand
- Global CDN for static assets
- Serverless functions in 35+ regions

### Recommended Architecture for 10K+ Churches

```
├── Frontend (Vercel)
│   ├── Main app (React)
│   └── API routes (serverless)
├── Database (Supabase)
│   ├── Main (Postgres)
│   └── Read replica (optional)
├── Storage (Vercel Blob)
│   └── Member photos, documents
└── Cache (Redis - Upstash)
    ├── Session cache
    └── Query cache
```

---

## Rollback Procedure

If deployment fails:

### Option 1: Vercel Rollback
```bash
vercel rollback
```

### Option 2: Manual Deployment
```bash
# Deploy previous commit
git checkout <previous-commit>
vercel --prod
```

### Option 3: Database Rollback

If schema changes caused issues:
```bash
# Supabase rollback
supabase db push --reset-schema
supabase db pull  # Restore from backup
```

---

## Testing in Production

### Smoke Tests

Essential checks after deployment:
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can add a member
- [ ] Can view members
- [ ] Financial transactions work
- [ ] Events display correctly
- [ ] Settings accessible

### Load Testing

For large-scale deployments:
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com

# Using k6
k6 run loadtest.js
```

---

## Maintenance

### Weekly
- Monitor error logs
- Check database performance
- Verify backups completed

### Monthly
- Review security audit logs
- Update dependencies
- Check disk space usage

### Quarterly
- Rotate API keys
- Review and update CSP headers
- Performance optimization review

---

## Troubleshooting

### Issue: Slow Dashboard Load

**Diagnosis:**
```sql
-- Check member count per church
SELECT church_id, COUNT(*) FROM members 
GROUP BY church_id ORDER BY COUNT(*) DESC;
```

**Solution:**
- Implement pagination (load first 50 members)
- Add lazy loading for tabs
- Use React.memo for components

### Issue: 500 Error on Member Create

**Check:**
1. Supabase status (https://status.supabase.com)
2. RLS policies allow operation
3. Required fields present in request

**Debug:**
```typescript
// Add detailed logging
try {
  const result = await createMember(member, churchId);
} catch (error) {
  console.error('Full error:', JSON.stringify(error, null, 2));
}
```

### Issue: High Database Costs

**Investigate:**
- N+1 queries (load entire table instead of paginating)
- Missing indexes on frequently-queried columns
- Unnecessary data loading

**Solutions:**
- Implement query optimization
- Add missing indexes (see migrations)
- Cache read-heavy queries

---

## Disaster Recovery

### Database Backup Strategy

Supabase provides automated backups:
- Daily backups (15-day retention)
- Point-in-time recovery available

Manual backup:
```bash
# Export database
pg_dump -Fc postgresql://user:pass@db.host/dbname > backup.dump

# Restore
pg_restore -d dbname backup.dump
```

### Data Recovery

**For deleted records:**
- Check soft_delete columns (deleted_at field)
- Query from member_change_log table for history

**For corrupted data:**
1. Stop application
2. Restore from backup
3. Notify users of data loss window
4. Resume application

---

## Performance Benchmarks

Target metrics for optimal experience:

| Metric | Target | Current |
|--------|--------|---------|
| Largest Contentful Paint (LCP) | < 2.5s | TBD |
| First Input Delay (FID) | < 100ms | TBD |
| Cumulative Layout Shift (CLS) | < 0.1 | TBD |
| Time to Interactive (TTI) | < 3.8s | TBD |
| API Response Time | < 200ms | TBD |

Monitor with:
```typescript
// Web Vitals measurement
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

---

## Emergency Contacts

- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Application Owner: [Contact info]

---

**Last Updated:** 2026-07-02
**Version:** 1.0
