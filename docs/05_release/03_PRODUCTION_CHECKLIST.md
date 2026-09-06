# Production Checklist

Status: NOT DEPLOYED. V12-10 application preflight PASS; Final Release Review is pending and operational ownership decisions remain BLOCKING for deployment.

## Before deployment authorization

- [x] V12-10 final regression and release-preflight gate passes.
- [x] Fresh production build and controlled production start pass.
- [x] Route inventory confirmed: `/`, `/api/inspect`, `/api/rooms`.
- [x] No environment variables, secrets, database, migrations, wallet, or blockchain configuration required.
- [x] Fixed-origin readers, redirect rejection, timeouts, and response limits reviewed.
- [x] Browser-local export and receipt guarantees reviewed.
- [x] Security headers verified locally: `nosniff`, `no-referrer`, `DENY`, and restrictive Permissions Policy.
- [x] Post-deployment smoke and rollback criteria documented.
- [ ] Vercel account/team/project selected and linked.
- [ ] Deployment method/operator selected.
- [ ] Production URL/domain selected.
- [ ] Monitoring, incident-response, smoke-test, and rollback owners assigned.
- [ ] Previous known-good rollback target identified, or first-deployment takedown procedure approved.

## After deployment

- [ ] HTTPS and hostname verified.
- [ ] All smoke tests in `02_DEPLOYMENT_PLAN.md` pass against production.
- [ ] No unexpected writes, uploads, or external requests observed.
- [ ] Monitoring and incident path confirmed operational.
- [ ] Deployment ID, URL, operator, time, evidence, and rollback target recorded in `PROJECT_STATUS.md`.

No production success may be claimed until every applicable post-deployment item is verified.
