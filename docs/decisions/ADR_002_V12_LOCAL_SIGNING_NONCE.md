# ADR 002 — V1.2 Local Signing and Nonce Preparation Boundary

## Status

Accepted and implemented for V12-02 on 2026-09-05.

## Decision

- Signing remains inside the V12-01 session identity holder; no raw seed/private-key getter is added.
- Inputs are only room, source text, optional highest observed nonce, session reservations, and an injectable exact-integer clock.
- Existing room validation, sweep, canonical payload, Ed25519 signature encoding, and verifier are reused.
- Nonce candidates are exact decimal strings selected with BigInt as `max(now, observed + 1, session + 1)` within the existing 1–19 digit contract.
- Reservations are held only in an in-memory nested map keyed by DID and room.
- Output is an immutable public `SIGNED_LOCALLY_NOT_PUBLISHED` descriptor. Local signing and independent verification do not imply publication.

## Security consequences

V12-02 adds no fetch, write endpoint, write URL, publisher, API route, server relay, persistence, automatic signing, retry, or publish-attempt burning behavior. V12-03 requires separate authorization.
