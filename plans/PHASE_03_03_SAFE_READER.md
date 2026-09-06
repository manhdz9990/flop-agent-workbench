# Phase 4 — Safe Live Reader + Input Resolution

## Objective
Add validated Room/Message/DID paths and strict read-only Technocore reader.

## Scope
input validators; hardcoded Technocore origin; read-only endpoint builders; timeouts/errors; DID local inspect; mocked/live-read integration tests where safe.

## Dependencies
Previous phase must be product-owner approved. Read AGENTS.md, PROJECT_STATUS, Build Handoff, acceptance criteria, test strategy, and this plan.

## Acceptance / tests
Use the applicable rows in `docs/04_quality/02_TEST_CASES.md` plus regression checklist. Run typecheck/tests/lint/build; add E2E where UI/browser behavior exists.

## Security checks
Preserve all locked boundaries in `docs/03_technical/04_SECURITY_THREAT_MODEL.md`. No OUT-scope behavior.

## Completion gate
SSRF/confused-deputy/write-boundary tests pass; no arbitrary URL; operational failures separate; checks pass; update status; STOP.
