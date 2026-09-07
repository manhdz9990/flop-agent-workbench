# ADR 001 — V1.2 Browser-Local Identity Boundary

## Status

Accepted and implemented for V12-01 on 2026-09-05. Amended by explicit Product Owner authorization on 2026-09-07.

## Context

FLOP Agent Workbench V1.2 adds local identity handling while preserving the completed V1.1 debugger. Secret material must never cross into the application server, persistent browser storage, logs, telemetry, or network writes.

## Decision

- A non-exported session-holder class owns a copied 32-byte Ed25519 seed in browser memory. Its normal interface exposes public identity, encrypted-backup creation, signing preparation, verification status, lock state, and explicit lock.
- Generation uses `crypto.getRandomValues` for exactly 32 bytes. Noble Ed25519 derives the public key, and the shared protocol codec produces the Technocore-compatible Ed25519 `did:key`.
- Backup format is `technocore-agent-backup/v1`. Its exact public envelope contains only format, DID, fixed KDF metadata and salt, fixed cipher metadata and IV, and ciphertext. The authenticated encrypted payload is exactly the 32-byte seed.
- Backup encryption uses browser Web Crypto PBKDF2-HMAC-SHA-256 with 600,000 iterations and a random 16-byte salt, then AES-256-GCM with a random 12-byte IV.
- Import rejects oversized, malformed, noncanonical, wrong-version, or unexpected fields before PBKDF2; authenticates/decrypts; requires exactly 32 plaintext bytes; re-derives the public identity; and requires its DID to match the envelope.
- A generated identity is `NOT_VERIFIED`. Only a successful encrypted-backup re-import produces a `VERIFIED` session.
- Mutable secret/passphrase buffers are cleared where practical. JavaScript does not guarantee physical zeroization.

## Product Owner identity-ownership amendment

The original V12-01 boundary prohibited rendering raw secret material. The Product Owner deliberately superseded that prohibition only for an owner-controlled, client-only portability escape hatch in **My Agent → Advanced → Secret Key**.

- The Secret Key is masked by default and absent from ordinary identity UI.
- An explicit warning and confirmation are required before reveal. Copy is available only after reveal; Hide, Lock, and component unmount remove the value from the rendered view.
- The narrow session capability returns the existing 32-byte signing seed as exactly 64 lowercase hexadecimal characters only with the dedicated owner-confirmation authorization token. It does not generate a second identity or place the secret in React state.
- This exception does not permit the secret in server output, SSR HTML, APIs, Technocore requests, URLs, logs, telemetry, diagnostics, receipts, errors, cookies, or browser persistence.
- Encrypted Backup remains the recommended recovery and portability path. Advanced raw reveal is not the normal recovery workflow.
- Newly created V1 backup envelopes are pretty-printed while their schema, cryptography, and importer compatibility remain unchanged.

The rationale is user ownership: an informed owner can recover and control the key without turning FLOP into a key-custody service. The narrow interaction preserves the browser-local boundary and makes the exceptional exposure conspicuous and reversible.

## V13-02 identity-portability amendment

Explicit Product Owner authorization on 2026-09-07 supersedes the raw-secret prohibition only for deliberate, high-friction local portability. My Agent may download the already-held 32-byte Ed25519 seed as exactly 64 lowercase hexadecimal characters plus one final newline in `technocore-agent-secret.txt`. The payload has no DID, password, wrapper, metadata, or signature. Encrypted Backup remains the recommended recovery method.

`Import Existing Agent` is a bounded client-only adapter boundary distinct from `Restore Workbench Agent`. It supports plain 64-hex seed files and the independently reviewed CryptoTelugu browser-backup V4 format; Workbench Backup V1 detection redirects to and reuses the existing importer. Imported material is validated before becoming active, its public key and `did:key` are independently derived, asserted CryptoTelugu DID/public-key values must match, and the user must confirm the derived Public DID. Raw and third-party imports enter as `NOT_VERIFIED` and proceed to Secure/Verify; FLOP does not fabricate backup verification.

This amendment permits no raw-secret paste field, persistence, server upload/import, network fetch from file content, telemetry, diagnostics inclusion, Evidence inclusion, server signing, or additional cryptographic representation. JavaScript memory zeroization remains best effort.

## Consequences

V12-01 adds no UI, persistence, signing, publish function, fetch, API route, server relay, or Technocore write. Future signing must consume a separately reviewed narrow capability and requires separate phase authorization.
