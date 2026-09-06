# Phase 2 — Exact Protocol Core

## Objective
Implement deterministic offline Technocore protocol primitives only.

## Scope
single-line sweep; exact canonical payload; Ed25519 did:key decoding; canonical signature validation; exact nonce digit handling; room-class parser; independent fixtures.

## Dependencies
Previous phase must be product-owner approved. Read AGENTS.md, PROJECT_STATUS, Build Handoff, acceptance criteria, test strategy, and this plan.

## Acceptance / tests
Use the applicable rows in `docs/04_quality/02_TEST_CASES.md` plus regression checklist. Run typecheck/tests/lint/build; add E2E where UI/browser behavior exists.

## Security checks
Preserve all locked boundaries in `docs/03_technical/04_SECURITY_THREAT_MODEL.md`. No OUT-scope behavior.

## Completion gate
Known-good fixture VALID; text/room/nonce/signature mutations fail as expected; unsigned and missing-sig classifications work; 19-digit nonce passes; typecheck/tests/lint/build pass; no network/UI/tclk; update status; STOP.
