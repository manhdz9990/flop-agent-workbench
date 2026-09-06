# Phase 11 (V11-05) — Local Evidence Receipt

## Objective
Create deterministic JSON and Markdown Evidence Receipts from one canonical
typed model derived from V11-03 transcript diagnostics and the V11-04
Verification Pipeline. Provide browser-local download support only.

## In scope
- Canonical receipt schema/version and source/record references.
- Existing Evidence Verdict, 12 stages, boundaries, deterministic copy,
  separate operational observations, bounded tclk summary, and limitations.
- Deterministic JSON and Markdown serializers.
- Minimal browser-local Blob/download helper.
- Focused tests and the complete verification gate.

## Privacy and security
Never copy raw transcript/export bodies, unrelated records, tclk frame bodies,
private paths, secrets, or volatile metadata. No timestamp, random ID, server
endpoint, upload, persistence, network access, or executable rendering.

## Out of scope
UI integration/redesign, Full Repro Package, server storage/sharing,
diagnostic/protocol/parser/tclk changes, wallet/signing, release/deployment,
and V11-06+.

## Completion gate
One canonical model drives byte-stable JSON and faithful Markdown; downloads
remain browser-local; limitations and verdict/status/boundary separation are
preserved; focused and full verification pass; status is updated; stop before
V11-06.
