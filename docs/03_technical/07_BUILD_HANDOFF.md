# BUILD_HANDOFF — VS Code + Codex

## Product
Technocore Protocol Inspector — MVP v0.1.

## Goal
A read-only evidence inspector that explains exactly what Technocore data proves — and what it does not.

## Target users / problem
Technocore participants, builders, and reviewers need to distinguish cryptographic evidence from server assertions, caller-chosen content, retained transcript limitations, and protocol-shaped activity. Raw signed data is easy to overclaim as identity/trust/history/settlement.

## Locked MVP
Room Inspect; Message Inspect; DID Inspect; JSONL Export Inspect; deterministic signature verification; exact canonical/sweep handling; VALID/INVALID/UNSIGNED/UNVERIFIABLE; signed/server/untrusted explanation; sequence gap detection; retention/export limitations; room-class explanation; safe untrusted rendering; basic official tclk/1 detection.

## Locked OUT
DID generation; signing/writes; key custody; wallets; account/login; global archive; reputation score; AI trust judgement; airdrop logic; full tclk execution; settlement; conformance-test suite.

## UX locked
Dark Infrastructure Grid. Flow: Home / Inspect → Trust Report → Message Detail. Verification-first hierarchy. Four verdict states always include plain-language meaning. Operational failures are visually/semantically separate from evidence verdicts.

## Architecture locked
Next.js + React + TypeScript + Tailwind; pure deterministic protocol modules; Noble Ed25519; minimal dependencies; no DB/auth/wallet. Data flow: Input → Validate → Safe Reader or Local Export → Exact Parser → Evidence Classifier → Verifier → Transcript/Room/tclk Analysis → Report Model → UI.

## Official protocol contracts verified 2026-09-03
- Names grammar: `^[a-z0-9][a-z0-9_-]{0,47}$`.
- Single-line sweep replaces Unicode categories Cc, Cf, Cs, Co, Zl, Zp with spaces, then trims ends; server does no Unicode normalization.
- Signed lane: Ed25519 `did:key:z6Mk…`, canonical unpadded 86-char base64url signature, nonce 1–19 digits.
- Signed bytes: UTF-8 `<room>|<nonce>|<text>` where text is post-sweep. `seq` and `ts` are server-assigned and unsigned.
- Missing stored `sig` on older records is “not re-verifiable”, not invalid.
- Nonce can exceed 2^53; preserve digits exactly.
- Room classes compose: p-/mb-/d-/e-.
- Rooms are retained rings; exports contain what is retained NOW, not guaranteed full history.
- Export is raw JSONL exact stored records; HTTP header `X-Room-Generation` identifies conversation epoch when fetched live; uploaded files may lack it.
- Caller-chosen content is untrusted. Never fetch URLs discovered in messages/topics/notes.
- Technocore settles nothing.
- tclk/1 is a convention layer; official repo is alpha and currently ships no value-bearing rail.

## Verification rules locked
VALID = complete required evidence + exact official Ed25519 verification succeeds.
INVALID = verification evidence is present but fails official structural/canonical/cryptographic requirements.
UNSIGNED = no cryptographic signing evidence for unsigned activity.
UNVERIFIABLE = signed/re-verifiable claim cannot be checked because required retained evidence is unavailable; not Invalid.
Network/parser/server failures are operational errors, never verdicts.
A valid signature proves key control for the signed payload only; never identity, reputation, honesty, wallet ownership, or truth.

## Security contracts locked
- Read-only; no Technocore writes.
- Never request/store/transmit private keys, seeds, passwords, wallet secrets, or signing tokens.
- No arbitrary URL fetch/proxy. Reader constructs allowlisted Technocore read URLs from validated identifiers only.
- Never auto-fetch/auto-open URLs from Technocore/user content.
- No `dangerouslySetInnerHTML` for untrusted content.
- Bounded parsers and file limits.
- Nonce is exact text.
- No AI truth/trust decisions.

## Dependencies
See `01_TECH_STACK.md`. Any protocol-sensitive dependency/version decision must be checked at implementation time. Do not add a large framework/dependency when a small audited library or platform API suffices.

## Acceptance / tests
`docs/04_quality/01_ACCEPTANCE_CRITERIA.md`, `02_TEST_CASES.md`, `03_REGRESSION_CHECKLIST.md`, and technical test strategy are mandatory source-of-truth.

## Implementation phases
Follow `docs/03_technical/06_IMPLEMENTATION_PLAN.md` and the matching active `plans/` + `tasks/` file. One phase only per product-owner approval. Never automatically continue.

## Known risks
Protocol evolution; retention ambiguity; JS integer precision; malicious URLs/content; tclk alpha semantics; confusing cryptographic authorship with real-world trust.

## Unresolved decisions
None blocking. If official protocol sources are ambiguous/conflicting during a phase, stop and report rather than inventing behavior.

## Exact first implementation action
Read `AGENTS.md`, `PROJECT_STATUS.md`, this handoff, acceptance criteria, `plans/PHASE_00_FOUNDATION.md`, and `tasks/TASK_001_FOUNDATION_EVIDENCE_CONTRACTS.md`; inspect repository; implement **only Phase 1 — Foundation + Evidence Contracts**; run checks; update PROJECT_STATUS; report gate status; STOP.

## V1.2 Build Handoff Amendment — FLOP Agent Workbench

This section supersedes only the V1.1 prohibitions on browser-local identity handling. The completed V1.1 debugger, exact protocol/verifier behavior, evidence verdicts, diagnostic stages and boundaries, receipts, fixed-origin bounded readers, parser limits, retained-history language, and observational-only tclk behavior remain locked.

V1.2 may support browser-local Ed25519 generation, user-entered backup passphrases, encrypted backup creation/import, temporary session-memory identity handling, and—after separate phase authorization—browser-local signing with explicit browser-direct Technocore publishing. These capabilities do not authorize server secret custody, server signing, a server write relay, persistent plaintext custody, automatic signing/publishing, or arbitrary destinations.

V12-01 is only the local identity and encrypted-backup foundation. It must contain no Technocore write behavior. At the time of this contract amendment its implementation was NOT STARTED and required separate product-owner authorization; that later authorization and completion state are recorded in `PROJECT_STATUS.md`.

Future publishing architecture is fixed to `browser → direct fixed Technocore write endpoint`, never `browser → Workbench server → Technocore`. Signing and publishing are separate explicit actions; there is no automatic retry; nonce reuse after an ambiguous attempt is forbidden; and publish success ultimately requires exact read-back plus independent verification.

The V1.2 secret boundary and threat controls are authoritative in `04_SECURITY_THREAT_MODEL.md`; V1.2 acceptance requirements are authoritative in `docs/04_quality/01_ACCEPTANCE_CRITERIA.md`.

## V12-03 Official Transport Contract Amendment

V12-03 is pinned to one upstream-documented lane only:

`GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>`

The values and order are exactly room, literal `say-signed`, DID, canonical unpadded base64url signature, exact 1–19 digit nonce, and V12-02 post-sweep text. There is no query, fragment, or body. Each dynamic component is encoded once with standard URL path-component semantics and must decode to the unchanged prepared value. V12-03 does not re-sign, re-sweep, or reconstruct different protocol evidence.

The URL is created only within explicit browser publish execution, targets only `https://technocore.chat`, and never passes through the Workbench server. The upstream POST variant is out of scope. Attempt begins and burns the nonce immediately before fetch. Any observed HTTP status is only `RESPONSE_RECEIVED`; fetch/CORS/timeout ambiguity is `OUTCOME_UNKNOWN`. No automatic retry or verified-publication claim is permitted.

The canonical source and response-dependency decision are recorded in `03_INTEGRATIONS.md`; security controls are recorded in `04_SECURITY_THREAT_MODEL.md`. At reconciliation time V12-03 implementation remained NOT STARTED pending separate authorization; its later implementation and gate state are recorded in `PROJECT_STATUS.md`.
