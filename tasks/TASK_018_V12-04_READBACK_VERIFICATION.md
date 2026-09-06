# TASK_018 — Phase 17 (V12-04) — Read-back Verification

## Status

COMPLETE — Completion Gate PASS.

Verified on 2026-09-05: typecheck PASS; 18 files / 271 unit tests PASS; lint PASS with zero warnings; production build PASS; Playwright 8/8 PASS with normal summary `8 passed (3.4s)` and exit code 0; port 3100 clear afterward; high-threshold npm audit PASS with 0 vulnerabilities through the network-enabled advisory endpoint.

## Objective

Implement only the bounded read-back adapter that can promote an existing V12-03 attempt to `PUBLISHED_AND_VERIFIED` through exact retained evidence and the existing V1.1 verifier. Preserve ambiguous, absent, non-verifying, and operational outcomes without retry or causal claims.

## Acceptance criteria

- No read occurs without an existing publish attempt.
- Exact room, DID, nonce, post-sweep text, and signature are required; seq/ts are server evidence only.
- `PUBLISHED_AND_VERIFIED` requires exact evidence and independent `VALID`.
- `OUTCOME_UNKNOWN` may later verify; an HTTP response alone never does.
- Absent evidence is cause-neutral; related non-verifying evidence preserves its real V1.1 verdict; read errors remain operational.
- Multiple candidates are handled deterministically without fabricating causality.
- The nonce remains burned and no retry, write, re-sign, replacement nonce, persistence, or secret exposure is introduced.
- Tests inject all reads and perform no live Technocore write.
- Full Completion Gate passes and `PROJECT_STATUS.md` is reconciled.

## Recovery

The additive `lib/readback` module, its focused tests, and its V12-04 documentation can be reverted independently without changing V12-01 through V12-03 or V1.1 runtime behavior.
