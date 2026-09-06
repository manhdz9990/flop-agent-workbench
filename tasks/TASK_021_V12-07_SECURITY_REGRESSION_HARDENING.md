# TASK_021 — Phase 20 (V12-07) — Security & Regression Hardening

## Status

COMPLETE — Completion Gate PASS.

Verified on 2026-09-05: typecheck PASS; 21 files / 285 unit tests PASS; lint PASS with zero warnings; production build and expected route manifest PASS; Playwright 10/10 PASS with normal summary `10 passed (6.5s)` and exit code 0; port 3100 clear afterward; high-threshold npm audit PASS with 0 vulnerabilities. Automated network boundaries were mocked/intercepted and performed zero live Technocore writes.

## Objective

Close reproducible ordinary security defects and prove the approved V1.2/V1.1 boundaries remain intact without adding product capability.

## Acceptance criteria

- Secret, backup, signing/nonce, publish, ambiguity, read-back, evidence, hostile-content, server, persistence, logging, resource-limit, tclk, navigation, and async-state boundaries are audited with real evidence.
- Duplicate async UI actions are synchronously blocked; stale sign/publish/read-back completions cannot restore actionable state after input revision.
- Malicious backup metadata is rejected before PBKDF2.
- Locked limits and exclusive transport URL construction receive direct regression coverage.
- Existing headers remain; CSP deferral and rationale are recorded.
- Full gate and all V12-06 through V12-01 plus V1.1 regressions pass with zero live writes.

## Recovery

Revert the onboarding operation/revision guards and new V12-07 tests/docs. No domain contract or data migration is involved.
