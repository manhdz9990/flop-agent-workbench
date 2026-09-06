# PRD — MVP v0.1

## Product goal
A read-only evidence inspector that explains exactly what Technocore data proves — and what it does not.

## Core requirements
1. Accept exactly four input modes: Room, Message, DID, JSONL Export.
2. Produce deterministic evidence results; AI/LLM must never determine VALID/INVALID or protocol truth.
3. Use exactly four cryptographic evidence states: VALID, INVALID, UNSIGNED, UNVERIFIABLE.
4. Rebuild the official signed payload exactly and preserve nonce digits without JS number rounding.
5. Explain signed fields separately from server assertions and untrusted/caller-chosen data.
6. Detect observable sequence discontinuities without inferring why they exist.
7. Explain retained-window/export limitations; never label available data as full history unless an official guarantee exists (none is assumed).
8. Explain room classes from official prefix rules.
9. Render all external content as inert data; URLs are text, never auto-fetched or auto-opened by analysis logic.
10. Detect/interpret basic official tclk/1 frames conservatively; never claim settlement/value transfer.
11. No account, wallet, signing, writes, secret custody, database, reputation score, or AI truth judgement.

## Evidence semantics
- VALID: required evidence exists and Ed25519 verification succeeds for the exact official payload.
- INVALID: required verification evidence exists, is structurally acceptable enough to attempt verification, and cryptographic verification fails / canonical signature requirements fail.
- UNSIGNED: record is from the unsigned lane / no signed evidence is asserted.
- UNVERIFIABLE: a record appears signed or requires re-verification but required retained evidence is unavailable (notably legacy missing `sig`); this is not a negative cryptographic verdict.
- Operational/parser/network errors are separate from these four states.

## Product language invariants

### V1.1 historical contract

Never say: verified identity, trusted user, honest, reputable, complete history, deleted because of X, settled, payment completed — unless a future approved source/model explicitly proves the exact claim. MVP does not.

## V1.2 amendment — FLOP Agent Workbench

V1.1 remains the completed read-only Technocore Protocol Debugger contract above. V1.2 evolves the product into FLOP Agent Workbench while preserving that debugger and all of its evidence, protocol, diagnostic, receipt, retention, and tclk limitations.

V1.2 may add browser-local Ed25519 identity generation, user-entered backup passphrases, encrypted identity backup creation, browser-local backup import/decryption, temporary session-memory identity handling, and—only in separately authorized later phases—explicit browser-local signing and browser-direct Technocore publishing.

For V1.2, local identity handling means temporary, user-controlled secret processing inside the browser required to generate, encrypt, decrypt, restore, and later sign with an identity. It is not server custody and does not authorize persistent plaintext custody.

V12-01 is limited to local identity and encrypted-backup foundations. It authorizes no Technocore write, signing UI, publishing, server relay, wallet, blockchain behavior, database, telemetry, analytics, or deployment work.

## V1.2 roadmap reconciliation — post-validation Workbench surfaces

Product-owner manual validation has completed the existing onboarding core flow through browser-local identity, encrypted backup and restore, explicit signing and publish attempt, independent read-back verification, and Evidence Receipt generation. This is recorded as manual evidence in `PROJECT_STATUS.md`, not as automated verification or proof of general hosted CORS behavior.

The remaining approved product sequence is V12-08A Rooms / Chat, V12-08B My Agent, V12-08C Evidence / My Activity, V12-08D Integration & Security Regression, V12-09 UI/UX Polish, and V12-10 Final Regression & Release Preflight. Final release review and deployment remain separately authorized actions.

These surfaces compose the existing V1.1/V1.2 protocol, identity, signing, publishing, read-back, diagnostic, and receipt engines. They do not create an account, wallet, trust/reputation/reward system, server secret custody, server write relay, persistent identity store, crawler, or global archive.
