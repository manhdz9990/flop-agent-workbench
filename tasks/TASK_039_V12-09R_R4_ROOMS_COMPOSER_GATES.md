# Task 039 — V12-09R R4 Rooms Composer Gates

## Status

COMPLETE / PASS

## Acceptance

- No-Agent state shows exact read-only copy, Create or Import Agent action, secret warning, and no active textarea/sign/publish action.
- Agent without verified backup shows exact locked copy, Secure Backup action, retained-reading note, and no active textarea/sign/publish action.
- Ready state binds visibly to the selected room and shows public/untrusted and secret warnings, an accessible textarea, current character count only, and Review Message.
- Review remains in Rooms and shows exact room, DID, swept text, nonce, technical disclosure, Sign Locally, and Edit Message.
- Signing stays local, creates no write, and shows Signed locally / NOT been published before the existing explicit publish action.
- Existing message reads, Inspect message, Add to Evidence, state ownership, and all protected behavior remain unchanged.
- No general Rooms message limit exists or is implied: no maximum counter, `maxLength`, new threshold validation, or truncation. The 4096-character tclk limit is unrelated and must not be reused.
- Full gate and desktop/mobile visual review pass with no new dependency, API, persistence, polling, automated live write, R5 work, release, or deployment.

## Result

All acceptance criteria passed. The product-owner clarification is authoritative: the counter is presentation-only (`{used} characters`), and no general Rooms message-length limit may be inferred from R4 or from the separate tclk 4096-character bound.

Verification: typecheck PASS; 25/25 test files and 317/317 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 15/15 PASS; offline npm audit PASS with 0 vulnerabilities; desktop and 390 px rendered review PASS.
