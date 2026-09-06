# Task 037 — V12-09R R2 Home Hierarchy Correction

## Status

COMPLETE / PASS

## Acceptance

- Home has the same material structure in all four approved runtime states.
- Next Action follows the approved state priority and visually dominates.
- Public Rooms exposes `# lobby`, `Open lobby`, and subordinate browse access without fake metadata or render-time fetch.
- Identity, Backup, First Record, and Evidence cards use only real state and readable semantic labels.
- Developer Tools is available with tertiary visual weight.
- Home remains reachable during onboarding and setup resumes correctly.
- Full gate and desktop/mobile visual review pass with no new dependency, API, state owner, or live write.

## Result

All acceptance criteria passed. Home uses real existing readiness and runtime Evidence only, direct lobby navigation remains user-initiated, and the existing Rooms reader requires an explicit refresh before any read. No Rooms redesign or protected-domain change was made.

Verification: typecheck PASS; 25/25 test files and 313/313 tests PASS; lint PASS; build PASS; Chromium E2E 13/13 PASS; offline audit 0 vulnerabilities; desktop/mobile visual review PASS.
