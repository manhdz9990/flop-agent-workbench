# TASK 048 — V1.2 Existing Agent Restore UX

## Status

COMPLETE / LOCAL PASS — 2026-09-07; awaiting Product Owner manual review; no commit, push, or deployment.

## Goal

Make the distinction between a user-owned Agent identity and the currently unlocked browser session explicit. Create New Agent is the sole filled primary unloaded-state CTA; a returning owner sees the familiar secondary text prompt **Already have an Agent? Restore Agent** and recovers the same DID through the existing encrypted V1 backup importer.

## Scope

- Differentiate Restore Agent from Create New Agent in unloaded states.
- Reuse the existing V1 parser, local decryption, DID derivation/match, and runtime identity holder.
- Explain local decryption, file + Backup Password requirements, and same-DID recovery.
- Show a truthful Agent Restored success state with an Open Technocore Rooms action.
- Warn that Create New Agent creates a new DID.
- Preserve Lock, browser-only secrets, signing, nonce, Rooms, backend, and backup V1 behavior.

## Acceptance criteria

1. Unloaded Home and My Agent surfaces present Create New Agent as the sole filled primary CTA and Restore Agent as a separate keyboard-accessible text action.
2. Restore accepts valid existing V1 backups and activates the exact envelope/derived DID as Ready to Sign.
3. Wrong password, malformed backup, and DID mismatch continue to fail safely through the existing importer.
4. Restore sends and persists neither raw seed nor Backup Password.
5. Lock clears the current runtime secret and leaves an obvious Restore Agent path.
6. Create New Agent explains that it creates a new DID and points existing owners to restore.
7. Existing backup verification, signing, nonce, publishing, verification, Evidence, and Live Rooms behavior remain unchanged.
8. Full repository gates pass with zero automated live Technocore writes.

## Verification

- Focused identity/onboarding/static contract tests.
- Chromium E2E covering backup creation, lock/unloaded state, restore of the same DID, local storage/request boundaries, and mobile reachability.
- Full typecheck, unit/integration, ESLint, production build, Chromium E2E, and offline dependency audit.

## Result

The existing V1 importer is the sole restore engine. Full gate PASS: typecheck; 27/27 unit/integration files and 334/334 tests; ESLint with zero warnings; production build; Chromium 21/21; offline npm audit with 0 vulnerabilities. The controlled browser flow created and verified a backup, locked the session, restored the exact original DID, confirmed Ready to Sign, observed no Backup Password in requests, and found no local/session/cookie persistence. Automated live Technocore writes: NO.

Product Owner UI refinement: unloaded Home/My Agent now use Create New Agent as the only filled primary identity-entry action, with Restore Agent immediately below as text-link treatment. The existing new-DID warning remains inside Create; restore behavior is unchanged.

Post-refinement gate PASS: typecheck; 27/27 unit/integration files and 334/334 tests; ESLint with zero warnings; production build; Chromium 21/21, including an exact one-visible-primary assertion and text-action classification; offline npm audit with 0 vulnerabilities.

Final Agent UX consolidation: unloaded Agent-dependent status cards are hidden; header state is minimal and active DID opens My Agent; active Home uses useful beginner statuses; verified backup and restore lead directly to Open Technocore Rooms; Create warning is shown only before generation; Rooms terminology uses Create or Restore. Identity, backup, signing, nonce, publishing, verification, Evidence, Rooms, and backend logic remain unchanged.

Final consolidation gate PASS: typecheck; 27/27 unit/integration files and 334/334 tests; ESLint with zero warnings; production build; Chromium 21/21 across new-user, returning-user, Lock, refresh, Advanced Secret, wrong-password, desktop 1440px, constrained 900px, and mobile 390px journeys; offline npm audit with 0 vulnerabilities. No automated live Technocore write, commit, push, or deployment.
