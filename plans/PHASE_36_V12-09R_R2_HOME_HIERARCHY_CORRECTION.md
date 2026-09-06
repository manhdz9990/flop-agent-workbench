# Phase 36 — V12-09R R2 Home Hierarchy Correction

## Status

COMPLETE / PASS

## Objective

Make Home a compact, state-aware dashboard with a dominant next action, direct lobby entry, four small real-state cards, and subordinate Developer Tools access.

## Scope

- Preserve one Home structure across no-Agent, backup-required, backup-verified, and runtime-verified states.
- Derive all copy, status, actions, and semantic accents from existing identity readiness and runtime Evidence only.
- Add an explicit Home-to-Rooms `lobby` handoff without fabricating discovery metadata or changing Rooms protocol behavior.
- Reduce Home text and desktop scrolling.

## Protected boundaries

No identity, onboarding, Rooms discovery/reader/composer, signing, nonce, publishing, read-back, Evidence, diagnostics, API, dependency, persistence, release, or deployment change.

## Completion evidence

- One stable Home composition now covers no Agent, backup required, ready without a verified record, and runtime-verified Evidence states.
- The dominant Next Action follows the approved priority; Public Rooms provides an explicit `# lobby` handoff without discovery metadata or a render-time fetch.
- Identity, Backup, First Record, and Evidence remain compact, truthful state summaries; Developer Tools is tertiary.
- Desktop 1440 x 900 and mobile 390 px screenshots passed visual review with clear hierarchy and no observed horizontal overflow.
- Typecheck PASS; 25 test files / 313 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 13/13 PASS; offline dependency audit PASS with 0 vulnerabilities.
- State ownership and protected behavior remain unchanged. Release and deployment were not performed.
