# V12-07 Security & Regression Checklist

| Boundary | Result | Evidence |
|---|---|---|
| Secret exfiltration/persistence/logging | PASS | No ordinary secret getter/render, server route, storage API, or log call; encrypted backup remains primary; passphrase inputs clear after operations. Per the later ADR 001 amendment, the confirmed client-only My Agent Advanced reveal is the sole rendering exception. |
| Backup schema/resource/KDF abuse | PASS | 16 KiB input bound, exact keys/metadata/encodings, fixed PBKDF2/AES-GCM, hostile variants rejected before deriveKey. |
| Nonce/signing concurrency | PASS | Exact BigInt tests, DID+room reservations, reservation before async sign, operation mutex and revision invalidation. |
| Publish destination/burn/ambiguity | PASS | Fixed exact GET tests, one-time component encoding, burn-before-fetch, zero retry, RESPONSE_RECEIVED/OUTCOME_UNKNOWN only. |
| Read-back false positives | PASS | Attempt precondition, exact five-field match, existing verifier VALID, partial/malformed/operational/duplicate cases. |
| Evidence/diagnostic semantics | PASS | Four verdicts, five statuses, 12 stages, boundary selection, operational separation all regression-tested. |
| Hostile content/confused deputy | PASS | React inert rendering, no HTML sink/content fetch/link execution; browser tests cover hostile room/export/onboarding data. |
| Server boundary | PASS | Only inspect/rooms read routes; no identity/signing/publish imports or write relay. |
| Resource limits | PASS | 5 MiB/10,000/256 KiB export; 2 MiB/10 s/200 live read; 8 KiB inspect; 4096-char tclk unchanged. |
| tclk | PASS | Observation-only detection and no settlement/payment conclusion. |
| Navigation/session | PASS | In-memory identity only; shortcuts do not bypass gates or cause network; refresh persistence absent. |
| CSP | DEFERRED | Existing headers retained. Strict CSP requires verified Next nonce/hash and release design; no speculative policy added. |
