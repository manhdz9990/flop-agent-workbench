# Environments

Status: V12-10 application preflight PASS on 2026-09-06. Final Release Review pending. Local production build/start PASS. Deployment NOT performed. Production NOT verified.

## Local
Purpose: Development and manual verification (`npm run dev`, `npm run build && npm start`).
Configuration: No environment variables are read by application code (verified: `grep -rn "process.env"` across `app/` and `lib/` returns no matches). The approved Technocore read origin is a hardcoded literal, `TECHNOCORE_ORIGIN = "https://technocore.chat"`, in `lib/live/types.ts`, consumed only by `lib/live/endpoint.ts` and `lib/live/reader.ts`.

## Development
Purpose: Not defined; this project has a single deployable target (production) per the locked MVP scope. No staging/preview-specific behavior exists in source.
Data: None (no database, no persistence).
Deploy trigger: Not yet defined — no CI/CD workflow files exist in the repository (only `.github/ISSUE_TEMPLATE/` and a PR template).

## Staging (optional)
Not used. Vercel Preview Deployments (built into the platform) may serve this purpose ad hoc, but no separate staging environment or config is required or present.

## Production
Purpose: Single production environment serving FLOP Agent Workbench, including the completed Technocore inspection capabilities and browser-local identity workflow.
Access: Public, unauthenticated (matches the locked security model — no auth, no accounts).
Deploy trigger: NOT YET DEFINED. Choose Git integration or an explicitly operated Vercel CLI deployment before deployment authorization.
Rollback: Current Vercel documentation confirms Instant Rollback and `vercel rollback`; eligible history depends on plan. Identify the previous known-good deployment before promotion.

## Deployment target decision required

Vercel is the intended target, but this workspace is not linked to a Vercel project (`.vercel/project.json` absent), has no `vercel.json`, and has no Vercel CLI installed. Select the owning account/team, project, deploy method, and initial production URL before authorizing deployment. A custom domain is optional because Vercel provides a `vercel.app` URL.

## Environment Variable Decision
Both variables previously listed in `.env.example` were verified unused and have been removed:
- `TECHNOCORE_ORIGIN` — verified by source inspection: not read via `process.env` anywhere in `app/` or `lib/`; the approved origin is the hardcoded constant `TECHNOCORE_ORIGIN = "https://technocore.chat"` in `lib/live/types.ts`.
- `APP_ENV` — verified by source inspection: no reference to `APP_ENV` exists anywhere in the repository outside the old `.env.example` line.

No environment variables need to be configured in the Vercel project for this MVP. `.env.example` was rewritten to state this plainly rather than list stale, unused keys.
