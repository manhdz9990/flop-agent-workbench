# TASK_020 — Phase 19 (V12-06) — Workbench Integration

## Status

COMPLETE — Completion Gate PASS.

Verified on 2026-09-05: typecheck PASS; 20 files / 279 unit tests PASS; lint PASS with zero warnings; production build PASS; Playwright 10/10 PASS with normal summary `10 passed (4.9s)` and exit code 0; port 3100 clear afterward; high-threshold npm audit PASS with 0 vulnerabilities. External requests were mocked/intercepted and automated tests performed zero live Technocore writes.

## Objective

Make onboarding and inspection understandable as two first-class Workbench workflows without duplicating V12-05 or any protocol/evidence engine.

## Acceptance criteria

- Home visibly separates Get Started from Inspect & Debug and exposes all seven required entries.
- Create, Import, and First Publish entries host the same onboarding component and cannot bypass its domain gates.
- An unlocked in-memory identity may expose only its public DID context and is never described as account, login, wallet, or persistent profile.
- Active DID opens the existing DID input; verified room/sequence opens the existing Message Debug input without automatic network activity.
- All existing debugger, diagnostics, Evidence Receipt, tclk observation, fixed-origin/bounded-reader, and hostile-content behavior remains accessible and unchanged.
- No persistence, server write route/relay, auto-publish/retry/polling, content fetch, new dependency, broad redesign, V12-07, production write, release, or deployment is introduced.
- Full Completion Gate passes with zero automated live Technocore writes.

## Recovery

Revert the Home-level identity composition, entry/context props, integration styles/tests, and V12-06 documentation. The standalone V12-05 orchestration and all V12-01 through V12-04 domain modules remain unchanged.
