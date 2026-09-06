# Phase 8 (V11-01) — Diagnostic Foundation Contracts

## Provenance note
This phase was authorized via an external Build Contract referring to it as
"V1.1 / V11-01." No corresponding plan/task existed in this repository prior
to this file; Phase 7 (MVP Hardening) was this repo's last recorded phase,
followed by an unrelated, unverified Vercel release preflight (see
`PROJECT_STATUS.md`). This document bridges that external contract into the
repo's own phase/task numbering as **Phase 8**, without altering or
re-authorizing the preflight or any later phase.

## Objective
Add pure, deterministic diagnostic foundation contracts and a centralized
diagnostic-copy rule registry. No cryptographic verification behavior,
route behavior, or UI flow changes.

## Scope
- New module under `lib/diagnostics/` only.
- Diagnostic status type: `PASS | FAIL | UNAVAILABLE | NOT_APPLICABLE | NOT_OBSERVED`.
- Locked ordered Verification Pipeline stage list (12 stages, source
  availability → tclk structural/binding).
- Pure types: diagnostic stage result, first-failed-boundary,
  first-unavailable-boundary, "What this means", "Check next".
- Deterministic boundary-selection helpers (earliest FAIL wins; UNAVAILABLE
  only considered when no FAIL exists; NOT_APPLICABLE/NOT_OBSERVED never a
  boundary).
- Central rules registry mapping stage + status → meaning/next-check copy.
- Unit/contract tests for stage order, all five statuses, boundary
  selection, no-FAIL behavior, deterministic copy mapping.

## Out of scope (this phase)
- Any change to `lib/protocol/`, `lib/live/`, `lib/export/`, `lib/tclk/`,
  `app/api/inspect/route.ts`, or any React/UI code.
- V11-02 or any later phase.
- Deployment, domain, or Vercel configuration changes.
- New dependencies.

## Dependencies
Reuses existing repo conventions from `lib/domain/contracts.ts` (readonly
interfaces, `as const` tuples, `describe/it` Vitest style under `tests/`).

## Acceptance / tests
- New tests under `tests/diagnostics/`.
- Existing test suites must remain green (typecheck, `npm test`, lint,
  build, `npm run test:e2e`, `npm audit --audit-level=high`).

## Completion gate
- Single source of truth for diagnostic statuses/stage order/meanings/next
  checks exists.
- All five statuses representable/distinguishable.
- Earliest FAIL wins; UNAVAILABLE only chosen absent a FAIL; NOT_APPLICABLE
  and NOT_OBSERVED never become boundaries.
- No helper infers root cause beyond the evidence present.
- No existing verifier/parser/safe-reader/tclk-detector/export-limit/route
  contract weakened or rewritten; existing tests remain passing.
- Update `PROJECT_STATUS.md` truthfully; STOP — do not begin V11-02 or any
  release/deployment step.
