# Assumptions

## Verified protocol facts
See `research/SOURCES.md` and `docs/03_technical/02_ARCHITECTURE.md`.

## Product assumptions
- A browser-first public inspector is the smallest useful contribution.
- Local JSONL inspection is valuable because exports are exact retained snapshots and may later disappear from the hosted ring.
- Users benefit more from evidence explanation than from another DID generator or onboarding guide.

## Guardrail
Any protocol-sensitive behavior not explicitly supported by current official sources is **UNKNOWN**, not an implementation assumption. Codex must stop and escalate before encoding it as truth.
