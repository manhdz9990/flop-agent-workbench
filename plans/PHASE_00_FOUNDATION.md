# Phase 1 — Foundation + Evidence Contracts

## Objective
Create the clean runnable application/test foundation and encode approved product/evidence contracts without implementing protocol-sensitive behavior.

## Scope
- Initialize Next.js + React + TypeScript + Tailwind in the implementation area without overwriting Vibe Coding OS files.
- Establish Vitest and standard typecheck/lint/build commands.
- Define contracts for InputKind, VerificationState, EvidenceAuthority, OperationalError, Warning, TrustReport, MessageEvidence.
- Create independent fixture directories and provenance README.
- Add contract tests enforcing four verdict states and separation from operational errors.

## Dependencies
AGENTS.md; PROJECT_STATUS; Build Handoff; acceptance criteria. No live Technocore dependency.

## Expected modules
Exact paths may follow the chosen Next.js project layout, but separation must include: `lib/domain`, `lib/protocol` placeholder boundary, `tests/fixtures/protocol`, `tests/fixtures/security`, `tests/contracts`.

## Must NOT implement
Network reader; sweep; canonical payload; DID crypto; Ed25519; JSONL parser; tclk; Trust Report UI beyond default app shell; visual polish; DB/auth/wallet/AI.

## Acceptance
- App foundation starts/builds.
- Locked contracts compile.
- Four verdict values are exactly VALID/INVALID/UNSIGNED/UNVERIFIABLE.
- Operational errors are a separate type/domain.
- EvidenceAuthority can represent SIGNED / SERVER_ASSERTED_UNSIGNED / UNTRUSTED_CALLER_DATA without implying semantic trust.
- Fixture provenance rules documented.
- Typecheck/tests/lint/build pass.

## Security checks
No secret fields; no arbitrary fetch; no write API; no `dangerouslySetInnerHTML`; no later-phase protocol code.

## Completion gate
1. Foundation runnable.
2. Contracts/tests pass.
3. Fixture structure exists.
4. No later-phase behavior exists.
5. PROJECT_STATUS updated with actual results.
6. Codex reports changed / why / files / tests / risks / gate status.
7. **STOP. Do not begin Phase 2 without product-owner approval.**
