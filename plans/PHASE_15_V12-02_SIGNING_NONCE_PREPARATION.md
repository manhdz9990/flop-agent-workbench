# Phase 15 (V12-02) — Signing & Nonce Preparation

Status: COMPLETE — Completion Gate PASS

## Objective

Extend the V12-01 browser-local identity capability to prepare, sign, and independently self-verify a canonical Technocore message without publishing it.

## In scope

- Existing room validation, single-line sweep, canonical payload, Ed25519 identity, signature encoding, and verifier reuse.
- Exact BigInt nonce candidate selection from clock, observed evidence, and DID+room session reservation.
- Immutable public `SIGNED_LOCALLY_NOT_PUBLISHED` descriptor.
- Session-local duplicate-preparation prevention.
- Focused security and regression tests plus the complete project gate.

## Out of scope

Publishing, fetch/network writes, write URLs, API routes, relays, UI changes, publish-attempt nonce burning, automatic signing/retry, persistence, dependencies, release/deployment, and V12-03+.

## State boundary

Preparation reserves a nonce in an in-memory `DID + room` map. V12-02 has no publish-attempt state. A future separately authorized phase may add an irreversible session-local burned transition when an actual publish attempt begins without changing the candidate arithmetic.

## Completion gate

Focused signing/nonce/security tests and all V12-01/V1.1 regression checks pass typecheck, unit tests, zero-warning lint, production build, Chromium E2E, and high-threshold npm audit. Status is updated and work stops before V12-03.

Verified 2026-09-05: typecheck PASS; 16 files / 232 unit tests PASS; lint PASS with zero warnings; production build PASS; Chromium E2E PASS — 8/8 with normal summary `8 passed (2.9s)` and exit code 0; port 3100 clear afterward; npm audit at high threshold PASS — 0 vulnerabilities.
