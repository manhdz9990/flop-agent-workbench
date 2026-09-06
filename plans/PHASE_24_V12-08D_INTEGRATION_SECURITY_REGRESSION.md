# Phase 24 (V12-08D) — Integration & Security Regression

Status: COMPLETE — Completion Gate PASS

## Objective

Audit and verify the combined V12-08A Rooms / Chat, V12-08B My Agent, and V12-08C Evidence surfaces without weakening any completed V1.1 or V1.2 identity, backup, signing, nonce, publish, read-back, evidence, diagnostic, receipt, network, or lifecycle invariant.

## In scope

Cross-surface identity and nonce lifecycle; secret, persistence, backup, publish, read-back, evidence, hostile-content, public-room, API, tclk, product-claim, stale-state, and resource-limit audits; deterministic regression coverage; correction only of reproducible ordinary orchestration/test/copy defects already inside approved behavior.

## Out of scope

New product behavior; V12-09 UI redesign; protocol, crypto, evidence, nonce, backup, or network-contract changes; new routes, persistence, dependencies, server relay, release, or deployment.

## Completion gate

Typecheck, full unit tests, zero-warning lint, production build and route audit, Chromium E2E with port cleanup, high-threshold npm audit, explicit static security audits, and zero automated live Technocore writes. Status is updated and work stops before V12-09.

## Findings and correction

One cross-surface orchestration defect was confirmed: Onboarding and Rooms separately owned nonce reservation and publish-attempt lifecycles, so navigation/unmount could discard session reservation/burn history. `Home` now owns one page-runtime lifecycle and passes it to both surfaces. A read-only `previewNext` method derives the exact review candidate from the same DID+room reservation state used by `reserveNext`; the locked BigInt candidate arithmetic and burn-before-fetch semantics are unchanged.

All other audited identity, backup, secret, signing, publish, read-back, evidence, diagnostics, hostile-content, public-room, API, persistence, resource-limit, tclk, and product-claim boundaries passed without source correction.

## Verified result — 2026-09-05

- `npm.cmd run typecheck`: PASS, exit code 0.
- `npm.cmd test`: PASS — 25 files / 305 tests, exit code 0.
- `npm.cmd run lint`: PASS — zero warnings, exit code 0.
- `npm.cmd run build`: PASS; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`.
- `npm.cmd run test:e2e`: PASS — 11/11 Chromium tests; normal summary `11 passed (8.0s)`; exit code 0; port 3100 clear before and after; no E2E-owned process remained.
- `npm.cmd audit --audit-level=high`: PASS — 0 vulnerabilities, exit code 0 through the network-enabled advisory endpoint.
- Static security audits: PASS. Automated external boundaries were mocked/intercepted; zero live Technocore writes occurred.
