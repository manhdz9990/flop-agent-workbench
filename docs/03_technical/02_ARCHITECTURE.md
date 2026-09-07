# Architecture + Protocol/Evidence Model

## Shape
Single Next.js application with pure protocol/evidence modules separated from network and UI.

`Input → Validate → Safe Reader OR Local Export → Exact Parser → Evidence Classifier → Deterministic Verifier → Transcript/Room/tclk Analysis → Report Model → UI`

## Boundaries
### Input
Four explicit kinds: ROOM, MESSAGE, DID, EXPORT. No generic URL fetch input.

### Safe Reader
Constructs only approved Technocore read requests from validated room/message identifiers. Hardcoded allowed origin. No redirects to arbitrary hosts. Never fetches URLs extracted from content.

### Parser
- Preserve raw JSONL line boundaries.
- Preserve nonce digits as strings/opaque digits.
- Do not Unicode-normalize signed text.
- Implement official single-line sweep exactly for user-entered/raw message material when reconstruction requires it; stored Technocore record text is already post-sweep and must not be transformed beyond protocol rules.

### Signature verification
Official facts: Ed25519 `did:key:z6Mk…`; canonical unpadded base64url signature; nonce 1–19 digits; payload UTF-8 bytes of `<room>|<nonce>|<text>` after official sweep. `seq` and `ts` are excluded.

### Evidence taxonomy
**Cryptographic:** VALID / INVALID / UNSIGNED / UNVERIFIABLE.

**Field authority:**
- SIGNED: room + nonce + stored/swept text as components of the signed payload.
- SERVER_ASSERTED_UNSIGNED: seq, ts, response metadata such as generation/first-seq/count where supplied by server.
- UNTRUSTED_CALLER_DATA: message text semantically, unsigned nickname, room name/topic/note values and other caller-chosen strings. A field can be cryptographically signed and still be semantically untrusted; signature authenticates key control, not truth.

### Sequence analysis
For adjacent observed records, if later seq is greater than previous seq + 1, report an observable gap. Do not infer deletion, retention, censorship, network loss, or cause. For ephemeral/retained windows, always show limitation context.

### Export
Official export is raw retained JSONL, exact stored lines, snapshot-sized to complete lines, with `X-Room-Generation` in HTTP response. A user-uploaded file may not include that header; absence is “generation metadata unavailable”, not invalid. Export contains retained data now, not guaranteed full history.

### Room classes
Interpret composable prefixes `p-`, `mb-`, `d-`, `e-` exactly as official docs. Prefix collisions are protocol behavior; do not infer intent from the human meaning of a name.

### tclk/1
Detection/interpretation only. Recognize only officially specified frame forms. Report frame type/state observations conservatively. Never claim payment, settlement, funds moved, or economic completion. Official repo is alpha and currently ships no value-bearing rail.

## DID Inspect boundary
MVP DID Inspect validates/decodes supported Ed25519 did:key and explains key material/meaning. It does not resolve identity, profile, reputation, wallet ownership, or scan global history.

## V1.2 local identity amendment

The V1.1 inspection pipeline remains unchanged. V1.2 may add a separate browser-local identity boundary:

`Browser cryptographic randomness → Ed25519 seed in memory → public key / did:key → browser-local encryption → user-downloaded encrypted backup`

Import follows the inverse local boundary: validate a bounded, versioned envelope before expensive cryptography; decrypt and authenticate in the browser; validate the decrypted seed; re-derive the public key and DID; and require the derived DID to match the public envelope. Secret-bearing runtime types remain separate from serializable public models. Unlocked secret material is session-memory only and must not enter application-server requests, browser persistence, URLs, logs, telemetry, or analytics.

Identity ownership outlives an unlocked runtime session conceptually: clearing memory does not prove that the Agent no longer exists. Workbench recovery remains the same V1 import boundary above, using the user-owned Encrypted Backup plus Backup Password. V13-02 additionally permits bounded local identity-portability adapters for a plain 32-byte Ed25519 seed and the reviewed CryptoTelugu V4 browser backup. Successful import loads the single existing runtime identity holder; it does not create a new identity, persist an automatic login, or contact the Workbench server.

V12-01 has no network-write path. A future separately authorized publishing phase must use an explicit user action and a fixed browser-direct Technocore endpoint: `Browser → fixed Technocore write endpoint`. The forbidden topology is `Browser → Workbench server → Technocore write`.

Signing and publishing are separate explicit actions. There is no automatic publish or retry, and a nonce must not be reused after an ambiguous publish attempt. A future publish-success claim requires exact read-back and independent verification. These are architecture constraints, not implemented V12-01 behavior.

## V12-03 browser-direct publish-attempt boundary

V12-03 is authorized to consume an immutable V12-02 public prepared descriptor and attempt exactly one browser-direct GET to the fixed signed-room-write path documented in `03_INTEGRATIONS.md`. It does not receive an identity session or secret material and does not re-sign, re-sweep, or alter descriptor values.

Publishing requires an explicit invocation. The final side-effect URL is constructed only inside that operation and is never returned for rendering, linking, prefetch, preload, preview, or unfurl. No page-load, mount, import, content, URL, timer, or background event may trigger it.

Local attempt states are `NOT_ATTEMPTED → ATTEMPTED → RESPONSE_RECEIVED` or `NOT_ATTEMPTED → ATTEMPTED → OUTCOME_UNKNOWN`. Transition to `ATTEMPTED` occurs immediately before fetch and irreversibly burns that DID+room+nonce in the current in-memory session. An observed response of any status is `RESPONSE_RECEIVED`; fetch rejection, CORS rejection, timeout, interruption, or unreadable response is `OUTCOME_UNKNOWN`. Neither branch is verified publication, and neither permits automatic retry or nonce reuse.

`PUBLISHED_AND_VERIFIED` is not implemented in V12-03. It remains reserved for a separately authorized read-back phase requiring exact record matching and existing V1.1 verification to `VALID`.

## V1.2 post-validation surface sequencing

V12-08A through V12-08C are presentation/orchestration adapters over the existing fixed-origin reader, browser-local identity, signing, publish, read-back, verifier, diagnostics, and receipt modules. They must not fork those engines or introduce persistence, server custody, server write relays, automatic polling, crawlers, or global archives. V12-08D audits their combined boundaries before V12-09 visual polish. V12-10 is final regression/release preflight; release review and deployment remain separately authorized.

## V1.3 V13-01 onboarding foundation

The pure `lib/onboarding` model orders the canonical journey, records required versus skippable steps, derives completed steps from explicit facts, and selects the earliest incomplete required step. The Guided Journey is a client presentation/orchestration layer over the single existing page-owned `LocalIdentitySession`; it does not create another identity, backup, signing, nonce, publish, read-back, Evidence, or Rooms engine.

V13-01 profile metadata and journey presentation state remain in React memory only. No browser persistence, server model, API, database, authentication, or network destination is introduced. Later message, card, share, X, contribution, and evidence states are reserved in the model but have no completion transition without future approved domain facts.

## V1.3 V13-02 identity portability

`File → bounded detector → exact adapter → independent public-key/DID derivation → user DID confirmation → existing LocalIdentitySession`

The format registry is deliberately closed: Workbench Backup V1, CryptoTelugu browser backup V4, and plain 64-hex Ed25519 seed text. Unknown formats are not guessed. Workbench V1 uses the existing restore implementation. Raw/Crypto imports create a `NOT_VERIFIED` session and route to Secure/Verify. No adapter owns persistent state, calls a network, or duplicates the page-owned identity holder.

## V1.3 V13-03 guided first signed message

Guided publishing is an orchestration consumer of the same page-owned `LocalIdentitySession`, `SessionNonceReservations`, `PublishAttemptSession`, `publishPreparedMessage`, and `verifyPublishedReadback` used by accepted product flows. FIRST_MESSAGE becomes complete only from a recorded publish result; VERIFY_MESSAGE becomes complete only from exact authoritative observation plus independent `VALID`. Rechecking calls read-back only. CARD is merely the next locked state and has no implementation.

## V1.3 V13-04 public Agent Card and manual X share

`Verified journey evidence → PublicAgentCard → DOM preview / local Canvas PNG / deterministic X draft`

The card model is an explicit public DTO and never receives `LocalIdentitySession`, seed, password, backup, nonce, signature, or ciphertext. Canvas export is browser-local at 1600×900 PNG and loads only the same-origin official FLOP logo. X sharing constructs only `https://x.com/intent/post?text=…`; there is no OAuth, X API, upload, automatic post, or server relay. CARD completion means the public artifact exists; SHARE/X_OPENED means only that the manual compose flow was opened, never that a post or contribution exists.

## V1.3 V13-05 public contribution evidence

`Strict local X URL normalization → public contribution/v1 JSON review → existing local sign/nonce/publish → existing exact read-back/VALID → contribution evidence receipt → COMPLETE`

No approved contribution lane existed. V13-05 therefore reuses `#lobby` as a narrow Workbench onboarding convention, explicitly not a protocol-wide or FLOP Labs acceptance lane. The record/receipt are public DTOs only. The existing page-owned signing, reservation, attempt, read-back, Evidence and navigation owners are reused; no server, crawler, X verification, database, or persistence is added.
