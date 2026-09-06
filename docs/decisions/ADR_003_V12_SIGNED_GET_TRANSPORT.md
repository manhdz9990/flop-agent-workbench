# ADR 003 — V12-03 Fixed Browser-Direct Signed GET Transport

## Status

Accepted and implemented for V12-03 on 2026-09-05.

## Source

Official upstream: `https://github.com/flop-labs/technocore-chat`. The README/API documentation on `main` was reviewed on 2026-09-05. No commit or release identifier was reliably observable, so none is claimed.

## Decision

V12-03 selects only:

`GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>`

Dynamic components come unchanged from the V12-02 descriptor and are URL path-component encoded once. The request has no body, query, or fragment. The final destination is structurally revalidated immediately before execution.

The upstream POST variant is deliberately excluded. There is no generic transport, configurable host, arbitrary destination, application-server relay, proxy, or fallback.

## State and evidence

Explicit invocation transitions `NOT_ATTEMPTED → ATTEMPTED` immediately before fetch and burns the local nonce. An observed response maps to `RESPONSE_RECEIVED` regardless of status. Network, CORS, timeout, interruption, or response-observation failure maps to `OUTCOME_UNKNOWN`. V12-03 has no failure claim, automatic retry, nonce reuse, or verified-publication state.

## GET side-effect controls

The executable URL exists only inside the publish operation and is not returned or exposed to rendering, links, resource attributes, metadata, prefetch, preload, previews, or untrusted-content handling. Response body content is non-required and untrusted.
