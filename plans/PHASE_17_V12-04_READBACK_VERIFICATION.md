# Phase 17 (V12-04) — Read-back Verification

## Goal

After an existing V12-03 publish attempt, perform one bounded fixed-origin room read and independently establish `PUBLISHED_AND_VERIFIED` only when the exact prepared signed record is observed and the existing V1.1 verifier returns `VALID`.

## Reuse

- V12-03 `PublishAttemptStateReader` and immutable prepared descriptor.
- V1.1 fixed-origin bounded room reader and protocol verifier.
- V11-03 transcript diagnostics, V11-04 verification pipeline, and V11-05 evidence receipt.

## In scope

Attempt precondition, exact room/DID/nonce/post-sweep-text/signature matching, deterministic retained-candidate selection, independent verification, cause-neutral not-observed state, evidence-preserving observed-but-not-verified state, separate operational-unavailability state, and mocked regression/security coverage.

## Out of scope

Network writes in tests, publish retry, re-signing, replacement nonce, nonce reuse, polling, causal attribution, archive/history claims, UI work, V12-05+, release, and deployment.

## Completion gate

Focused tests and the complete typecheck, unit-test, zero-warning lint, production-build, Chromium E2E, and high-threshold audit gate pass. Status is updated and work stops before V12-05.
