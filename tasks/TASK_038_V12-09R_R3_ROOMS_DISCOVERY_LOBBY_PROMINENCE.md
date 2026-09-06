# Task 038 — V12-09R R3 Rooms Discovery & Lobby Prominence

## Status

COMPLETE / PASS

## Acceptance

- Discovered lobby is first and explicitly identified as discovered/recommended without changed metadata.
- Missing lobby produces only a distinct direct-access action, never fabricated discovery metadata.
- Home Open lobby performs one explicit bounded room read through the existing route.
- Discovery and conversation loading, empty, and error states are distinct and manually retryable.
- Selected room is structurally apparent; retained-history/manual-read language is concise and visible.
- Usable sequence evidence is deterministically newest-first; missing/unusable sequence evidence remains metadata-free and deterministic.
- Signed/unsigned writer, sequence, verdict, Inspect message, and Add to Evidence behavior remain correct.
- Mobile provides room-list to conversation navigation with Back to rooms and no horizontal overflow.
- Full gate passes with no new dependency, API, state owner, automated live write, polling, or R4 composer change.

## Result

All acceptance criteria passed. Desktop and 390 x 844 rendered evidence is stored under `artifacts/v12-10-preflight/` with R3-prefixed filenames. Existing Inspect message, Add to Evidence, composer, signing, publish, and read-back behavior remains intact.
