# Task 035 — V12-09R Single-Shell Correction

## Status

COMPLETE / PRODUCT DESIGN PASS

## Acceptance

- One shell is present with or without an active DID.
- Desktop sidebar expands/collapses; mobile navigation opens, closes, and closes after selection.
- Home uses the same six-card structure and only real runtime state changes its labels/actions.
- Onboarding stays inside the shell and resumes after navigating Home and back.
- Rooms, My Agent, Evidence, and Developer Tools remain reachable inside the shell.
- No duplicate state owner, dependency, API, persistence, polling, or protocol change is introduced.
- Full prescribed gate and 1440x900 / 390x844 visual review pass.

## Result

All acceptance items passed. Automated gate: typecheck PASS; 25/25 files and 312/312 unit/integration tests PASS; lint PASS; build PASS; 13/13 Chromium E2E PASS; offline audit 0 vulnerabilities. Visual review confirms the compact real-state Home, stable desktop shell, collapsed sidebar, mobile drawer, active navigation, preserved Phase 6 Evidence, and no horizontal overflow.
