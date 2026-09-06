# Phase 10 (V11-04) — Verification Pipeline Adapter

## Objective
Expose a canonical, deterministic 12-stage Verification Pipeline around the
existing verified protocol and transcript-diagnostics engine without creating
a second verifier.

## Inputs
- Selected `ROOM`, `MESSAGE`, or `EXPORT` evidence from V11-03
  `TranscriptDiagnostics`.
- DID-only text for the applicable key-diagnostic subset.

## Output
- Exactly 12 ordered diagnostic stages with deterministic V11-01 meaning and
  check-next copy.
- First failed boundary, or first unavailable boundary only when no failure
  exists.
- Existing Evidence Verdict when a selected message supplies one.
- Operational errors separately.
- Existing bounded tclk observation when applicable.

## Required invariants
- Diagnostic statuses remain exactly `PASS`, `FAIL`, `UNAVAILABLE`,
  `NOT_APPLICABLE`, and `NOT_OBSERVED`.
- Evidence Verdict remains exactly `VALID`, `INVALID`, `UNSIGNED`, or
  `UNVERIFIABLE`, and is never derived from a diagnostic status.
- `INVALID` continues to come only from the existing verifier after an
  executed false Ed25519 check with usable prerequisites.
- DID-only input never invents message, nonce, signature, or tclk evidence.
- Operational errors, retained-window limits, and tclk observation-only
  semantics remain separate and unchanged.

## Out of scope
UI, routes, parser/limit changes, verifier changes, new network behavior,
persistence, wallet/signing/key custody, trust/ranking/AI judgment,
release/deployment, and V11-05+.

## Verification
Focused pipeline tests plus the complete typecheck, unit, lint, production
build, Playwright, and npm-audit gate.

## Completion gate
All contract invariants and tests pass; `PROJECT_STATUS.md` is updated
truthfully; stop before V11-05.
