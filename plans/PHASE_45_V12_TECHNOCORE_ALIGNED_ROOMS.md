# Phase 45 — V1.2 Technocore-aligned Rooms rebuild

## Scope

Rebuild only the central Rooms chat interaction around the current official Technocore `/humans` cursor-pump behavior. Preserve the FLOP shell, identity/backup ownership, browser-local signing, nonce burn, fixed-origin publishing, verifier, Evidence, and diagnostics.

## Plan

1. Audit the official rendered client and current `src/humans.html`/server signed lanes.
2. Replace the delayed custom session behavior with the official initial-read/cursor/long-poll/re-poll lifecycle.
3. Repair current-state append/dedupe and exact optimistic-to-authoritative reconciliation.
4. Make Rooms a dense chat with a compact composer and progressive evidence details.
5. Harden scheduler, reconciliation, stale-room, security, layout, and E2E coverage.
6. Run the complete gate and a real 60-second read-only comparison. Leave the single real signed write to the Product Owner/manual interactive acceptance session.

## Stop conditions

No automated live write, commit, push, release, deployment, new dependency, route, persistence, WebSocket, SSE, server signer, or server write relay.
