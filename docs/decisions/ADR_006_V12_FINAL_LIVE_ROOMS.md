# ADR 006 — Final Live Rooms interaction and transport

## Decision

The Product Owner's Final Live Rooms amendment supersedes only the older Rooms-specific manual-refresh and Review → Sign → Publish → Check normal interaction. AGENTS.md and all security/cryptographic evidence boundaries remain authoritative.

The selected room uses one abortable cursor pump aligned to the current official `/humans` source: the initial bounded retained JSON read uses `since=0` without a wait and establishes `last_seq`; subsequent reads use `since=<last_seq>&wait=10`. A response containing records and a normally held empty response re-poll immediately. Only a near-instant empty response waits two seconds, matching the official waiter-exhaustion hot-loop guard; operational failure waits three seconds. No cache-busting query is added because the inspected official source does not use one. Empty responses retain the cursor. Room switch, workspace exit, hidden visibility, send restart, and unmount cancel/invalidate the active request. The UI retains at most 200 current records and deduplicates authoritative server sequence identity.

Ready-agent Enter submission reuses the existing page-runtime identity, nonce reservation, publish-attempt, fixed-origin browser-direct publisher, and verifier. The official browser uses same-origin JSON POST, while the Workbench retains the already-approved signed GET lane because a cross-origin browser cannot depend on reading a POST response and the official service explicitly supports the GET signed route. Both paths use the same post-sweep `room|nonce|text` signature contract and stored fields. A transport response is not verification. No automatic retry occurs. An optimistic row is removed only after exact room/DID/nonce/post-sweep stored text/signature evidence is observed and independently VALID.

No persistence, new route, server signing/write relay, WebSocket/SSE, crawler/archive, dependency, or Evidence semantic change is introduced.
