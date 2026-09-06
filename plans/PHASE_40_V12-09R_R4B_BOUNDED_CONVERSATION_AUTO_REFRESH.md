# Phase 40 — V12-09R R4B Bounded Conversation Auto-Refresh

## Status

COMPLETE / PASS

## Superseded constraint

The previous V1.2 conversation-refresh constraint, `manual-only / no polling`, is narrowly superseded by an approved five-second bounded auto-refresh for the explicitly selected room while its Rooms conversation is active and the document is visible. Room discovery remains manual. Publication verification remains explicit.

## Lifecycle design

- Selected room source: the existing `RoomsChat` `selectedRoom` state.
- Active workspace: component mount; mobile Back to rooms deactivates the selection lifecycle.
- Visibility: one `visibilitychange` listener forwards `document.visibilityState`.
- In-flight guard: one selected-conversation request owned by the scheduler.
- Identity/race safety: generation plus AbortController; stale/aborted responses cannot commit.
- Timer: one self-scheduling timeout, started only after the preceding read settles.
- Cleanup: room switch aborts/invalidates the prior generation; back/unmount clears timer, listener, and request.
- Manual refresh: uses the same serialized scheduler path and restarts cadence after settlement.
- Read callback: invokes only the existing `/api/inspect` bounded room path; it does not touch composer, publish/read-back, nonce, or Evidence state.

## Verification

Fake-timer lifecycle tests, existing unit/integration regression, Chromium E2E, typecheck, ESLint, production build, offline audit, protected-boundary/network scans, and desktop/mobile rendered review.

## Completion evidence

- The self-scheduling lifecycle reads once on selection and schedules the next cycle 5,000 ms after settlement; no overlapping or queued missed ticks exist.
- Manual refresh, visibility catch-up, room switch, mobile Back, navigation, unmount, abort, and stale-generation behavior passed deterministic fake-timer/browser tests.
- Failed refreshes preserve the last successful bounded view and recover on normal cadence. Routine success is silent; operational failure uses restrained status copy.
- Composer/draft, local signing, explicit publish/read-back verification, and explicit Evidence actions remain separate and passed regression. Zero automatic writes occurred.
- Typecheck PASS; 26/26 test files and 324/324 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 17/17 PASS; offline npm audit PASS with 0 vulnerabilities.
- Desktop and 390 px Product Design review PASS. R5, V12-10 rerun, release, and deployment were not started.
