# V13-05 Contribution Evidence Contract

## X reference

Only HTTPS `x.com/<username>/status/<numeric-id>` is accepted. Username is 1–15 ASCII letters/numbers/underscore, ID is 1–20 digits, total input is at most 256 characters, credentials/ports are rejected, and query/fragment/trailing slash are removed. The canonical URL is user-provided public reference only; Workbench does not fetch it or verify ownership, content, or card attachment.

## Wire record and destination

`flop-agent-contribution/v1` serializes compact JSON in fixed key order: schema, `type=agent-card`, DID, self-declared display name, canonical X URL, product, and first `lobby` record room/sequence. It excludes secrets, backups, nonce, signature, device/browser data, and hidden state. Destination `#lobby` is a FLOP Workbench onboarding convention selected because no approved contribution lane exists; it conveys no FLOP Labs recognition or acceptance.

## Evidence and completion

The shared signing/nonce/publish/read-back stack requires the exact record and independent VALID. Receipt schema `flop-contribution-evidence-receipt/v1` wraps the public contribution, authoritative contribution reference/timestamp where observed, existing protocol receipt, verdict, and limitation. JSON/Markdown copy/download remain browser-local and runtime-only. COMPLETE means setup evidence was observed, not durable history, identity, trust, reward, eligibility, payment, or contribution acceptance.
