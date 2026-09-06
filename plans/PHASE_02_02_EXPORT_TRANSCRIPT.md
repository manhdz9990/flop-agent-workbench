# Phase 3 — Export + Transcript Analysis

## Objective
Implement safe local JSONL parsing and transcript evidence analysis.

## Scope
bounded JSONL parser; line-level operational errors; sequence gap detection; retained-window model; export metadata model; report-model derivation.

## Dependencies
Previous phase must be product-owner approved. Read AGENTS.md, PROJECT_STATUS, Build Handoff, acceptance criteria, test strategy, and this plan.

## Acceptance / tests
Use the applicable rows in `docs/04_quality/02_TEST_CASES.md` plus regression checklist. Run typecheck/tests/lint/build; add E2E where UI/browser behavior exists.

## Security checks
Preserve all locked boundaries in `docs/03_technical/04_SECURITY_THREAT_MODEL.md`. No OUT-scope behavior.

## Completion gate
Valid/malformed/mixed/gapped/large-nonce exports pass; no full-history or gap-cause claims; export stays local; checks pass; update status; STOP.
