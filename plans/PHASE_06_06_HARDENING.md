# Phase 7 — MVP Hardening

## Objective
Verify complete MVP and security/regression readiness; no new features.

## Scope
full critical matrix; dependency/security review; production build; manual regression; documentation/status.

## Dependencies
Previous phase must be product-owner approved. Read AGENTS.md, PROJECT_STATUS, Build Handoff, acceptance criteria, test strategy, and this plan.

## Acceptance / tests
Use the applicable rows in `docs/04_quality/02_TEST_CASES.md` plus regression checklist. Run typecheck/tests/lint/build; add E2E where UI/browser behavior exists.

## Security checks
Preserve all locked boundaries in `docs/03_technical/04_SECURITY_THREAT_MODEL.md`. No OUT-scope behavior.

## Completion gate
All MVP acceptance criteria pass; OUT scope absent; security/regression checklist clean; release readiness reported; update status; STOP before release.
