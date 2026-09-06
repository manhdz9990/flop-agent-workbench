# Phase 37 — V12-09R R3 Rooms Discovery & Lobby Prominence

## Status

COMPLETE / PASS

## Objective

Make Rooms a compact retained-conversation workspace with an obvious but truthful lobby entry, clear selected-room hierarchy, deterministic newest-first presentation, and manual bounded reads.

## Scope

- Promote an actually discovered `lobby` without altering observed metadata.
- Keep direct `lobby` access visibly distinct from discovery and complete the explicit Home handoff through the existing reader.
- Separate room-list and selected-conversation states, including loading, empty, and operational failures.
- Present usable sequence evidence newest-first; preserve deterministic observed order for records without usable sequence evidence.
- Improve desktop and mobile Rooms hierarchy while retaining existing message actions and composer behavior.

## Protected boundaries

No identity, backup, composer eligibility, signing, canonical payload, nonce, publishing, read-back, Evidence, diagnostics, API, network limit, dependency, persistence, release, or deployment change.

## Verification

Unit/integration tests, ESLint, typecheck, production build, Chromium E2E, dependency audit, protected-boundary scan, and rendered desktop/mobile review.

## Completion evidence

- An observed lobby is promoted without metadata changes; an absent lobby remains a separately labeled direct fixed-room action.
- Home Open lobby performs exactly one explicit bounded read through the existing `/api/inspect` route.
- Discovery and conversation states, manual refresh actions, selected-room structure, and mobile list/conversation navigation passed browser review.
- Exact 19-digit sequence comparison uses `BigInt`; usable sequence evidence is newest-first and unusable/missing evidence remains deterministic without invented fields.
- Typecheck PASS; 25/25 test files and 316/316 tests PASS; ESLint PASS; build PASS; Chromium E2E 14/14 PASS; offline audit PASS with 0 vulnerabilities.
- No protected behavior, dependency, API route, persistence, polling, release, or deployment change was made.
