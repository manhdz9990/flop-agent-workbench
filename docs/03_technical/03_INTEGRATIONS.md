# Integrations

## Technocore
Allowed live reads are limited to official read surfaces needed by Room/Message inspection, principally `/r/<room>?format=json` and `/r/<room>/export` if the product explicitly invokes export reading. Prefer JSON for live inspection. No write endpoints may be constructed or called.

## V1.2 V12-03 signed-room-write amendment

The paragraph above remains the V1.1 read-only integration contract. V12-03 may add exactly one separately authorized browser-direct write integration.

### Official provenance

- Canonical upstream: `https://github.com/flop-labs/technocore-chat`
- Documentation reviewed: repository README/API documentation on the `main` branch, 2026-09-05.
- Exact commit/release identifier: not recorded because it was not reliably observable during this reconciliation; no identifier is inferred or fabricated.

### Selected transport

- Method: `GET`
- Fixed origin: `https://technocore.chat`
- Exact path: `/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>`
- Component order: room, literal `say-signed`, DID, signature, nonce, post-sweep text.
- Query: none.
- Fragment: none.
- Request body: none.

The upstream also documents a POST signed-write variant. It is explicitly out of scope for V12-03; this project does not generalize the two lanes into a configurable transport.

Each dynamic value is taken unchanged from the V12-02 prepared descriptor and encoded once with standard URL path-component encoding. Encoding changes only its URL representation: decoding each segment at the endpoint must recover the exact room, DID, signature, nonce, and post-sweep text. Raw text must never be concatenated into path structure; reserved `/`, `?`, `#`, percent characters, and non-ASCII text must not create segments, queries, fragments, or lossy transformations.

Before execution, the final URL must have protocol `https:`, hostname `technocore.chat`, no credentials, no port, the exact approved path shape, no query, and no fragment. No arbitrary/configurable origin, destination, proxy, or application-server relay is permitted.

An observed HTTP response provides only status and response-received evidence. V12-03 does not depend on response content type or body for its state semantics; response body content is non-required and untrusted. Neither a 2xx status nor body text establishes publication or verification.

## Official documentation
Protocol-sensitive implementation must be checked against:
- https://technocore.chat/llms.txt
- https://technocore.chat/skill.md
- https://github.com/flop-labs/technocore-chat
- https://github.com/flop-labs/tclk

## V1.2 Final Live Rooms read amendment

For the explicitly selected room, the approved reader follows the current official `/humans` pump: first perform the bounded retained JSON read (`format=json&limit=200`, cursor zero/no wait), then request only newer records with `since=<exact last_seq>&wait=10`. `since` is an exact validated sequence string; it is never converted to a JavaScript number. Responses append by authoritative sequence into a bounded 200-record current view. Record responses and normally held empty responses immediately start the next poll; only a near-instant empty response uses the official two-second waiter-exhaustion guard, and operational errors retry after three seconds. Empty responses retain the cursor. Abort/revision ownership cancels room switch, hidden-tab, send restart, exit, and unmount reads. No cache-busting parameter is used because the inspected official client does not use one. All traffic still passes through the same-origin typed route and fixed-origin safe reader; no arbitrary proxy or server write relay is added.

## tclk
Use official package/spec only where its public interface and semantics are verified at implementation time. No settlement rail integration in MVP.
