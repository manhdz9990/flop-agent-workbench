# Test Strategy

## Principle
Protocol truth is deterministic and fixture-driven. Known-good crypto fixtures must be independent of the implementation under test.

## Layers
1. Unit: sweep, canonical payload, DID decode, signature decode/verification, room classes, sequence gaps, evidence classification, tclk detection.
2. Parser: JSON/JSONL exactness, nonce precision, malformed/oversized inputs, partial failures.
3. Security: SSRF/confused deputy, hostile text/HTML/URLs, redirects, path/input validation, secret handling invariants.
4. Integration: validated input → report model with mocked official responses/fixtures.
5. UI/E2E: four input modes, four verdict states, warnings, responsive report/detail, operational errors.

## Fixture policy
- At least one known-good signed record independently produced from official/reference-compatible tooling.
- Mutations: room, nonce, text, signature, DID.
- Legacy/missing-sig fixture for UNVERIFIABLE.
- Unsigned record fixture.
- 19-digit nonce fixture beyond 2^53.
- retained/gapped transcript fixtures.
- hostile content and malicious URL fixtures.
- official tclk examples/spec fixtures where licensing/source permits; otherwise minimal manually documented spec-derived fixtures.

## Required commands per phase
Typecheck + unit/integration tests + lint. Build from UI/foundation onward. E2E from UI phase onward.

## V12-07 adversarial layer

Hardening adds direct checks for malicious backup metadata rejected before PBKDF2, locked resource constants, absence of logging/persistence/server secret or write capability, exclusive signed-write URL construction, synchronous UI operation exclusion, and stale async-result invalidation. Browser flows double-invoke signing, publish, and read-back controls against delayed intercepted endpoints and still observe one owned write/read only. All external Technocore boundaries remain mocked/intercepted; automated tests must perform zero live writes.
