# Phase 9 (V11-03) — Transcript Diagnostics Adapter

## Objective
Adapt already-observed live-room and local-export transcript evidence into
deterministic developer diagnostics using the V11-01 contracts and existing
verified parsers, protocol verifier, and tclk detector.

## Scope
- Minimal verifier correction: malformed/noncanonical signatures are
  `UNVERIFIABLE`; `INVALID` requires an executed false Ed25519 check.
- Pure adapter and types under `lib/diagnostics/`.
- Focused adapter and regression tests under `tests/diagnostics/` and the
  directly affected protocol test.
- Status documentation after verification.

## Out of scope
- UI, routes, network discovery, parser rewrites, new dependencies,
  persistence, signing/wallet behavior, release/deployment, and V11-04+.

## Completion gate
- Live and export transcript outputs adapt without changing existing limits.
- Every diagnosed record contains all 12 locked stages in order with central
  deterministic copy and correct boundary selection.
- Operational errors and evidence verdicts remain separate.
- Only executed false Ed25519 verification yields `INVALID`.
- Empty, malformed, mixed, sequence-gap, unsigned, and tclk cases are tested.
- Required typecheck, unit, lint, build, e2e, and audit commands pass.
