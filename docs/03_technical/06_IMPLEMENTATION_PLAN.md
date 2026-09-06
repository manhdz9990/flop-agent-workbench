# Implementation Plan

Codex executes one phase at a time and stops for product-owner review after each completion gate.

## Phase 1 — Foundation + Evidence Contracts
Objective: runnable app/test foundation and locked domain contracts only.
Scope: Next.js/TS/Tailwind, test runner, input/verdict/evidence/report/error types, fixture structure, baseline contract tests.
Gate: foundation runnable; contracts compile; tests/lint/build pass; no protocol/network/UI behavior beyond shell; PROJECT_STATUS updated; STOP.

## Phase 2 — Exact Protocol Core
Objective: deterministic offline protocol primitives.
Scope: official single-line sweep, exact canonical payload, DID decode, canonical signature decode, Ed25519 verification, nonce-string handling, room-class parser; independent fixtures.
Gate: all four evidence states proven with fixtures; mutation tests fail correctly; 19-digit nonce passes; no network/UI/tclk; STOP.

## Phase 3 — Export + Transcript Analysis
Objective: safe local JSONL evidence analysis.
Scope: bounded JSONL parser, line errors, sequence gaps, retained-window model, export/generation-metadata semantics, report model.
Gate: valid/malformed/mixed/gapped/large-nonce exports tested; no full-history claim; local-only export path; STOP.

## Phase 4 — Safe Live Reader + Input Resolution
Objective: Room/Message/DID input paths with strict read-only boundary.
Scope: validators, hardcoded Technocore origin reader, read endpoint builders, timeout/error mapping, no arbitrary URL, DID local inspect.
Gate: SSRF/confused-deputy tests pass; write endpoints impossible through reader API; network errors separate from verdicts; STOP.

## Phase 5 — tclk/1 Detection
Objective: conservative official tclk/1 interpretation.
Scope: verified frame detection subset and report annotations only.
Gate: official/spec-derived positive/negative fixtures pass; no settlement/economic conclusion; STOP.

## Phase 6 — UX/UI
Objective: approved Home/Inspect → Trust Report → Message Detail experience.
Scope: Dark Infrastructure Grid, four inputs, report, detail, states/warnings/errors, responsive behavior.
Gate: acceptance UI flows + accessibility basics + hostile rendering tests + responsive E2E pass; STOP.

## Phase 7 — MVP Hardening
Objective: final security/regression/release readiness without new features.
Scope: full matrix, dependency review, production build, manual regression, docs/status.
Gate: all MVP acceptance criteria pass; no OUT scope; security checklist clean; PROJECT_STATUS ready for RELEASE review; STOP.

## V1.2 roadmap amendment after V12-08 manual validation

Completed historical V12-01 through V12-07 records remain authoritative. V12-08 Manual Product Validation is COMPLETE / PASS based on explicitly recorded product-owner manual observations; it is not automated-test evidence.

### V12-08A — Rooms / Chat
Purpose: add a human-friendly bounded public-room/conversation surface by composing the existing reader, signing, publish, read-back, verifier, diagnostics, and receipt engines. Manual refresh only; hostile content remains inert; no polling, crawler/archive, server write relay, persistence, DMs, room creation, social, reputation, or reward features.

### V12-08B — My Agent
Purpose: provide a workspace for the current active local Agent identity: public DID, runtime session status, backup/recovery and import/restore entry, lock/clear, DID inspection, and observed-own-evidence links where available. It is not an account, wallet, authentication system, persistent secret store, server custody model, reputation claim, or real-world identity claim.

### V12-08C — Evidence / My Activity
Purpose: show locally/session-observed signed activity, verification status, room/message references, receipts, and diagnostics. Use Evidence / Observed Activity language; no contribution/reward/airdrop/eligibility/reputation/trust score, global archive, or official FLOP contribution-credit claim.

### V12-08D — Integration & Security Regression
Purpose: audit V12-08A/B/C together before visual redesign, covering identity/backup boundaries, signing and nonce behavior, explicit publish and read-back semantics, evidence verdicts, hostile content, persistence absence, unintended writes, server-relay absence, and V1.1/V1.2 regression safety.

### Remaining sequence
V12-09 UI/UX Polish → V12-10 Final Regression & Release Preflight → Final Release Review → deployment only after explicit product-owner authorization. Each phase requires separate authorization and stops at its own completion gate.
