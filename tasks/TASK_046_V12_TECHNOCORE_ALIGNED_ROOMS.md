# Task 046 — Rebuild Rooms around official `/humans`

Status: COMPLETE / PASS — Product Owner confirmed real signed messages `#87288` and `#87290`, authoritative reconciliation, VALID verification, and continued stream.

## Acceptance

- Official source behavior is recorded, including its two-second instant-empty guard and three-second error retry.
- One active room read exists; cursor advances exactly; held empty/message responses immediately re-poll; switch/hidden/unmount invalidate stale work.
- Current messages append by authoritative sequence into a 200-row bound without stale React-state replacement.
- A locally signed optimistic row reconciles only on exact room, DID, nonce, post-sweep stored text, signature, and VALID verification.
- Dense rows, relative server time, compact direct composer, compact lobby fallback, follow-newest behavior, and click-only technical details render on desktop/mobile.
- Full typecheck, unit/integration, lint, build, Chromium E2E, audit, security scan, and read-only 60-second comparison complete.
- A real live signed write is not automated and remains pending Product Owner/manual interactive acceptance.
