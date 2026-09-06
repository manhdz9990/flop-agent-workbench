# Phase 5 — tclk/1 Detection

## Objective
Add conservative official tclk/1 detection/interpretation only.

## Scope
verified official/spec-derived frame recognition; report annotations; negative/lookalike cases.

## Dependencies
Previous phase must be product-owner approved. Read AGENTS.md, PROJECT_STATUS, Build Handoff, acceptance criteria, test strategy, and this plan.

## Acceptance / tests
Use the applicable rows in `docs/04_quality/02_TEST_CASES.md` plus regression checklist. Run typecheck/tests/lint/build; add E2E where UI/browser behavior exists.

## Security checks
Preserve all locked boundaries in `docs/03_technical/04_SECURITY_THREAT_MODEL.md`. No OUT-scope behavior.

## Completion gate
Positive/negative fixtures pass; no settlement/value claims; no execution/rail integration; checks pass; update status; STOP.
