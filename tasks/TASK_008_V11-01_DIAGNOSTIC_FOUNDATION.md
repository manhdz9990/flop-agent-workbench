# TASK_008 — Phase 8 (V11-01) — Diagnostic Foundation Contracts

Status: COMPLETE — Completion Gate PASS (product-owner verified 2026-09-04)

Execute only this phase. Do not begin V11-02. Do not deploy, touch domains,
Vercel settings, release configuration, or the verified protocol/security
engine. See `plans/PHASE_08_V11-01_DIAGNOSTIC_FOUNDATION.md` for the
provenance note explaining why this phase is numbered 8 in this repo.

## Implement
1. `lib/diagnostics/` module: status type, locked 12-stage pipeline order,
   pure boundary/result types, deterministic boundary-selection helpers,
   central rules registry (meaning + next-check copy per stage/status).
2. Tests under `tests/diagnostics/` covering: stage order, all five
   statuses, first-FAIL-wins boundary selection, first-UNAVAILABLE-only-
   when-no-FAIL, NOT_APPLICABLE/NOT_OBSERVED never becoming boundaries,
   deterministic copy mapping.

## Completion
Satisfy the Phase 8 gate in the matching plan, run the required
verification commands, update `PROJECT_STATUS.md` with actual results,
report changed/why/files/tests/risks/gate status, then STOP.
