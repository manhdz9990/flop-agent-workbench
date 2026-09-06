# Phase 20 (V12-07) — Security & Regression Hardening

## Goal

Adversarially audit the completed V1.2 browser-local identity, backup, signing, publish, read-back, onboarding, and Workbench boundaries; correct only reproducible ordinary defects; strengthen meaningful missing coverage; and complete the regression gate before manual validation.

## Findings and scope

One phase-local async UI race was found: React busy state alone was not a synchronous mutex, and a signed result could become actionable after its reviewed inputs changed during signing. The correction adds a synchronous single-operation guard and input-revision checks to V12-05 orchestration only.

Backup metadata fail-closed behavior and locked cross-boundary limits/logging/persistence/server-route/write-URL isolation receive direct regression coverage. No crypto, nonce, transport, verifier, API, persistence, dependency, or deployment contract changes.

## CSP decision

Retain existing security headers. Defer strict CSP to release architecture review because Next client framework scripts require a deliberately verified nonce/hash/build policy; a guessed CSP could break approved behavior and would introduce deployment assumptions outside V12-07.

## Completion gate

Full typecheck, unit, zero-warning lint, production build/route manifest, Chromium E2E with cleared port, and high-threshold audit pass. Automated tests perform zero live writes. Stop before V12-08.
