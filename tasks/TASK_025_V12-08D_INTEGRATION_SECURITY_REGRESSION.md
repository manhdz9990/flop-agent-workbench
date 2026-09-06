# TASK_025 — Phase 24 (V12-08D) — Integration & Security Regression

## Status

COMPLETE — Completion Gate PASS.

## Acceptance criteria

- One Home-owned identity and one page-runtime nonce/publish lifecycle remain authoritative across onboarding, Rooms, My Agent, and Evidence association.
- Lock and identity replacement immediately remove stale signing capability without falsifying observed public evidence; refresh clears runtime identity and Evidence.
- Secret, backup, persistence, logging, route, network, fixed-origin, resource-limit, tclk, and hostile-content boundaries remain intact.
- Canonical signing, exact nonce arithmetic/reservation/burn, explicit-only publish, ambiguous outcomes, exact read-back qualification, four evidence verdicts, and 12-stage diagnostics retain their approved semantics.
- Reproducible ordinary integration defects receive only minimal fixes and deterministic regression coverage.
- Full Completion Gate passes with zero automated live Technocore writes; work stops before V12-09.

## Result

- Corrected the single confirmed integration defect by sharing one Home-owned page-runtime `SessionNonceReservations` and `PublishAttemptSession` across Onboarding and Rooms.
- Added exact, non-mutating nonce preview against the same reservation state so reviewed and reserved candidates agree without changing candidate selection or burn semantics.
- Added deterministic unit/static regression coverage and a fixed-clock cross-surface E2E assertion proving nonce reuse does not occur across navigation.
- Audited all required V12-08D boundaries; no further semantic, architecture, dependency, route, persistence, or product changes were required.

## Verification — 2026-09-05

- Typecheck: PASS, exit code 0.
- Unit tests: PASS — 25 files / 305 tests, exit code 0.
- Lint: PASS — zero warnings, exit code 0.
- Production build and route audit: PASS; no new route.
- E2E: PASS — 11/11 Chromium tests; `11 passed (8.0s)`; exit code 0; port 3100 clear and no owned process remained afterward.
- npm audit at high threshold: PASS — 0 vulnerabilities, exit code 0.
- Static security audits and zero-live-write check: PASS.
