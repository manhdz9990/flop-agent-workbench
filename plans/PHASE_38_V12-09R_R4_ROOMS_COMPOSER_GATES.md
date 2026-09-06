# Phase 38 — V12-09R R4 Rooms Composer Gates

## Status

COMPLETE / PASS

## Objective

Map the existing Rooms composer to three truthful presentation states: no active Agent, active Agent without verified backup, and ready Agent.

## Scope

- Keep the composer or gate attached to the selected retained conversation.
- Reuse existing Create/import onboarding and backup-management entry points.
- Preserve the existing Write → Review → Sign Locally flow and leave publish/read-back presentation for R5.
- Keep selected-room binding, runtime-local drafts, and existing reset behavior.

## Product-owner clarification — character counter

There is no approved general Rooms message-length limit. The ready composer displays only `{used} characters`. It must not use the tclk-specific 4096-character limit, add `maxLength`, validate against a new threshold, truncate input, or alter existing upstream/protocol rejection behavior. Future phases must not infer a general Rooms message limit from this presentation counter.

## Protected boundaries

No identity, backup semantics/cryptography, sweep, canonical payload, DID, nonce, signing, publish, read-back, Evidence, diagnostics, safe reader, API, tclk, dependency, persistence, release, or deployment change.

## Verification

Unit/integration tests, ESLint, typecheck, production build, Chromium E2E, dependency audit, protected-boundary scan, and desktop/mobile rendered review of all three gates plus review and signed-local states.

## Completion evidence

- No-Agent, backup-required, ready, review, and signed-local states passed rendered desktop and 390 px review.
- The ready composer reports only `{used} characters`; no general Rooms limit, `maxLength`, threshold validation, or truncation was introduced. The tclk-specific 4096-character bound remains unrelated.
- Review and local signing caused zero automated writes. Publishing remains an existing, explicit user action.
- Typecheck PASS; 25/25 test files and 317/317 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 15/15 PASS; offline npm audit PASS with 0 vulnerabilities.
- State ownership and all protected product boundaries remained unchanged. R5, release, and deployment were not started.
