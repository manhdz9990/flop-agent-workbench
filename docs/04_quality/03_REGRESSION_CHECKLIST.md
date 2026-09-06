# Regression Checklist

Before every phase gate:
- [x] Active phase only; no later-phase scope leaked in.
- [x] VALID/INVALID/UNSIGNED/UNVERIFIABLE semantics unchanged.
- [x] Operational errors remain separate.
- [x] Canonical payload excludes seq/ts.
- [x] Nonce precision preserved as digits.
- [x] No Unicode normalization added.
- [x] No identity/reputation/honesty/truth claim from signature.
- [x] No sequence-gap cause inferred.
- [x] No full-history claim from retained data/export.
- [x] No tclk settlement/value-transfer conclusion.
- [x] No arbitrary URL fetch or content-derived network call.
- [x] No signing/write/key/wallet/auth/database feature.
- [x] Untrusted content remains inert.
- [x] Required tests/typecheck/lint/build for phase pass.
- [x] PROJECT_STATUS reflects actual verified state.
- [x] Codex stops for product-owner review.

Phase 7 evidence, 2026-09-04: 6 Vitest files / 106 tests PASS; 6 Chromium E2E tests PASS; typecheck, zero-warning lint, production build, dependency audit, source/data-flow security review, copy audit, and desktop/mobile manual Chromium review PASS. No deployment or release was performed.

V11-07 evidence, 2026-09-04: final V1.1 scope, network, input-limit, evidence,
pipeline, protocol, retention, tclk, receipt, hostile-content, UI-copy, and
architecture audits PASS. Typecheck PASS; 14 Vitest files / 195 tests PASS;
zero-warning lint PASS; production build PASS; 8 Chromium E2E tests PASS with
normal exit and port cleanup; high-level npm audit PASS with 0 vulnerabilities.
No deployment or release operation was performed.

V12-08D evidence, 2026-09-05: one cross-surface nonce-lifecycle ownership defect was corrected without changing nonce semantics. One Home-owned page-runtime reservation/attempt lifecycle now serves Onboarding and Rooms, with fixed-clock cross-navigation regression coverage. Typecheck PASS; 25 Vitest files / 305 tests PASS; zero-warning lint PASS; production build and route audit PASS; 11 Chromium E2E tests PASS with normal summary `11 passed (8.0s)`, exit code 0, clean port/process teardown; high-level npm audit PASS with 0 vulnerabilities. Static persistence, secret, logging, unsafe-HTML, timer/network-loop, write-route, hostile-content, product-claim, resource-limit, tclk, verdict, diagnostics, and receipt audits PASS. Automated tests performed zero live Technocore writes. No release or deployment occurred.
