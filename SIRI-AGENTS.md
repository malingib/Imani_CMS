# SIRI — Imani CMS Agent Handoff

**Role:** Siri is the autonomous dev agent responsible for Imani CMS development, build health, and iterative improvement.

## Current State (Jul 6, 2026)

### Build
- **TypeScript:** 0 errors (`npx tsc --noEmit` passes clean)
- **Build:** `npm run build` succeeds (exit 0) — Vite bundles 2517 modules, ~1.3MB total (js+css) across 13 chunks
- **Dev server:** Running at `http://localhost:5175/` (port 5173/5174 in use)
- **Warnings** (non-blocking):
  - Recharts circular dependency warnings for `Bar` exports (3 files: DemographicsAnalysis, ReportsCenter, MyGiving)
  - `index-wz5doyx7.js` (799KB) exceeds 500KB chunk size warning

### Known Issues
1. **Dead code:** `components/AppViewRouter.tsx` is a duplicate router — never imported anywhere. `App.tsx` handles routing inline. The file exists but causes no harm.
2. **Recharts re-exports:** `DemographicsAnalysis.tsx`, `ReportsCenter.tsx`, `MyGiving.tsx` import `Bar` from `recharts` which triggers Rollup circular dependency warnings. Minor — bundler handles it.
3. **Chunk size:** `index-wz5doyx7.js` at 799KB. Consider `output.manualChunks` or more granular dynamic imports.
4. **Uncommitted changes:** e2e mock files, test results, new spec files exist in the working tree (see `git status`).
5. **No `groups` in AppViewRouter** — was missing from props, now fixed.

### Recent Fixes (this session)
- `AppViewRouter.tsx`: Added `groups: Group[]` to props interface, import, destructuring, and passthrough to `<GroupsManagement>`
- `Membership.tsx`: Added explicit `email: data.email || ''` default when constructing new Member object (form schema allows optional email, Member type requires it)

### Architecture Notes
- **Components:** At root `/components/`, not `src/components/`
- **Library:** At `src/lib/` — services, validation, auth, data access
- **Types:** Single `types.ts` at root with all interfaces/enums
- **Routing:** Inline switch in `App.tsx` (not react-router)
- **Auth:** Supabase auth via `supabase-auth.ts` + church-context
- **Validation:** Zod schemas in `src/lib/validation.ts`
- **State:** React `useState` at App level, passed as props (no global state manager)

## Next Steps (Siri Priority)
1. Clean up dead code — remove `AppViewRouter.tsx` if confirmed unused
2. Fix recharts direct imports to kill circular dependency warnings
3. Configure Vite chunk splitting for prod optimization
4. Set up automated lint/type-check pre-commit hook
5. Review uncommitted e2e/test files — commit or clean
6. Deploy prep per DEPLOYMENT_GUIDE.md
