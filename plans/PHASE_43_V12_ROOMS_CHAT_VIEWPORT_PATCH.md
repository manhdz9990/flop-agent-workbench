# Phase 43 — V1.2 Rooms Chat Viewport Patch

## Scope

Make the selected Rooms workspace a bounded chat surface: fixed room header, independently scrollable retained conversation, and persistent existing composer. Preserve the R4A/R4B state owners and every protocol/security invariant.

## Acceptance

- Retained messages render chronologically inside a bounded viewport and initial room load opens at the newest retained message.
- Near-bottom readers follow refresh results. Readers inspecting older messages remain anchored by measured message position and receive a deduplicated unseen counter (`1`–`99`, then `99+`) that jumps to newest.
- Room discovery and retained conversation scroll independently; the ready composer is a compact growing input capped at roughly four visible lines, and the backup gate remains mandatory but compact.
- Room switching resets scroll context and keeps stale-read protection.
- The existing composer, review, signing, publish, read-back, and Evidence flows remain unchanged and reachable on desktop and mobile.
- Typecheck, unit/integration, zero-warning lint, production build, and Chromium E2E pass without live Technocore writes.

## Status

COMPLETE / PASS. Chromium includes 80%, 100%, and 125% viewport-scale equivalents plus 390×844 mobile. Deployment, commit, and push were not performed.
