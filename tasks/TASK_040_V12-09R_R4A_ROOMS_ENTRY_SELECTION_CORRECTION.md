# Task 040 — V12-09R R4A Rooms Entry & Selection Correction

## Status

COMPLETE / PASS

## Acceptance

- Home displays Public Rooms, `Browse public conversations and choose a room.`, and `Open Rooms →`, with no lobby-first Home action or render-time room request.
- Entering Rooms selects no room, reads no conversation, and renders no composer/gate until explicit selection.
- Discovered destinations come only from the existing bounded discovery result; a discovered lobby may be recommended but is not automatic or mandatory.
- Selecting and switching rooms updates the conversation and composer target, invalidates transient draft/review/sign/publish state, and performs no automatic publish.
- No-Agent, backup-required, ready, Review Message, Sign Locally, explicit Publish, secret warning, and current-character-count-only R4 behavior remain intact.
- Manual discovery/refresh remains authoritative. No polling, WebSocket, long-polling, background refresh, dependency, API, persistence, or automated live write is introduced.
- Desktop and 390 px list-to-conversation flow, Back to rooms, focus/touch usability, and horizontal overflow pass rendered review.

## Result

All acceptance criteria passed. The prior lobby-first Home entry is superseded. Users now open Rooms, explicitly load bounded discovery, and choose a destination before any conversation or R4 composer/gate exists. Switching rooms updates the retained conversation and clears transient draft/prepared state without persistence or automatic publication.

Verification: typecheck PASS; 25/25 test files and 318/318 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 16/16 PASS; offline npm audit PASS with 0 vulnerabilities; desktop and 390 px Product Design review PASS.
