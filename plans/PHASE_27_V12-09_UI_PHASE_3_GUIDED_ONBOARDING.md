# Phase 27 — V12-09 UI Phase 3: Guided Onboarding

## Status

COMPLETE / PASS

## Goal

Replace the eight-card onboarding presentation with one focused, domain-gated four-stage journey: Identity, Backup, Publish, Verify.

## Scope

- Four semantic CURRENT / COMPLETE / LOCKED macro stages.
- Create and Import reuse inside Identity.
- Backup creation and re-import verification inside Backup.
- Write / Review / Sign / explicit Publish confirmation inside Publish.
- Publish outcome and explicit read-only checking inside Verify.
- Progressive disclosure for full DID, nonce, post-sweep text, canonical payload, signature, and verification details.
- Existing edit invalidation, operation locks, revision guards, nonce burn, read-back, evidence qualification, and receipt generation.
- Responsive focused layout and regression coverage for completed UI Phases 1–2.

## Exclusions

No protected-domain changes, parallel onboarding engine, dependency, route, persistence, polling, automatic publish/retry, workspace redesign, UI Phase 4, V12-10, release, or deployment.

## Verification

Passed on 2026-09-05: typecheck; 25 unit/integration files with 308 tests; lint with zero warnings; production build; 11 Chromium E2E journeys; npm audit with zero vulnerabilities; protected-boundary scans; and desktop/mobile visual review. Screenshots are in `artifacts/ui-phase3-review/`.
