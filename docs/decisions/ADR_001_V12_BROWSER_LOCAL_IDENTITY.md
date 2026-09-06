# ADR 001 — V1.2 Browser-Local Identity Boundary

## Status

Accepted and implemented for V12-01 on 2026-09-05.

## Context

FLOP Agent Workbench V1.2 adds local identity handling while preserving the completed V1.1 debugger. Secret material must never cross into the application server, persistent browser storage, logs, telemetry, or network writes.

## Decision

- A non-exported session-holder class owns a copied 32-byte Ed25519 seed in browser memory and exposes only public identity, encrypted-backup creation, verification status, lock state, and explicit lock.
- Generation uses `crypto.getRandomValues` for exactly 32 bytes. Noble Ed25519 derives the public key, and the shared protocol codec produces the Technocore-compatible Ed25519 `did:key`.
- Backup format is `technocore-agent-backup/v1`. Its exact public envelope contains only format, DID, fixed KDF metadata and salt, fixed cipher metadata and IV, and ciphertext. The authenticated encrypted payload is exactly the 32-byte seed.
- Backup encryption uses browser Web Crypto PBKDF2-HMAC-SHA-256 with 600,000 iterations and a random 16-byte salt, then AES-256-GCM with a random 12-byte IV.
- Import rejects oversized, malformed, noncanonical, wrong-version, or unexpected fields before PBKDF2; authenticates/decrypts; requires exactly 32 plaintext bytes; re-derives the public identity; and requires its DID to match the envelope.
- A generated identity is `NOT_VERIFIED`. Only a successful encrypted-backup re-import produces a `VERIFIED` session.
- Mutable secret/passphrase buffers are cleared where practical. JavaScript does not guarantee physical zeroization.

## Consequences

V12-01 adds no UI, persistence, signing, publish function, fetch, API route, server relay, or Technocore write. Future signing must consume a separately reviewed narrow capability and requires separate phase authorization.
