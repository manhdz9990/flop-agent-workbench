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

- **Seed/private-key exfiltration:** secrets stay inside a narrow browser-only runtime boundary, are never rendered or transmitted, and are excluded from public/serializable models.
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
