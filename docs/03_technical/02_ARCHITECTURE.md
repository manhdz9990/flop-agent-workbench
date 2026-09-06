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

V12-01 has no network-write path. A future separately authorized publishing phase must use an explicit user action and a fixed browser-direct Technocore endpoint: `Browser → fixed Technocore write endpoint`. The forbidden topology is `Browser → Workbench server → Technocore write`.

Signing and publishing are separate explicit actions. There is no automatic publish or retry, and a nonce must not be reused after an ambiguous publish attempt. A future publish-success claim requires exact read-back and independent verification. These are architecture constraints, not implemented V12-01 behavior.

## V12-03 browser-direct publish-attempt boundary

V12-03 is authorized to consume an immutable V12-02 public prepared descriptor and attempt exactly one browser-direct GET to the fixed signed-room-write path documented in `03_INTEGRATIONS.md`. It does not receive an identity session or secret material and does not re-sign, re-sweep, or alter descriptor values.

Publishing requires an explicit invocation. The final side-effect URL is constructed only inside that operation and is never returned for rendering, linking, prefetch, preload, preview, or unfurl. No page-load, mount, import, content, URL, timer, or background event may trigger it.

Local attempt states are `NOT_ATTEMPTED → ATTEMPTED → RESPONSE_RECEIVED` or `NOT_ATTEMPTED → ATTEMPTED → OUTCOME_UNKNOWN`. Transition to `ATTEMPTED` occurs immediately before fetch and irreversibly burns that DID+room+nonce in the current in-memory session. An observed response of any status is `RESPONSE_RECEIVED`; fetch rejection, CORS rejection, timeout, interruption, or unreadable response is `OUTCOME_UNKNOWN`. Neither branch is verified publication, and neither permits automatic retry or nonce reuse.

`PUBLISHED_AND_VERIFIED` is not implemented in V12-03. It remains reserved for a separately authorized read-back phase requiring exact record matching and existing V1.1 verification to `VALID`.

## V1.2 post-validation surface sequencing

V12-08A through V12-08C are presentation/orchestration adapters over the existing fixed-origin reader, browser-local identity, signing, publish, read-back, verifier, diagnostics, and receipt modules. They must not fork those engines or introduce persistence, server custody, server write relays, automatic polling, crawlers, or global archives. V12-08D audits their combined boundaries before V12-09 visual polish. V12-10 is final regression/release preflight; release review and deployment remain separately authorized.
