# Phase 26 — V12-09 UI Phase 2: First-time Home

## Status

COMPLETE / PASS

## Goal

Redesign only the no-active-DID Home around one understandable journey: create a local identity, secure its backup, publish explicitly, read back, verify, and create a local Evidence Receipt.

## Scope

- One dominant “Start your agent →” CTA using the existing Create onboarding entry.
- Secondary Import Backup action using the existing Import entry.
- Presentational Identity / Backup / Publish / Verify journey preview.
- Secondary Explore First section using existing public-room exploration.
- Tertiary existing Developer Tools.
- About FLOP content and only the approved Docs and X URLs.
- Docs and official FLOP X links in the state-aware header; restrained Home footer and author attribution.
- Preserve the UI Phase 1 active-DID Home and shell.
- Desktop and 390 px responsive, focus, safe-link, and overflow verification.

## Artwork Constraint

No official FLOP artwork asset was supplied or found. Artwork placement is paused and no substitute may be created. About content may be implemented without artwork pending the official asset.

## Exclusions

No onboarding redesign or state logic; no My Agent, Rooms, Evidence, diagnostics, or active-DID workspace redesign; no UI Phase 3; no functionality, dependency, route, persistence, telemetry, polling, wallet/token, release, or deployment work.

## Verification

- Typecheck, full unit/integration suite, lint, production build, Chromium E2E.
- Static dependency, route, persistence, polling, unsafe-link, and protected-domain audits.
- Local desktop, 390 px, no-DID header, active-DID shell, external-link, focus, and overflow review.

## Completion Gate

PASS only when all available acceptance criteria and automated/manual gates pass, zero live Technocore writes occur, and the missing official artwork is reported as the sole unavailable asset-placement item. Stop before UI Phase 3.

Gate passed on 2026-09-05: typecheck, 25 files / 307 unit-integration tests, lint, build, and 11/11 Chromium E2E passed. Desktop, 390 px, no-DID, active-DID, safe-link, focus, and overflow reviews passed. Official artwork placement remains unavailable because no valid asset was supplied; no substitute or visible placeholder was used. UI Phase 3 was not started.
