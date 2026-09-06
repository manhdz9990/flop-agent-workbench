# Task 041 — V12-09R R4B Bounded Conversation Auto-Refresh

## Status

COMPLETE / PASS

## Acceptance

- Initial explicit selection reads once, then each next selected-room read begins about five seconds after the prior cycle settles.
- At most one conversation read is active; manual refresh shares the same guard and resets cadence.
- Hidden documents pause the timer; becoming visible performs one catch-up read and resumes cadence.
- Switch, mobile Back to rooms, navigation, and unmount stop/abort/invalidate the prior lifecycle; stale Room A data cannot overwrite Room B.
- Auto-refresh failures preserve the last successful bounded view, remain operational rather than INVALID, and recover on a later normal cycle without rapid retry.
- Normal UI stays quiet and says `Retained conversation · Auto-refresh on`; manual Refresh conversation remains accessible.
- Draft/review/signed/publish state is untouched by refresh. Publish verification and Evidence remain exclusively explicit.
- Room discovery remains manual; no new API, dependency, persistence, WebSocket, SSE, crawler, background worker, automated write, release, or deployment.

## Result

All acceptance criteria passed. The selected-room lifecycle is serialized, visibility-aware, abortable, generation-protected, self-scheduling after settlement, and cleaned up on back/navigation/unmount. It calls only the existing bounded room inspection path and cannot update publication-verification or Evidence state.

Verification: typecheck PASS; 26/26 test files and 324/324 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 17/17 PASS; offline npm audit PASS with 0 vulnerabilities; desktop and 390 px Product Design review PASS.
