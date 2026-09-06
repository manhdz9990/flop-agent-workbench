# Monitoring

Status: ownership and launch thresholds not yet approved. This is a release-readiness blocker, not an application defect.

Minimum privacy-compatible launch signals:

- HTTPS uptime for `/`.
- HTTP error rate and latency for `/api/inspect` and `/api/rooms`.
- Function failures/timeouts and evidence-origin connectivity failures.
- Never log request bodies, export/receipt content, DIDs, room topics, message text, tokens, or other untrusted evidence.

Before deployment, assign an owner, observation location, alert thresholds, recipient, and retention period. No monitoring SDK or telemetry dependency is currently present or required; adding one requires separate authorization and privacy review.
