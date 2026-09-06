# Phase 12 — V11-06 Functional UX Integration

Status: COMPLETE — Completion Gate PASS

## Objective

Replace the tab-first inspector with the approved task-oriented V1.1 flows while reusing the existing room reader, transcript diagnostics, verification pipeline, and local evidence receipt.

## Scope

- Start, Explore Public Rooms, Debug a Message, Analyze an Export, and Inspect a DID / Key flows.
- Canonical transcript, pipeline, and receipt presentation.
- In-memory navigation only; local export processing and receipt download only.
- Responsive, keyboard-accessible, text-labelled statuses and explicit safety boundaries.
- Focused Playwright coverage for functional flows, states, hostile content, and forbidden surfaces.

## Acceptance

- All four task flows work through their approved hierarchy.
- Existing API, protocol, diagnostic, pipeline, receipt, limits, and E2E lifecycle contracts remain unchanged.
- Typecheck, full tests, zero-warning lint, production build, and E2E pass.
- Audit is attempted once; endpoint failure remains the mandatory V11-07/pre-release blocker.
