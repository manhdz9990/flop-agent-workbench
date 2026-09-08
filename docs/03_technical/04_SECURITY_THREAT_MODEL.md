# Security Threat Model — Locked

## Trust boundaries
1. User input is untrusted.
2. Every caller-chosen Technocore string is untrusted even when signed.
3. Technocore server assertions are not message-signature evidence.
4. Local export files are untrusted files.
5. Third-party dependencies are supply-chain boundaries.

## Primary threats and controls
- **Confused deputy / SSRF:** no arbitrary URL fetch; hardcoded origin + endpoint constructors; reject alternate schemes/hosts/credentials; disable/fail closed on redirect away from allowlisted origin; never fetch URLs found in content.
- **Prompt injection:** no AI decisions; content rendered as inert data; content never becomes instructions for an agent/tool.
- **XSS:** React text rendering only; no `dangerouslySetInnerHTML`; no HTML interpretation of message/topic/note content.
- **Secret exposure:** never request/store/transmit seed, private key, password, wallet secret, token. Safety copy is visible near inputs.
- **Parser abuse:** file/input size limits, line limits, bounded processing, structured errors; no eval/dynamic code.
- **Precision attack:** nonce remains exact digit string; never JS `number` for canonical payload.
- **Evidence confusion:** operational errors cannot map to INVALID; UI separates signed/server/untrusted.
- **Retention overclaim:** retained-window warning is mandatory where applicable.

## Forbidden
Signing; writes to Technocore; POST/GET write endpoints; wallet connection; key custody; arbitrary proxy/fetch; persistent raw transcript database; AI trust scoring; auto-opening user URLs.

## V1.2 security amendment

The sections above remain the historical V1.1 read-only debugger contract. For V1.2 only, their blanket prohibition on browser-local seed, passphrase, signing-material, and key handling is superseded by the narrower boundary below. All unrelated V1.1 controls remain in force.

### Allowed browser-local identity handling

- Generate an Ed25519 seed from browser cryptographic randomness.
- Accept a backup passphrase for browser-local encryption or decryption.
- Create and download a versioned encrypted identity backup.
- Import, authenticate, and decrypt that backup locally.
- Hold decrypted identity material temporarily in browser session memory.
- In separately authorized later phases only, sign locally and publish through an explicit browser-direct fixed Technocore endpoint.

### Strictly forbidden secret handling

- Server-side private keys, seeds, passphrases, decrypted backups, signing, or write relays.
- Sending a seed, private key, passphrase, decrypted backup, or derived encryption key to the application server or Technocore.
- Secret logging, telemetry, analytics, or plaintext database storage.
- Plaintext secret storage in localStorage, sessionStorage, IndexedDB, cookies, URLs, query strings, or fragments.
- Raw seed/private-key paste input.
- Automatic/background signing, publishing, or retry.

Encrypted user-downloaded backup files are allowed. Temporary decrypted material is allowed only in browser memory for the approved local identity lifecycle; implementations minimize copies and clear mutable temporary buffers where practical, without claiming guaranteed physical zeroization in JavaScript.

### V1.2 threats and locked mitigations

- **Seed/private-key exfiltration:** secrets stay inside a narrow browser-only runtime boundary and are never transmitted or persisted. The sole rendering exception is the explicitly confirmed, masked-by-default My Agent Advanced Secret Key flow; secrets remain excluded from ordinary UI and public/serializable models.
- **Passphrase leakage:** passphrases remain browser-local, are never stored or logged, and temporary encoded buffers are cleared where practical.
- **Malicious or tampered backup:** imports are bounded and schema/version/encoding validated before expensive work; authenticated encryption fails closed; the restored DID must match the envelope DID.
- **Weak backup passphrase:** user-facing work communicates passphrase responsibility; approved key-derivation parameters are enforced by the versioned contract rather than caller-controlled downgrades.
- **XSS stealing an unlocked identity:** retain inert rendering and no `dangerouslySetInnerHTML`; minimize unlocked lifetime and secret API surface; avoid raw secrets in React state when a narrower holder is practical.
- **Accidental secret logging:** errors and diagnostics do not echo secrets; secret-bearing telemetry and analytics are forbidden.
- **Plaintext browser persistence:** unlocked material is session-memory only; storage APIs, cookies, and URLs are prohibited secret sinks.
- **Malicious content triggering signing:** untrusted content never becomes an instruction; signing requires a separate explicit user action over an exact displayed payload.
- **Confused-deputy browser GET writes:** future writes use only a fixed, purpose-specific browser-direct Technocore endpoint and explicit action; no generic destination, proxy, or server relay is allowed.
- **Nonce replay/conflict:** future publishing uses purpose-specific nonce handling and never reuses a nonce after an ambiguous attempt.
- **Ambiguous CORS/network outcome:** failure or timeout is not publish success and does not trigger automatic retry.
- **False publish-success claims:** future success requires exact read-back plus independent verification while retaining existing evidence limitations.

V12-01 implements no signing or network write. Future signing/publishing requires separate phase authorization.

## V12-03 GET-write security amendment

The official signed-room GET URL is capability-like side-effect material: merely fetching it can perform a write. V12-03 therefore locks these controls:

- Construct the URL only inside an explicit publish invocation, never during render, page load, mount, import, signing, backup verification, or content processing.
- Never expose the executable URL through an anchor, image/script/resource source, metadata, preload, prefetch, preview, or unfurl.
- Never fetch a write URL found in a room, message, topic, nickname, transcript, export, or tclk frame.
- Accept only the immutable public V12-02 descriptor. Do not accept identity sessions, seeds, private keys, passphrases, decrypted backups, or encryption keys.
- Enforce exact HTTPS origin, host, port, path shape, component order, and absence of query, fragment, credentials, arbitrary destinations, proxies, and relays.
- Encode descriptor fields once as path components; never concatenate raw text into URL structure or log the complete executable URL.
- Enter `ATTEMPTED` and burn the nonce immediately before network execution. Reject a repeated burned descriptor before fetch.
- Bound the browser request with AbortController. Timeout, fetch/CORS rejection, interruption, or unreadable response means `OUTCOME_UNKNOWN`, not definitive failure.
- Never retry automatically, prepare a replacement nonce, re-sign, or treat status/body content as verified publication.
- Treat response bodies as untrusted, non-required data and do not execute or interpret them as instructions.

The V12-03 transport is the only approved exception to the historical V1.1 no-write rule. POST transport, verified publish success, and read-back orchestration remain unauthorized.

## V12-07 hardening review

The completed V1.2 surface was re-audited for secret exfiltration, malformed backup/KDF resource abuse, exact nonce/concurrency, publish destination/burn/ambiguity, read-back false positives, evidence drift, hostile content/confused deputy behavior, logging, persistence, server relay, locked limits, tclk overclaiming, navigation bypass, and async state races.

One reproducible phase-local risk was corrected: React render state alone did not synchronously exclude duplicate async actions, and an in-flight signing completion could restore an old prepared descriptor after its reviewed input changed. The onboarding orchestration now uses one synchronous operation holder plus monotonic input revision checks. Domain nonce reservations, immutable descriptors, burn-before-fetch, and all transport/verifier semantics remain unchanged.

Existing `nosniff`, `no-referrer`, frame-deny, and restrictive Permissions Policy headers remain. A strict CSP is deferred to release architecture review: Next client framework script execution needs a deliberately tested nonce/hash/build policy, and a speculative static policy could break approved behavior or encode unresolved deployment assumptions.

## V13-01 onboarding foundation

V13-01 adds only non-secret, self-declared profile metadata held in current React memory. It adds no persistence or network transport. Display Name, X username, and description are bounded and rendered as inert text; they do not establish real-world identity, trust, reputation, rewards, or eligibility. Existing Secret Key, Backup Password, backup V1, local signing, nonce, fixed-origin publishing/read-back, and Live Rooms controls remain unchanged.

## V13-02 untrusted identity files

- Identity files are capped at 32 KiB before JSON parsing or KDF work. Workbench V1 retains its stricter existing 16 KiB parser limit.
- JSON adapters require exact own-key schemas; algorithms, versions, encodings, decoded lengths, and KDF parameters are allowlisted. Encoded fields are canonical unpadded base64url and individually capped at 512 characters.
- CryptoTelugu V4 is accepted only with `Ed25519`, `PBKDF2-SHA256`, exactly 250,000 iterations, a 16-byte salt, 12-byte IV, 64-byte authenticated ciphertext, and the reviewed 48-byte Ed25519 PKCS#8 plaintext form. Passwords are 1–1024 UTF-8 bytes.
- Plain seed input is file-only: after stripping surrounding ASCII whitespace it must be exactly 64 hexadecimal characters/32 bytes. Structured additions and non-ASCII padding are rejected.
- Decrypted/imported seeds independently derive the public key and DID. Any asserted metadata mismatch rejects and locks the candidate. A candidate is not installed until explicit DID confirmation.
- Files drive no fetch, URL, code execution, persistence, logging, diagnostics, Evidence, or server operation. Errors contain categories only, never secret or password input.
- Residual risk: a deliberate plain-text download exists on the user's filesystem and browser/JavaScript memory cannot guarantee physical zeroization. High-friction copy explains public sharing, untrusted upload, GitHub, and screenshot risks; encrypted backup remains recommended.

## V13-04 public artifact and X intent

The Agent Card boundary accepts only bounded public values: self-declared Display Name, validated public DID, fixed lobby room, 1–64 digit authoritative sequence, Ed25519, and signature-verified status. User text is rendered through React text nodes or Canvas text APIs, never HTML. The PNG renderer receives no identity session/private fields and performs no upload. X drafts are deterministic, bounded to 280 characters for maximum supported inputs, editable, claim-limited, and encoded solely as a standard X compose intent. Opening it neither authenticates nor proves posting. No OAuth, X API, automatic posting, secret persistence, or new network recipient for secrets exists.

## V13-05 X reference and contribution evidence

X input is capped at 256 characters, parsed locally, HTTPS-only, exact-host `x.com`, credential/port-free, exact bounded username plus numeric status ID, with query/fragment stripped during canonicalization. It is never fetched or labeled verified. The contribution wire record is deterministic bounded JSON containing only schema/type, DID, self-declared name, canonical X reference, product, and first public record reference. Exact reconciliation and VALID are required for receipt/completion. Secrets, first-message nonce/signature, device data, OAuth, scraping, arbitrary proxying, persistence, and automatic retry remain excluded.
# V1.5 amendment — persisted contribution evidence

My Contributions stores only bounded public records derived from exact authoritative contribution evidence already verified `VALID`. Stored projections are revalidated against their retained evidence on load; malformed or forged projections are discarded without altering the encrypted backup. X URLs and Technocore content remain untrusted inert text/links and are not automatically fetched, scraped, executed, or used as proof of ownership. Locking preserves public history but prevents new signing. No plaintext secret, password, decrypted backup, nonce reservation, pending attempt, backend custody, server write, database, cloud sync, or X automation is introduced.
