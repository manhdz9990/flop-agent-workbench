# TASK 049 — V13-01 Guided Onboarding Foundation

## Status

COMPLETE / LOCAL PASS — 2026-09-07. No commit, push, or deployment performed.

## Scope

- Add the canonical deterministic journey model.
- Build a beginner Guided Journey shell with one primary task per screen.
- Reuse Create, encrypted Backup, and same-DID verification.
- Add bounded browser-memory-only self-declared profile metadata.
- Route active/restored Agents to the earliest genuinely incomplete required step.
- Reserve later V1.3 states without fake completion or implementation.

## Protected boundaries

No cryptography, backup V1 schema, Secret Key behavior, signing, nonce, publishing, read-back, Evidence semantics, Live Rooms, API/backend, network destination, dependency, or persistence change.

## Verification

State-model unit tests; guided new-user Chromium path; existing identity/backup/restore/security/Rooms regression; desktop/mobile overflow and accessibility sanity; typecheck, full tests, ESLint, production build, Chromium E2E, and dependency audit.

Final gate: typecheck PASS; 28/28 unit/integration files and 339/339 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 22/22 PASS; offline npm audit PASS with 0 vulnerabilities. Automated live Technocore writes: NO.
