# TASK_019 — Phase 18 (V12-05) — Guided Newcomer Onboarding

## Status

COMPLETE — Completion Gate PASS.

Verified on 2026-09-05: typecheck PASS; 19 files / 275 unit tests PASS; lint PASS with zero warnings; production build PASS; Playwright 9/9 PASS with normal summary `9 passed (6.5s)` and exit code 0; port 3100 clear afterward; high-threshold npm audit PASS with 0 vulnerabilities. Automated tests used intercepted/mocked Technocore endpoints and performed zero live writes.

## Objective

Expose one functional newcomer path using only the approved V12-01 identity/backup, V12-02 signing, V12-03 publish, V12-04 read-back, and existing receipt capabilities while preserving all domain and security semantics.

## Acceptance criteria

- Identity creation and encrypted-backup import remain browser-local and expose no raw secret fields.
- Backup download does not enable signing; successful local import/verification of the matching identity does.
- Introduction defaults to `lobby` and exact room, DID, nonce, post-sweep text, and canonical payload are inspectable before a separate sign action.
- Editing signed input invalidates the actionable descriptor and never auto-signs.
- Publish is a second explicit action, constructs no URL in UI, offers no same-nonce retry, and preserves V12-03 ambiguity copy.
- Read-back is explicit, uses V12-04, and preserves all four result meanings without HTTP-success or causal overclaim.
- Existing receipt output and limitations are reused; hostile content is inert.
- Existing debugger remains accessible; no persistence, server relay, dependency, broad redesign, V12-06, or deployment is added.
- Automated tests mock all write/read boundaries and the full Completion Gate passes.

## Recovery

Revert the additive onboarding component and its Start-page/CSS/test/documentation integration. V12-01 through V12-04 and V1.1 domain implementations remain independently intact.
