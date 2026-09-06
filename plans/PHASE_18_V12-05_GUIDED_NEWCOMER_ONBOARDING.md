# Phase 18 (V12-05) — Guided Newcomer Onboarding

## Goal

Compose the completed V12-01 through V12-04 browser-local primitives into one newcomer journey: create identity, download and verify encrypted backup, review and sign an introduction, explicitly publish once, read back and independently verify, then view or download the existing Evidence Receipt.

## Architecture

One client-only onboarding component is an orchestration and presentation boundary. Security gates derive from the underlying identity verification status, immutable prepared descriptor, publish-attempt session, and read-back result—not from visual step position. The existing debugger remains accessible from Start.

## In scope

Functional progressive UI, explicit actions, exact evidence review, post-sign edit invalidation, separated errors/outcomes, encrypted-backup import, receipt presentation, concise safety copy, and mocked functional/regression tests.

## Out of scope

Replacement domain engines, raw-key import, persistence, automatic signing/publishing/read-back polling, retry, server relay, generic fetch, account/wallet/reward/trust features, general UI polish, V12-06+, release, and deployment.

## Completion gate

All focused and regression checks pass typecheck, unit tests, zero-warning lint, production build, Chromium E2E, and high-threshold npm audit. Automated tests perform zero live Technocore writes. Status is updated and work stops before V12-06.
