# Phase 34 — V12-09R Workbench UX Simplification & Single-Shell Correction

## Status

COMPLETE / PRODUCT DESIGN PASS

## Objective

Replace the split landing/application presentation with one full-viewport FLOP Workbench shell, while preserving every existing identity, publishing, evidence, diagnostic, and Rooms behavior.

## Scope

- Persistent, collapsible desktop sidebar and responsive mobile drawer.
- The same compact, real-state Home dashboard before and after identity creation.
- Onboarding and every workspace rendered inside the stable shell.
- Preserve one onboarding instance while navigating away so setup resumes without a second state owner.
- Reduce presentation density and explanatory duplication only.

## Protected boundaries

No protocol, cryptography, identity lifecycle, backup, nonce, publish, read-back, Evidence verdict, diagnostics, Rooms, API, persistence, dependency, telemetry, release, or deployment changes.

## Completion gate

Required focused and full automated gates pass, desktop/mobile screenshots are reviewed, state ownership and protected-domain scans pass, records are reconciled, and work stops before rerunning V12-10.

## Result

The Workbench now uses one full-viewport shell before, during, and after agent setup. Desktop navigation is persistent and collapsible; mobile navigation is a close-on-selection drawer. Home keeps one six-card structure driven only by existing identity readiness and runtime Evidence. The single onboarding instance remains mounted while temporarily hidden, so Home navigation preserves its progress; changing to a different explicit onboarding entry replaces that presentation instance without adding a concurrent owner.

Typecheck PASS; 25 test files / 312 tests PASS; ESLint PASS with zero warnings; production build PASS; 13/13 Chromium E2E PASS; offline dependency audit PASS with 0 vulnerabilities. Desktop and 390 px screenshots PASS with no page-level horizontal overflow. Official artwork hash remained `1AEFD9D449E81C00E1AFDEEF0D3A8855FFF92BA54BFB880BF149EF451792E4B6`.

No dependency, API, persistence, polling, telemetry, protocol, cryptography, Evidence semantic, or release/deployment change was made. V12-10 was not rerun as a phase and now requires regression reconfirmation after manual product-owner approval.
