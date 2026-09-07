# TASK 050 — V13-02 Identity Portability

## Status

COMPLETE / LOCAL PASS — 2026-09-07. Product Owner review required. No commit, push, or deployment performed.

## Scope

- Distinguish Create, Workbench Restore, and compatible Existing Agent import.
- Add confirmed Advanced raw Secret Key `.txt` download.
- Support the closed Workbench V1, reviewed CryptoTelugu V4, and plain 64-hex seed registry.
- Validate/decrypt/derive locally, enforce asserted identity consistency, show Public DID, and require confirmation before activation.
- Route unverified imports through the existing Secure/Verify journey without duplicating identity state.

## Verification

Deterministic synthetic fixtures; parser/KDF/mismatch/leakage boundaries; export/reimport same DID; existing backup/onboarding/Rooms regression; typecheck, full unit/integration, ESLint, production build, Chromium E2E, security audit, dependency audit, responsive/accessibility sanity. Automated live Technocore writes: prohibited.

Final gate: typecheck PASS; 29/29 unit/integration files and 357/357 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 24/24 PASS; offline npm audit PASS with 0 vulnerabilities. Zero automated live Technocore writes. Runtime code, tests, ADR/architecture/security registry, acceptance criteria, and project status were reconciled.
