# Exact protocol core

This directory contains Phase 2's pure, offline Technocore primitives: official single-line
sweep, canonical signed bytes, Ed25519 `did:key` and signature decoding, verification-state
classification, and composable room-class parsing.

The verifier accepts post-sweep stored text. It never normalizes Unicode, converts a nonce to a
JavaScript number, resolves a DID, fetches a URL, or treats `seq`/`ts` as signed fields.
