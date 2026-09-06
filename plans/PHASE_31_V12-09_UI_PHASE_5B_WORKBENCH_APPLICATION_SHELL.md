# Phase 31 — V12-09 UI Phase 5B: FLOP Workbench Application Shell + Large Product Showcase

## Status

COMPLETE / PASS

## Goal

Turn the active-identity experience into a responsive Workbench application shell and enlarge the no-DID product showcase, while preserving the single existing state/domain implementation.

## Scope

- Preserve the exact `/brand/flop-hero.png` landing anchor and increase the presentational Workbench preview to approximately the main content width.
- Keep the no-DID rhythm: brand → explanation → one dominant action → atmosphere → product.
- Present active-identity destinations in a desktop sidebar and a keyboard-accessible mobile disclosure menu.
- Reuse Home, Rooms, My Agent, Evidence, and Developer Tools without duplicating their logic or state.
- Keep a compact, inspectable active public DID context in the application header.

## Exclusions

No Evidence redesign, UI Phase 6, V12-10, new domain state, API route, dependency, persistence, polling, telemetry, analytics, server signing/write relay, release, or deployment.

## Verification

Typecheck, full Vitest suite, zero-warning ESLint, production build, Chromium E2E, dependency audit, protected-boundary scans, and desktop/390 px visual and interaction review.

## Result

The no-DID landing retains the exact official artwork and approved brand/action/atmosphere/product rhythm. Its presentational product surface now spans 94% of the landing content area up to 1320 px and contains only real FLOP labels and capabilities, with no fabricated runtime data.

An active identity now switches the same application into a desktop header/sidebar/workspace shell. Home, Rooms, My Agent, unchanged Evidence, and Developer Tools render through the existing `screen` owner and handlers. Developer Tools is a destination rather than a duplicated Home section. At 390 px the sidebar becomes an ARIA-controlled menu; choosing any destination closes it. The compact active public DID remains inspectable in the desktop header, while the full DID remains in My Agent.

## Verification Result

- TypeScript: PASS.
- Vitest: PASS — 25 files / 312 tests.
- ESLint: PASS — zero warnings.
- Production build: PASS on Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, and framework `/_not-found`.
- Playwright: PASS — 11/11 Chromium tests in 9.1s; external write boundaries remained intercepted.
- Offline npm audit: PASS — zero vulnerabilities.
- State/domain scan: PASS — one screen owner, one LocalIdentitySession owner, one SessionNonceReservations/PublishAttemptSession lifecycle, and no Evidence/onboarding duplication.
- Protected-boundary scan: PASS — no dependency, API, persistence, polling, WebSocket, telemetry, analytics, unsafe HTML, protocol, crypto, publishing, read-back, Evidence-verdict, or resource-limit change.
- Visual review: PASS for no-DID desktop/mobile landing, exact artwork, hero/CTA/glow, large product proof, active Home, Rooms, My Agent, unchanged Evidence, Developer Tools, desktop sidebar, compact identity, mobile open/closed menu, focus, and overflow. Desktop and 390 px layouts read as FLOP Agent Workbench, not a CRM template or documentation page. Evidence is stored in `artifacts/ui-phase5b-review/`.

UI Phase 6, V12-10, release, and deployment were not started.
