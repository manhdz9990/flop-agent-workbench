# Phase 16 (V12-03) — Browser Direct Publish

Status: COMPLETE — Completion Gate PASS

## Objective

Attempt one explicit browser-direct Technocore signed GET using an already prepared V12-02 public descriptor, burn its nonce before execution, and report transport evidence without claiming verified publication.

## In scope

- Fixed `GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>` transport.
- One-time standard path-component encoding and structural destination validation.
- `NOT_ATTEMPTED`, `ATTEMPTED`, `RESPONSE_RECEIVED`, and `OUTCOME_UNKNOWN` states.
- Session-only prepared-nonce membership and irreversible attempt burning.
- Bounded AbortController timeout, injected fetch tests, and minimal public HTTP metadata.

## Out of scope

POST, arbitrary destinations, server relays/routes/actions, response-body interpretation, retry, replacement nonces, re-signing/re-sweeping, UI work, read-back, verified publication, persistence, dependencies, deployment, and V12-04+.

## Completion gate

Focused transport/security tests use mocks only and perform zero live writes. All V12-02, V12-01, and V1.1 regression checks pass the complete typecheck, unit, lint, build, Chromium E2E, and audit gate. Stop before V12-04.

Verified 2026-09-05: focused publish/signing/identity tests PASS — 3 files / 55 tests; typecheck PASS; full unit suite PASS — 17 files / 250 tests; lint PASS with zero warnings; production build PASS with no new server route; Chromium E2E PASS — 8/8 with normal summary `8 passed (3.0s)` and exit code 0; port 3100 clear afterward; npm audit at high threshold PASS — 0 vulnerabilities. Automated tests performed no live Technocore write.
