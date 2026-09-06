# Tech Stack — Locked

## Application
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Node/npm toolchain

## Verification
- `@noble/ed25519` (or current audited Noble Ed25519 package API at implementation time) for deterministic Ed25519 verification.
- Minimal multibase/base58 decoding dependency only if required; prefer a small audited package rather than implementing base58 ad hoc.
- Official tclk package/parser **only if the official repo exposes a stable consumable parser suitable for the detected frame subset at implementation time**. Otherwise implement only conservative string/shape detection explicitly supported by official spec; do not guess undocumented semantics.

## Testing
- Vitest for unit/integration.
- Playwright for critical browser/E2E flows when UI phase begins.

## Persistence
No database, auth, wallet, or server-side user storage in MVP.

## Deployment
Standard Next.js deployment. Server-side network access, if used, must be constrained to a hardcoded Technocore origin and read-only endpoint builder; never proxy arbitrary user URLs.
