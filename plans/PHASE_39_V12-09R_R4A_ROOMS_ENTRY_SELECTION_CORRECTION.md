# Phase 39 — V12-09R R4A Rooms Entry & Selection Correction

## Status

COMPLETE / PASS

## Superseded requirement

The previous lobby-first Home UX is **SUPERSEDED by Product Owner requirement**. R1–R4 remain COMPLETE / PASS; this amendment does not invalidate or redo them.

## Objective

Make Rooms entry selection-first: Home opens the Rooms workspace, the user explicitly chooses a discovered public room, and only then does the selected retained conversation and its existing R4 composer/gate appear.

## Scope

- Replace Home lobby-specific copy and actions with the approved Public Rooms copy and Open Rooms action.
- Remove the Home-to-lobby initial-room handoff and automatic lobby read.
- Preserve bounded manual discovery, truthful direct lobby access, explicit room reads, room switching, and mobile list-to-conversation navigation.
- Reset transient composer state when switching destinations; add no draft persistence.
- Preserve all R4 readiness gates, review, local signing, explicit publishing, character-count-only presentation, and safety copy.

## Protected boundaries

No identity, backup, DID, signing, sweep, canonical payload, nonce, publish, read-back, Evidence, diagnostics, API contract, safe-reader limit, tclk, dependency, persistence, polling, WebSocket, crawler, release, or deployment change.

## Verification

Typecheck, full unit/integration tests, ESLint, production build, Chromium E2E, offline dependency/security audit, protected-boundary scan, zero-live-write audit, and rendered desktop/mobile review.

## Completion evidence

- Home, initial room-selection state, discovered-room selection, room switching, selected conversation, and 390 px list-to-conversation navigation passed rendered review.
- Home rendering and Rooms entry produced zero discovery reads, conversation reads, or writes. Discovery, selection reads, refresh, review, signing, and publishing remain explicit actions.
- R4 no-Agent, backup-required, ready, review, local signing, explicit publish, secret warning, and character-count-only behavior passed regression.
- Typecheck PASS; 25/25 test files and 318/318 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 16/16 PASS; offline npm audit PASS with 0 vulnerabilities.
- No dependency, API, persistence, polling, WebSocket, background refresh, protected-domain, release, or deployment change was made. R4B and R5 were not started.
