# TASK_007 — Phase 7 — MVP Hardening

Status: COMPLETE — IMPLEMENTATION-HARDENING GATE PASS (2026-09-04)

Execute only this phase after PROJECT_STATUS names it active. Follow the matching plan, Build Handoff, acceptance criteria, and security model. Do not begin the following phase automatically.

Completion: satisfy the matching phase gate, update PROJECT_STATUS with actual results, report changed / why / files / tests / risks / gate status, then STOP.

## Defects repaired

1. `/api/inspect` previously buffered the full body before applying its 8 KiB limit. It now rejects an oversized declared body before consumption and cancels a chunked body immediately when the byte limit is crossed. Two regression tests cover both paths.
2. Successful DID inspection previously reused the “Valid empty result” message intended for empty room/export reports. It now says “Local DID inspection complete” and explicitly states that a DID is not an evidence verdict. E2E coverage prevents recurrence.

## Acceptance-criteria audit

All 24 criteria in `docs/04_quality/01_ACCEPTANCE_CRITERIA.md` are PASS:

1. PASS — contracts and accessible UI expose exactly Room, Message, DID, Export.
2. PASS — four mutually exclusive verdict constants; operational errors use a separate model/surface.
3. PASS — independent public known-good fixture verifies VALID.
4. PASS — room/nonce/text/DID/signature mutations produce locked non-valid/error results.
5. PASS — canonical byte test proves `<room>|<nonce>|<text>` and seq/ts exclusion.
6. PASS — exact category sweep and NFC/NFD distinction are tested; no normalization call exists.
7. PASS — the 19-digit nonce beyond 2^53 verifies and is displayed as exact text.
8. PASS — missing retained signature is UNVERIFIABLE.
9. PASS — unsigned activity is UNSIGNED.
10. PASS — SIGNED, SERVER_ASSERTED_UNSIGNED, UNTRUSTED_CALLER_DATA are modeled, derived, and displayed.
11. PASS — exact VALID copy and key-control-only limitation are E2E verified.
12. PASS — gap detection and cause-neutral UI wording are tested.
13. PASS — retained-data warning is E2E verified; prohibited history claims are absent.
14. PASS — composable p-/mb-/d-/e- cases are tested.
15. PASS — byte/line/line-byte/export and request limits plus mixed-line continuation are tested.
16. PASS — script/HTML/bidi/prompt-like content remains React text and does not execute.
17. PASS — content URLs, including a Technocore write URL, produce no derived request.
18. PASS — fixed-origin read construction, hostile destinations, redirects, and write-shaped paths are tested.
19. PASS — timeout, HTTP, parser, response, and message-absence failures remain operational.
20. PASS — pinned official tclk forms are fail-closed and carry no-settlement/value-transfer limitations.
21. PASS — no secret input/log/store/transmit path; safety copy and empty browser storage are verified.
22. PASS — source/dependency/scope review found no database/auth/wallet/signing/write/AI score implementation.
23. PASS — desktop/mobile manual review and 390 px long-content overflow assertion pass.
24. PASS — final typecheck/tests/lint/build/E2E/audit all pass.

## Critical-test-matrix audit

- Protocol: V01–V08 PASS (`tests/protocol/protocol-core.test.ts`).
- Canonicalization/precision: C01–C04 PASS (`tests/protocol/protocol-core.test.ts`).
- Transcript/export: T01, T02, E01–E03, empty export PASS (`tests/export/export-transcript.test.ts`).
- Room classes: R01 PASS (`tests/protocol/protocol-core.test.ts`).
- Security: S01–S06 PASS through protocol/live tests, E2E inert-render/request/storage assertions, and source/data-flow review.
- Network: N01–N03 PASS (`tests/live/safe-reader.test.ts`).
- tclk: K01–K03, heartbeat, exact eight-type union, offer-ID golden vector PASS (`tests/tclk/tclk-detection.test.ts`).
- UI: UI01 plus four modes, local DID/export, empty states, retention/gap/boundary copy, hostile rendering, no derived request, and keyboard path PASS (`e2e/inspector.spec.ts`).

## Final evidence

- `npm run typecheck`: PASS.
- `npm test`: PASS — 6 files / 106 tests.
- `npm run lint`: PASS — zero warnings.
- `npm run build`: PASS.
- `npm run test:e2e`: PASS — 6 Chromium tests.
- `npm audit --audit-level=high`: PASS — 0 vulnerabilities.
- Manual Chromium review: desktop Home/Trust Report/Message Detail/DID/Export/empty/error/tclk and 390 px mobile detail PASS; zero console/page errors; mobile client/scroll widths both 390 px.
- Firefox, WebKit, deployment, and production are NOT VERIFIED and were outside this phase.

No release or deployment was performed. Ready for product-owner RELEASE review; STOP pending explicit authorization.
