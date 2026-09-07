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

## V1.2 identity ownership and beginner UX amendment — 2026-09-07

Bounded scope: clarify Public DID, Secret Key, signing, recovery, proof limits, and portability; add an explicitly confirmed and masked-by-default browser-only Advanced Secret Key reveal/copy path; preserve Encrypted Backup as the recommended path; pretty-print the unchanged V1 backup envelope; and retain all existing signing, nonce, Rooms, backend, verification, and publish behavior. Completion requires identity/security tests, the full repository gate, documentation reconciliation, Product Owner manual review, and no deployment.
# V1.3 — Guided Agent Journey & Contribution Evidence

## V13-01 — Guided Onboarding Foundation

Status: COMPLETE / LOCAL PASS. Product Owner review required before any V13-02 work or release action.

Implement the deterministic 12-state journey model, newcomer journey shell, existing Create/Secure/Verify capability integration, bounded browser-memory-only Personalize state, and earliest-incomplete routing. Reserve but do not implement guided messaging, cards, X sharing, contributions, evidence verification, or Identity Portability. Run the complete gate and stop before V13-02, commit, push, or deployment.

## V13-02 — Identity Portability

Status: COMPLETE / LOCAL PASS. Product Owner review required before any later V1.3 phase or release action.

Implement the closed identity-adapter registry, advanced raw Secret Key download, Workbench V1 restore redirection, reviewed CryptoTelugu V4 local decryption/consistency checks, plain-seed local import, explicit Public DID confirmation, and earliest-incomplete onboarding routing. Preserve the single runtime identity owner and all backend, API, signing, nonce, Rooms, and persistence boundaries. Complete with deterministic synthetic fixtures, full repository gates, documentation/status updates, and no commit, push, or deployment.

## V13-03 — Guided First Signed Message

Status: COMPLETE / LOCAL PASS. Product Owner review required. Reuse the existing page-owned identity, nonce, publish-attempt, browser-direct transport, read-back, and verification modules for one editable deterministic `#lobby` introduction. Advance to locked CARD only after exact observed + VALID. No Agent Card, Rooms redesign, API, dependency, commit, push, or deployment.

## V13-04 — Verified Agent Card + X Share

Status: COMPLETE / LOCAL PASS. Product Owner review required. Derive a minimal public card DTO only after verified first-message evidence, render a responsive branded preview, export a same-model 1600×900 PNG locally, and provide bounded editable X drafts with Copy/Open Intent/manual attachment instructions. Stop with X URL attachment and contribution states locked. No dependency, backend, protocol, commit, push, or deployment.

## V13-05 — X Attachment + Signed Contribution Evidence + Agent Ready

Status: COMPLETE / LOCAL PASS. Strictly normalize a user-provided X status reference, review deterministic public `flop-agent-contribution/v1` JSON, explicitly sign/publish through shared runtime owners to the documented `#lobby` Workbench convention, require exact read-back plus VALID, produce local JSON/Markdown receipt, and expose honest Agent Ready navigation. No release action.

## V13-06 — End-to-End Product QA + UX Polish + Release Candidate

Status: COMPLETE / LOCAL PASS. Review the complete newcomer, Restore/Import, Lock, failure, responsive, accessibility, and security journeys as one product. Permit only bounded presentation corrections. A release candidate still requires Product Owner manual acceptance of any deliberately real Technocore/X actions before release authorization.
