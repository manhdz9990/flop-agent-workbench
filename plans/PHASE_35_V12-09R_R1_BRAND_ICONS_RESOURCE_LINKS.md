# Phase 35 — V12-09R R1 Brand, Icons & Resource Links

## Status

COMPLETE / PASS

## Objective

Replace temporary shell marks with the exact compact FLOP logo and recognizable internal icons, and restore the four approved static resources without changing application behavior.

## Scope

- Use `public/brand/flop-logo.png` unchanged in desktop and mobile brand positions.
- Replace letter-box destination marks with accessible internal SVG icons.
- Add FLOP Labs, Technocore Chat, Docs, and Built by Manh100 links to the lower sidebar resource area.
- Preserve expanded, collapsed, active, and mobile navigation behavior.

## Asset baseline

- `flop-logo.png`: 56,749 bytes; 400×400; SHA-256 `539E52B91891234FF9FF209846AE15C568DDDB9BC167147696EFE929C997452B`.
- `flop-hero.png`: 39,273 bytes; 1500×500; SHA-256 `1AEFD9D449E81C00E1AFDEEF0D3A8855FFF92BA54BFB880BF149EF451792E4B6`.

## Protected boundaries

No Home hierarchy, Rooms, onboarding, domain behavior, API, dependency, persistence, release, or deployment change.

## Result

The exact compact logo now appears at 36 px in the expanded/collapsed desktop brand and 30 px in the mobile header using aspect-preserving `object-fit: contain`. Internal current-color SVGs provide recognizable Home, Rooms, My Agent, Evidence, Developer Tools, Docs, FLOP Labs, Technocore Chat, and author marks. The four approved static resources are available in the lower sidebar and mobile drawer with protected new-tab navigation.

Post-implementation hashes exactly match the baseline: compact logo `539E52B91891234FF9FF209846AE15C568DDDB9BC167147696EFE929C997452B`; hero artwork `1AEFD9D449E81C00E1AFDEEF0D3A8855FFF92BA54BFB880BF149EF451792E4B6`.

Typecheck PASS; 25 files / 313 tests PASS; ESLint PASS; production build PASS; Chromium E2E 13/13 PASS; offline audit PASS with 0 vulnerabilities. Desktop expanded/collapsed and 390×844 mobile screenshots passed visual review with no horizontal overflow. No dependency, API, state-owner, domain behavior, live write, release, or deployment change occurred.
