# V12-08D Integration & Security Review

Verified 2026-09-05.

| Audit area | Result | Evidence |
|---|---|---|
| Identity authority | PASS | One `Home`-owned `LocalIdentitySession`; Create/Import updates all consumers; Lock invokes session lock and removes capability everywhere. |
| Cross-surface nonce lifecycle | PASS after correction | One page-runtime reservations/attempts lifecycle is shared by Onboarding and Rooms; fixed-clock E2E proves navigation does not reuse a nonce. |
| Secret handling and persistence | PASS | No secret getter, serialization, DOM output, URL sink, logging, server route, storage API, database, cache, cookie, or telemetry path. |
| Backup security | PASS | 16 KiB pre-KDF bound; exact schema/version/KDF/cipher/canonical-encoding validation; authenticated decrypt and DID match fail closed. Crypto unchanged. |
| Signing and nonce | PASS | Exact `<room>|<nonce>|<post-sweep text>` UTF-8 payload, canonical signature, self-verification, BigInt/string arithmetic, DID+room reservation, and edit invalidation retained. |
| Publish boundary | PASS | Explicit-only browser-direct fixed-origin signed GET; burn before fetch; no retry, relay, alternate transport, rendered URL, or content-triggered write. |
| Publication/read-back | PASS | Response and ambiguity remain non-success; exact five-field retained match plus existing verifier `VALID` is required for `PUBLISHED_AND_VERIFIED`; other states remain distinct. |
| Evidence | PASS | Only explicit room observation or exact verified read-back qualifies; four verdicts remain unchanged; no contribution/history/scoring inference. |
| Diagnostics/receipt/tclk | PASS | Existing 12 stages, five stage statuses, first-boundary rules, receipt limitations, and observation-only tclk behavior remain unchanged. |
| Hostile content | PASS | HTML/script-like strings, URL schemes, write URLs, prompt injection, misleading names, and bounded long strings remain inert; no automatic link/fetch/execute/write behavior. |
| Public rooms and API | PASS | Manual refresh, bounded fixed-origin reads, retained-order display, only `inspect` and `rooms` server routes; no polling/crawler/archive/private discovery. |
| Resource limits | PASS | Export 5 MiB / 10,000 lines / 256 KiB line; live 2 MiB / 10 s / 200 messages; inspect body 8 KiB; tclk 4096 chars. |
| Product claims | PASS | Identity, history, publication, evidence, trust, reputation, reward, eligibility, payment, and settlement limitations remain explicit. |

Completion gate: typecheck PASS; 25 files / 305 unit tests PASS; lint PASS with zero warnings; production build and route audit PASS; Chromium E2E 11/11 PASS with `11 passed (8.0s)`, exit code 0, clean port/process teardown; npm audit PASS with 0 vulnerabilities; zero automated live Technocore writes.

Remaining limitations: Chromium-only automated browser coverage; runtime-only identity and Evidence; bounded retained public observations are not complete history; automated tests make no live writes; production and deployment remain unverified and paused.
