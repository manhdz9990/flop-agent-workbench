# Phase 6 — UX/UI

## Objective
Implement approved verification-first UI without changing product scope.

## Scope
Dark Infrastructure Grid; Home/Inspect; four inputs; Trust Report; Message Detail; verdict/warning/error/loading/empty states; responsive behavior; E2E.

## Dependencies
Previous phase must be product-owner approved. Read AGENTS.md, PROJECT_STATUS, Build Handoff, acceptance criteria, test strategy, and this plan.

## Acceptance / tests
Use the applicable rows in `docs/04_quality/02_TEST_CASES.md` plus regression checklist. Run typecheck/tests/lint/build; add E2E where UI/browser behavior exists.

## Security checks
Preserve all locked boundaries in `docs/03_technical/04_SECURITY_THREAT_MODEL.md`. No OUT-scope behavior.

## Completion gate
Core flows and all four verdicts render correctly; hostile content inert; responsive/accessibility basics pass; E2E/build/lint/tests pass; update status; STOP.
