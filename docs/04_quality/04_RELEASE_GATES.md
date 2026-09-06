# Release Gates

Status: V12-10 APPLICATION PREFLIGHT PASS — deployment remains blocked on operational decisions. Final Release Review pending. Deployment NOT performed. Production NOT verified.

## Build
- [x] Production build passes. — Fresh V12-10 build PASS on 2026-09-06; `/api/inspect` and `/api/rooms` are present.

## Quality
- [x] Relevant tests pass. — Fresh post-V12-09R V12-10 typecheck, 324/324 unit/integration tests, zero-warning lint, and 17/17 Chromium E2E PASS on 2026-09-06.
- [x] Acceptance criteria reviewed. — Completed V1.1 and V1.2 contracts were re-audited during V12-10; no semantic regression was found.
- [x] Known issues documented. — See `PROJECT_STATUS.md` "Known issues / risks."

## Security
- [x] No secrets committed. — Verified by source inspection: no secrets exist in source; `.env.example` was rewritten to remove the unused `TECHNOCORE_ORIGIN` and `APP_ENV` entries and now documents that no environment variables are read.
- [x] Production environment reviewed. — No environment variables or secrets are required. No Vercel project/team/domain is linked or selected.
- [x] Authorization checked. — This step is explicitly product-owner authorized as "implement minimal Vercel preflight changes" (runtime declaration, headers, `.env.example` cleanup, documentation only). Deployment remains explicitly out of scope.
- [x] High-risk changes reviewed. — Three source changes made, all low-risk and individually authorized: (1) `export const runtime = "nodejs";` added to `app/api/inspect/route.ts`, confirmed correct against official Vercel documentation (Node.js is the default and, on Next.js ≥16.3, the only available runtime for this route type); (2) four global response headers added via `next.config.ts` `headers()`, matching the official Next.js `headers()` pattern; (3) `.env.example` rewritten to remove two verified-unused variables. No CSP, dependencies, `vercel.json`, or middleware were added.
- [x] Dependency advisory audit passes. — Fresh V12-10 `npm audit --offline --audit-level=high` PASS with 0 vulnerabilities on 2026-09-06.

## Operations
- [x] Backup/recovery path exists. — Not applicable; no persisted data (confirmed by source inspection: no database/storage dependency in `package.json`).
- [x] Rollback approach exists. — Current Vercel documentation confirms Instant Rollback and `vercel rollback`; the previous known-good deployment must be identified before promotion.
- [ ] Monitoring/logging owner and minimum launch signals approved.

## Production
- [x] Smoke test plan exists. — The exact production plan is in `02_DEPLOYMENT_PLAN.md`. A local production-start/header/error smoke passed on port 3210; hosted smoke remains unexecuted because no deployment exists.

## Blocking operational decisions
- [ ] Select the Vercel account/team and project.
- [ ] Choose deployment method and responsible operator.
- [ ] Choose the initial production URL/domain.
- [ ] Assign smoke-test, monitoring, incident-response, and rollback owners.
