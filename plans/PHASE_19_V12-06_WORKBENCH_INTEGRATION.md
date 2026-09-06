# Phase 19 (V12-06) — Workbench Integration

## Goal

Integrate guided onboarding and the completed protocol debugger into one coherent Workbench with explicit Get Started and Inspect & Debug paths, a browser-memory active public identity context, and low-risk links into existing DID/message inspection surfaces.

## Architecture

`Home` owns the existing `LocalIdentitySession` only for the current page runtime and hosts the single V12-05 onboarding component. Entry labels select onboarding context but grant no capabilities. Existing domain state continues to gate backup verification, signing, publishing, read-back, and receipts.

Cross-workflow actions transfer only public DID or room/sequence into existing inspector inputs. They do not automatically inspect, read, publish, sign, or fetch.

## In scope

Start-page grouping, three newcomer entry points, preserved debugger entries, active public-DID context, in-memory navigation composition, DID/message handoff, concise labels, minimal layout, and integration/regression tests.

## Out of scope

New protocol or cryptographic engines, duplicate onboarding, persistence, accounts/wallets, metrics, contribution/reputation/reward features, background polling, content links, server writes/relays, broad polish, V12-07+, manual production writes, release, and deployment.

## Completion gate

All focused and regression checks pass typecheck, unit tests, zero-warning lint, production build, Chromium E2E, and high-threshold npm audit. Automated tests perform zero live Technocore writes. Status is updated and work stops before V12-07.
