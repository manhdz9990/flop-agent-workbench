# Phase 14 (V12-01) — Local Identity & Encrypted Backup Foundation

Status: COMPLETE — Completion Gate PASS

## Objective

Implement a small browser-local identity boundary: secure 32-byte Ed25519 seed generation, public-key and Technocore-compatible did:key derivation, authenticated encrypted backup creation/import, independent DID-match verification, and explicit session-memory locking.

## In scope

- Reuse Noble Ed25519 and the protocol did:key codec.
- Canonical `technocore-agent-backup/v1` envelope.
- Web Crypto PBKDF2-HMAC-SHA-256 (600,000 iterations), 16-byte salt, AES-256-GCM, and 12-byte IV.
- Bounded fail-closed parsing before key derivation.
- A secret-owning runtime holder with no raw-secret getter and explicit lock.
- Focused security tests and the complete regression gate.

## Out of scope

UI changes, signing, publishing, Technocore writes, API routes, server relays, persistence, raw seed/private-key input, wallet/blockchain behavior, telemetry, dependency changes, release, deployment, and V12-02+.

## Assumptions

- Backup passphrases must encode to 1–1024 UTF-8 bytes; strength remains a user responsibility until a separately authorized UI phase.
- Mutable byte buffers are cleared where practical, but JavaScript cannot guarantee physical memory zeroization.

## Completion gate

All V12-01 acceptance/security tests and the complete V1.1 regression suite pass typecheck, unit tests, zero-warning lint, production build, Chromium E2E, and high-threshold npm audit. Status is updated and work stops before V12-02.

Verified 2026-09-05: typecheck PASS; 15 files / 208 unit tests PASS; lint PASS with zero warnings; production build PASS; Chromium E2E PASS — 8/8 with normal summary `8 passed (3.5s)` and exit code 0; port 3100 clear afterward; npm audit at high threshold PASS — 0 vulnerabilities.
