# Phase 28 — V12-09 UI Phase 4: Active-DID Home + My Agent Workspace

## Status

COMPLETE / PASS

## Goal

Redesign only active-DID Home and My Agent so they clearly expose the active public identity, truthful runtime readiness/evidence state, and one contextual next action.

## Scope

- Preserve the completed no-DID Home unchanged.
- Derive active-Home next action from existing backup verification and runtime Evidence state.
- Show Recent Evidence only when actual runtime entries exist.
- Add restrained Quick Access navigation.
- Redesign My Agent active/no-active, recovery, DID inspection, and session sections.
- Add a presentational confirmation before existing `LocalIdentitySession.lock()` behavior.
- Verify responsive, accessible, long-string-safe layouts.

## Limitation

Publish-attempt/read-back-pending state is owned by the guided onboarding component and is not safely available to Home. No new progress architecture is authorized; Home uses the nearest truthful action until qualifying verified Evidence exists.

## Exclusions

No Rooms or Evidence redesign, Phase 5, V12-10, dependency, API route, persistence, polling, domain/security semantic, release, or deployment change.

## Verification

Passed on 2026-09-05: typecheck; 25 unit/integration files with 310 tests; lint with zero warnings; production build; 11 Chromium E2E journeys; npm audit with zero vulnerabilities; protected-boundary scans; and desktop/mobile visual review. Screenshots are in `artifacts/ui-phase4-review/`.
