# Deployment Plan

Target: Vercel. Status: V12-10 APPLICATION PREFLIGHT PASS — FINAL RELEASE REVIEW PENDING; DEPLOYMENT BLOCKED PENDING OPERATIONAL DECISIONS. Nothing has been deployed or production-verified.

## Verified application readiness

- Fresh post-V12-09R V12-10 reconfirmation PASS on 2026-09-06: typecheck, 324/324 unit/integration tests, zero-warning lint, production build, 17/17 Chromium E2E, and offline npm audit with 0 vulnerabilities.
- Fresh preflight `next build` PASS. Routes: `/`, `/api/inspect`, `/api/rooms`, and framework `_not-found` only.
- Direct Next.js 16.3.4 production smoke on `127.0.0.1:3210` PASS. `/` returned HTTP 200, security headers were present, malformed `/api/inspect` input returned bounded JSON HTTP 400, and port 3210 was clear after shutdown.
- Runtime dependencies are Next, React, Noble Ed25519, and Scure Base. No development-only package is imported by application runtime code.
- No environment variables, secrets, database, migration, persisted state, backup, or local-machine path is required.

## Pre-deployment actions — require separate authorization

1. Select the owning Vercel account/team and create or identify the project.
2. Choose Git integration or Vercel CLI. This workspace has neither Git metadata nor a Vercel project link/CLI.
3. Choose the initial public URL: generated `vercel.app` URL or approved custom domain.
4. Confirm the production trigger and domain auto-assignment policy.
5. Assign deployment, smoke-test, monitoring, incident-response, and rollback owners.
6. Identify the last known-good production deployment; for a first deployment, approve taking it offline as the rollback path.
7. Re-run the release gate if source, lockfile, runtime, or platform configuration changes.

## Deployment action — not authorized

After the decisions above, the authorized operator links/imports the project and creates a deployment. Prefer a preview or staged production deployment before assigning the production domain. Current Vercel CLI guidance supports `vercel --prod --skip-domain`, then `vercel promote <deployment>` after verification. Exact commands depend on the selected method and account policy.

## Minimum post-deployment smoke test

1. Confirm HTTPS/hostname; load `/` and verify HTTP 200 and expected title.
2. Verify security headers on `/`, `/api/inspect`, and `/api/rooms`.
3. Exercise Start and all four task actions.
4. Exercise Explore Public Rooms; confirm a bounded result or separate operational error.
5. Exercise Message Debug; confirm verdict, first boundary, 12 stages, and error separation.
6. Analyze a local JSONL export while observing requests; confirm no export body upload.
7. Inspect a DID locally; confirm message stages remain NOT_APPLICABLE.
8. Preview/download Markdown and JSON receipts; confirm no upload or persistence request.
9. Verify oversized `/api/inspect` POST rejection with HTTP 413.
10. Render hostile room/topic/message/export/DID text; confirm inert behavior and no derived request/navigation.
11. Verify no write endpoints or unexpected external requests; server evidence reads target only `https://technocore.chat` through fixed readers.
12. Check mobile hierarchy and browser console/network errors.

## Rollback criteria and action

Rollback or remove production traffic if a critical route fails, evidence semantics differ, exports/receipts upload, fixed-origin enforcement fails, hostile content executes, security headers disappear, evidence-origin access fails persistently, or launch error/latency thresholds are breached.

Use Vercel Instant Rollback or `vercel rollback [deployment-id-or-url]` to restore the identified known-good deployment. Rollback restores an older build rather than rebuilding it with later environment changes; this app currently has none. Re-run the full production smoke test afterward.
