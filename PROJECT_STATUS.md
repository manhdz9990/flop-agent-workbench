# PROJECT_STATUS

## Project
FLOP Agent Workbench V1.2; includes the completed Technocore Protocol Debugger V1.1.

## Lifecycle stage
V1.2 IDENTITY UX UPDATE RELEASED. The Identity Ownership, Backup/Recovery, Restore Agent, and consolidated Agent lifecycle UX update is COMPLETE / PRODUCT OWNER PASS / RELEASED / PRODUCTION READ-ONLY VERIFICATION PASS.

## Coding agent
VS Code + Codex.

## Current phase
V1.2 IDENTITY OWNERSHIP, BEGINNER UX & EXISTING AGENT RESTORE UPDATE: COMPLETE / PRODUCT OWNER PASS / RELEASED. Release commit `89e08d5c0163d1362d110ad1085a599bb55cd89e` is on `origin/main` and was deployed through the existing `manh100k/flop-agent-workbench` Vercel project. Canonical production URL: `https://flop-agent-workbench.vercel.app`.

### Identity UX production release — 2026-09-07

**Status: RELEASED / PRODUCTION READ-ONLY VERIFICATION PASS.** The complete working-tree diff from production baseline `eee4c015ee758301381841ef9636f595a0a835fb` was audited as the bounded approved Identity Ownership, Backup/Recovery, Restore Agent, same-DID recovery, Create-primary/Restore-secondary, responsive/accessibility, test, and documentation update. Ed25519 generation, DID derivation, canonical payload, nonce and publish semantics, read-back reconciliation, Live Rooms engine, Evidence semantics, backend architecture, API routes, Technocore endpoint architecture, backup V1 schema, dependencies, and Vercel configuration remain unchanged.

Final release gates: typecheck PASS; 27/27 unit/integration files and 334/334 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 21/21 PASS; offline npm audit PASS with 0 vulnerabilities. Repository secret/artifact scan found no credential, private key, seed, mnemonic, Backup Password, Agent backup, or other secret-bearing tracked artifact. Secret Key remains masked by default and available only through deliberate owner-confirmed reveal; raw secret and Backup Password remain outside server, Technocore, URL, log, SSR, storage, cookie, diagnostic, receipt, and Evidence boundaries. Lock removes the active in-memory capability; restore remains local and backup V1 compatibility remains covered.

Vercel production deployment `dpl_5DY7dQjJaK46KGyHDCu7ovnMHyQx` is READY. Its build log proves GitHub repository `manhdz9990/flop-agent-workbench`, branch `main`, commit `89e08d5`, and a successful Next.js 16.3.4 production build. Existing aliases were preserved, including canonical `https://flop-agent-workbench.vercel.app`.

Read-only Chromium production verification PASS at 1440×900 and 390×844: unloaded Home exposes Create New Agent as the sole filled identity-entry primary and Restore Agent as secondary; My Agent and Restore entry render; an ephemeral browser-local test identity keeps Secret Key masked and Copy unavailable before reveal; Public Rooms discovery and retained-room reads succeed; two serialized room-read responses were observed per viewport; page-level horizontal overflow, unexpected network destinations, console/page errors, and detected write requests were all zero. The official FLOP favicon asset returned HTTP 200. No private Product Owner backup was uploaded, no production Secret Key was revealed or copied, and automated live Technocore writes were not performed.

### Existing Agent Restore UX follow-up — 2026-09-07

**Status: COMPLETE / PRODUCT OWNER PASS / RELEASE AUTHORIZED.** The unloaded Home, header, and My Agent states distinguish user ownership from the unlocked runtime session. They say **Agent not loaded**. Per the approved visual refinement, **Create New Agent** is the sole filled primary identity-entry CTA, while **Already have an Agent? Restore Agent** is a subordinate text action. The Create flow retains the explicit new-DID warning and Restore-instead route. Refresh, tab close, restart, and Lock may still clear the runtime identity without implying that the user-owned Agent ceased to exist.

Restore Agent reuses the single existing `technocore-agent-backup/v1` import boundary: bounded parse, authenticated local decryption, exact 32-byte seed validation, public-key/DID re-derivation, envelope DID match, and the existing verified runtime holder. Success says **AGENT RESTORED**, displays the recovered Public DID, confirms local decryption/DID match/Ready to Sign, and offers **Open Technocore Rooms**. It does not create a new recovery engine, server account, persistent login, or secret store.

Controlled Chromium verification created and downloaded a V1 encrypted backup, verified it, locked the Agent, observed the unloaded restore path, imported that same backup with the correct Backup Password, and confirmed the exact original DID and Ready-to-Sign state. Backup Password was absent from captured requests; raw secret persistence remained absent from localStorage, sessionStorage, and cookies. Existing wrong-password, malformed-envelope, DID-mismatch, backup, signing, nonce, publishing, read-back, Evidence, and Rooms regression coverage remained green. Automated live Technocore writes: NO.

**Full local gate:** typecheck PASS; 27/27 unit/integration files and 334/334 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 21/21 PASS; offline npm audit PASS with 0 vulnerabilities. Backend, backup V1 schema/cryptography, dependencies, signing, nonce, and Live Rooms are unchanged. Production is untouched.

**Create-primary visual refinement:** COMPLETE / LOCAL PASS. Unloaded Home and My Agent expose exactly one filled primary identity-entry CTA, **Create New Agent**. **Already have an Agent? Restore Agent** is a subordinate, keyboard-accessible text action immediately below. The Public Rooms action is non-primary while unloaded, the Create flow retains its new-DID/restore-instead safeguard, and active identity states remove the entry hierarchy. Post-refinement gates remain: 27/27 files and 334/334 unit/integration tests PASS; Chromium 21/21 PASS; typecheck, ESLint, production build, and offline audit PASS. Restore/security behavior is unchanged; no live Technocore write, commit, push, or deployment occurred.

**Final Agent UX consolidation:** COMPLETE / PRODUCT OWNER PASS / RELEASE AUTHORIZED. Unloaded Home removes Agent-dependent blocked status cards and retains only Create/Restore, Public Rooms, and Developer Tools. The unloaded header is minimal; active header uses only a short Public DID with accessible navigation to My Agent. Active Home transitions to useful Identity/Backup/First Record/Evidence status, and Ready to Sign leads directly to Open Technocore Rooms. Create warning is pre-creation only; Restore, backup education, Advanced Secret Key, Lock, refresh, and safe retry paths remain intact. Rooms uses consistent Create or Restore terminology. No protocol, security, persistence, backend, or Rooms engine behavior changed.

Journey verification PASS: new user Create → backup/download → Verify My Backup → Ready to Sign → Rooms; returning user Restore → same DID → Rooms; Lock and refresh return to non-deletion unloaded UX with Restore available; Advanced Secret remains masked/confirmed/copy-after-reveal/hide; wrong-password restore remains retryable. Desktop 1440px, constrained 900px, and mobile 390px hierarchy/overflow assertions PASS. Active short DID format and **Open My Agent** navigation PASS. Full final gate: typecheck PASS; 27/27 unit/integration files and 334/334 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 21/21 PASS; offline npm audit PASS with 0 vulnerabilities. Automated live Technocore writes: NO. Commit/push/deployment: NO/NO/NO.

### Identity Ownership & Beginner UX update — 2026-09-07

**Status: COMPLETE / PRODUCT OWNER PASS / RELEASE AUTHORIZED.** My Agent now separates Public DID, recommended Encrypted Backup, signing, Advanced Secret Key, proof limitations, portability, ready state, and session lock. The existing browser-held 32-byte Ed25519 seed is exposed only by a narrow owner-confirmed capability as exactly 64 lowercase hexadecimal characters. It is masked by default; Cancel does not reveal; Copy appears only after reveal; Hide, navigation/remount, and Lock remove it from rendered UI; Lock retains the existing best-effort buffer clearing.

The Product Owner security-interface amendment is recorded in ADR 001 and Acceptance Criteria 60, 73, and 79. Ordinary rendering, server/SSR output, API/Technocore requests, URLs, storage, cookies, logs, diagnostics, receipts, and public serializable models remain secret-free. Encrypted Backup remains the recommended recovery path. The unchanged `technocore-agent-backup/v1` envelope is now pretty-printed; existing minified V1 and new pretty V1 data use the same importer and cryptography. Pre-download confirmation and post-download recovery education explain Encrypted Secret and its `ciphertext` field accurately.

No Live Rooms, backend/API route, Ed25519 generation/derivation, DID encoding, signing payload, signature representation, nonce lifecycle, publish/read-back, Evidence, dependency, persistence, or Vercel behavior changed. Automated live Technocore writes: NO.

**Local verification:** typecheck PASS; 27/27 unit/integration files and 333/333 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 21/21 PASS, including deliberate reveal/cancel/copy/hide/remount, mobile 390px overflow, browser-storage, and request-boundary checks; offline npm audit PASS with 0 vulnerabilities. Static production HTML contains no deterministic raw-secret fixture. Responsive and keyboard-native button/details/dialog interaction checks PASS. Remaining limitation: JavaScript strings cannot be physically zeroized, so the implementation avoids storing the revealed hex in React state and documents best-effort memory handling.

### V1.2 Final Release authorization and clean gate — 2026-09-07

**Status: RELEASED / PRODUCTION READ-ONLY VERIFICATION PASS. Final Product Owner acceptance: PASS.** Final Live Rooms, responsive/UI hardening, Product Owner real signed-send validation, and independent observation through the official Technocore human interface are accepted. The release remains V1.2. GitHub `main` includes release commit `3365a79d60b4c631ae10ce78f561b0d9c8563340`, release-status bookkeeping, and official favicon commit `7ed8b2a983bc2a24d42501e471187e5a3bae3eab`.

The complete diff since GitHub commit `c15023336a594160e54ae82264fab88e20d0c773` was audited. Every source, test, specification, ADR, plan, task, and status change belongs to the approved final Rooms viewport, official Technocore-aligned live-read/send reconciliation, runtime timer correction, or responsive/UI hardening work. Dependency manifests are unchanged. Ignored build, test, cache, and log artifacts are excluded. No credential, token, private key, seed, mnemonic, passphrase, Agent backup, environment file, unexpected persistence, telemetry, server signer, write relay, arbitrary proxy, or unrelated source change was found.

Architecture integrity remains PASS: identity and signing stay browser-local; canonical signed bytes and fixed-origin browser-direct write transport are unchanged; nonce reservation/burn and no-same-nonce-retry remain enforced; cursor reads use validated exact `since` with bounded `wait=10`; room switch/visibility/unmount cancellation prevents stale acceptance; authoritative reconciliation still requires exact signed fields plus independent VALID verification; Evidence remains explicit and runtime-only; retained data remains bounded; hostile content remains inert.

**Final clean automated gate:** typecheck PASS; 27/27 unit/integration files and 332/332 tests PASS; ESLint PASS with zero warnings; production build PASS with routes `/`, `/api/inspect`, `/api/rooms`, and framework `/_not-found`; Chromium E2E 20/20 PASS with controlled/intercepted write transport; offline npm audit PASS with 0 vulnerabilities. Automated live Technocore writes: NO.

Authenticated Vercel account `manhdz9990` and team `manh100k` were confirmed. Existing project `manh100k/flop-agent-workbench` (`prj_uhCEfKX4LYDgyVBwtb98B1w04Bvn`) was confirmed without relinking or creating a project. Its build log proves the existing GitHub integration cloned `github.com/manhdz9990/flop-agent-workbench`, branch `main`, commit `141d328`, and the production deployment `dpl_ggNyQNWhoJtPz4kLq9jTQsebdo3D` is READY. Existing aliases remain `flop-agent-workbench.vercel.app`, `flop-agent-workbench-manh100k.vercel.app`, and `flop-agent-workbench-git-main-manh100k.vercel.app`.

Canonical-domain assignment: FAIL / STOP. Vercel returned `The chosen alias "flop-agent.vercel.app" is already in use`; inspecting that alias under `manh100k` also confirmed it is not a deployment in this team. No alias was added, removed, or replaced. Per Product Owner instruction, no alternative name was selected and read-only production smoke testing did not continue after this stop condition. Production verification: NOT PERFORMED. Automated live Technocore writes: NO. Production signed-write verification: NOT PERFORMED. Rollback target remains GitHub commit `c15023336a594160e54ae82264fab88e20d0c773`; there is no database, migration, or persisted server data requiring backup.

### Official FLOP favicon and completed production release — 2026-09-07

**Status: COMPLETE / PASS.** App Router metadata now references the unchanged official `public/brand/flop-logo.png` directly as `/brand/flop-logo.png`. The source remains a square 400×400 PNG with no redraw, crop, recolor, geometry change, generated derivative, or dependency. Local production Chromium decoded the linked icon at 400×400, loaded Home and Rooms, and reported no console/runtime errors.

Full post-change gate: typecheck PASS; 27/27 unit/integration files and 332/332 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 20/20 PASS. Final diff contained only the single favicon metadata declaration before the application commit; secret/artifact audit PASS.

GitHub application commit `7ed8b2a983bc2a24d42501e471187e5a3bae3eab` was pushed to `origin/main`. The existing Vercel project `manh100k/flop-agent-workbench` produced production deployment `dpl_DRFGKVE8wuRGdHrKHBSz4LTVmLAo`; its build log proves branch `main`, commit `7ed8b2a`, successful Next.js build, and READY status. Existing aliases were preserved. Production URL: `https://flop-agent-workbench.vercel.app`.

Read-only production Chromium smoke PASS: the favicon link resolved to the official asset and decoded 400×400; Home loaded; bounded discovery returned 50 Public Rooms; a public room opened with 200 retained records; nine serialized room reads were observed and reads continued during the observation window; My Agent, Observed Evidence, Developer Tools, mobile navigation, and Rooms loaded; mobile page overflow was zero; console/page errors and detected publish/write requests were zero. Automated live Technocore writes: NO.

Production read path: VERIFIED. Product Owner real signed-write behavior was already manually accepted against Technocore; no production write was automated in this release. Remaining non-blocking risks: `flop-agent.vercel.app` remains unavailable; Firefox/WebKit are not fully validated; production signed-write/CORS behavior may be optionally reconfirmed manually by the Product Owner. Rollback remains available through prior Vercel deployment history and the previous Git commit; no database or persisted server data exists.

## Last verified state
- Product direction reviewed and approved: Protocol Inspector, evolved from Trust Lens.
- MVP NOW and OUT scope locked.
- UX/UI, evidence model, architecture, security model, acceptance criteria, tests, implementation phases, and Build Handoff locked.
- Official Technocore protocol facts rechecked on 2026-09-03 against `technocore.chat/llms.txt`, official `technocore-chat`, and official `flop-labs/tclk`.
- Phase 1 foundation uses Next.js 16.3.4, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4.3.3, and Vitest 5.0.0.
- Locked input, verification-state, evidence-authority, operational-error, warning, message-evidence, and trust-report contracts compile.
- Independent protocol/security fixture directories and provenance requirements exist.
- `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` passed on 2026-09-03.
- Production start was verified on `127.0.0.1:3000`; `/` returned HTTP 200 with the expected product title, then the server was stopped.
- At the Phase 1 gate, scope/security scan confirmed no Phase 2 or later behavior had yet been implemented.
- Product owner approved Phase 1 and explicitly authorized only Phase 2 on 2026-09-03.
- Official single-line sweep, exact UTF-8 signed payload, exact nonce-string validation,
  canonical Ed25519 `did:key` decoding, canonical signature decoding, Noble verification,
  four evidence verdicts, and composable room classes are implemented as offline pure modules.
- Public known-good fixture was independently obtained from the official Technocore deployment;
  its 19-digit nonce exceeds 2^53 and verifies VALID without numeric conversion.
- Fixture provenance pins official `flop-labs/technocore-chat` source commit
  `82d942936050f1ab0fb9f34db17893b89f3e064b` and records the independent PyNaCl/
  Python-cryptography verification/signing implementations.
- Phase 2 verification on 2026-09-03: typecheck PASS; 2 test files / 36 tests PASS; lint PASS
  with zero warnings; production build PASS; npm audit PASS with 0 vulnerabilities.
- Explicit scope scan found no network reader/fetch, UI, JSONL, transcript/gap, tclk, signing,
  key custody, wallet, database, auth, or Phase 3+ implementation in the Phase 2 modules/tests.
- Explicit precision/normalization scan found no `Number`, numeric parsing, or Unicode
  `normalize` call in the Phase 2 modules/tests.
- Product owner approved Phase 2 and explicitly authorized only Phase 3 on 2026-09-04.
- Bounded local JSONL parsing, raw-line preservation, line-level operational errors, sequence-gap
  observations, retained-window/generation metadata warnings, and export report derivation are implemented.
- Numeric nonces are rejected at the export boundary; the independently verified 19-digit nonce remains
  exact text and verifies VALID through the Phase 3 report path.
- Phase 3 verification on 2026-09-04: typecheck PASS; 3 test files / 47 tests PASS; lint PASS
  with zero warnings; production build PASS.
- Phase 3 scope/security scan found no network reader/fetch, arbitrary proxy, content-derived fetch,
  HTML execution, normalization, numeric nonce conversion, write, tclk, UI, wallet, auth, or database behavior.
- Targeted Phase 3 repair authorized on 2026-09-04: an entirely empty official export body now
  parses as zero retained records without an `EXPORT_EMPTY_LINE` error; internal blank-line behavior is unchanged.
- The targeted Phase 3 empty-export repair is covered through both parsing and inspection; it creates
  zero records, zero operational parse errors, and zero fabricated evidence verdicts.
- Official Technocore read semantics were rechecked on 2026-09-04 against the official OpenAPI v0.11.4:
  room reads use `GET /r/{room}?format=json&limit=200`; no precise single-message read endpoint exists.
- Phase 4 implements strict ROOM/MESSAGE/DID input resolution, a fixed-origin room-read constructor,
  manual redirect rejection, bounded streaming response reads, operational network/HTTP/parser errors,
  exact numeric nonce-token preservation, local DID decoding, and unsigned server-metadata classification.
- MESSAGE resolution deterministically searches the approved bounded room window; an absent sequence is
  reported as not observed without claiming that it was evicted or otherwise assigning a cause.
- Phase 4 verification on 2026-09-04: typecheck PASS; 4 test files / 79 tests PASS; lint PASS with zero
  warnings; production build PASS; npm audit PASS with 0 vulnerabilities.
- Phase 4 security/scope scans found no arbitrary URL input/proxy, content-derived fetch, redirect following,
  Technocore write endpoint, raw HTML execution, tclk, UI, persistence, auth, wallet, signing, or key custody.
- Product owner approved Phase 4 and explicitly authorized only Phase 5 on 2026-09-04.
- Official tclk/1 behavior was pinned on 2026-09-04 to FLOP Labs `tclk` commit
  `d48e87343200e3115e243df39e8f295f5ce2e645`, package version 0.1.0 (Alpha), using
  `SPEC.md`, `src/frames.ts`, and `tests/vectors.test.ts`.
- Phase 5 implements bounded, fail-closed `tclk1 ` frame recognition and optional untrusted report
  annotations. It preserves the enclosing Technocore verdict and authenticates transport binding only
  when the record is VALID and its `from` matches the frame's `from`.
- No official tclk package dependency was added because its public entry point also exposes rails,
  state execution, secret generation, and unaudited adaptor cryptography outside this inspector's scope.
- Phase 5 verification on 2026-09-04: typecheck PASS; 5 test files / 102 tests PASS; lint PASS with
  zero warnings; production build PASS; npm audit PASS with 0 vulnerabilities.
- Phase 5 scope/security scans found no network access, rail/state-machine execution, signing, secret
  generation, wallet, transaction, persistence, UI, or Phase 6+ behavior. Forbidden positive settlement
  and value-transfer claims are absent; the required negative limitation warning is present.
- Targeted Phase 5 source re-review on 2026-09-04 conclusively classified `heartbeat` as a normative
  tclk/1 frame at pinned commit `d48e87343200e3115e243df39e8f295f5ce2e645`: it is defined in
  `SPEC.md` §3.6 and the generated field table, included and validated in `src/frames.ts`, exported
  through `src/index.ts`, and exercised by `tests/live-wire-conformance.test.ts`. Provenance and an
  exact official-derived recognition test were added; detector behavior did not require correction.
- Phase 5 targeted re-review verification on 2026-09-04: offer-ID pinned golden vector PASS;
  typecheck PASS; 5 test files / 103 tests PASS; lint PASS with zero warnings; production build PASS;
  npm audit PASS with 0 vulnerabilities; forbidden-language/scope scan PASS.

### Phase 6 verified state

- Product owner approved Phase 5 and explicitly authorized only Phase 6 on 2026-09-04.
- The Dark Infrastructure Grid UI implements exactly Room, Message, DID, and Export inspection, followed by the approved Trust Report and Message Detail hierarchy.
- DID decoding and bounded export parsing execute locally; the export file is held only for the browser interaction and is not persisted. Room/Message UI input crosses a typed same-origin route that delegates exclusively to the fixed-origin Phase 4 safe reader.
- All four evidence verdicts and all three EvidenceAuthority classes are explicitly labeled and explained. Operational/parser errors remain separate, VALID includes its key-control limitation, and UNVERIFIABLE is explicitly distinguished from INVALID.
- Empty room/export results are successful zero-record reports with no fabricated verdict. Retention and sequence-gap wording preserve the locked epistemic limitations.
- tclk/1 annotations expose only deterministic Phase 5 output and carry the coordination-only / no-settlement-or-value-transfer warning.
- Hostile HTML, script strings, prompt-injection text, and URLs render as inert text. Playwright verified that a content URL causes no request and script-shaped content does not execute.
- Phase 6 verification on 2026-09-04: typecheck PASS; 5 test files / 103 tests PASS; lint PASS with zero warnings; production build PASS; Playwright PASS (6 Chromium tests); npm audit PASS with 0 vulnerabilities.
- Security and forbidden-scope/language scans found no raw HTML rendering, arbitrary URL proxy, content-derived fetch, write endpoint, persistence, auth, wallet/signing/key custody, score, AI judgment, tclk execution, settlement verification, or Phase 7 behavior.

### Phase 7 verified state

- Product owner approved Phase 6 and explicitly authorized only Phase 7 on 2026-09-04.
- All 24 locked acceptance criteria and the complete critical test matrix were re-audited against implementation, tests, and manual-browser evidence; all PASS.
- Hardening repaired two bounded defects: the same-origin inspection route now enforces its 8 KiB request limit while streaming instead of after whole-body buffering, and DID inspection no longer uses the room/export “Valid empty result” label.
- Final verification on 2026-09-04: typecheck PASS; 6 test files / 106 tests PASS; lint PASS with zero warnings; production build PASS; Playwright PASS (6 Chromium tests); npm audit at high threshold PASS with 0 vulnerabilities.
- Manual Chromium review covered desktop Home, Trust Report, Message Detail, DID, Export, empty, operational-error, tclk, and mobile detail states. No clipping or page overflow was observed; the 390 px mobile client and scroll widths matched; console/page errors were empty on the hydrated rerun.
- Source and data-flow review confirmed fixed-origin GET-only safe reading, manual redirect rejection, bounded timeouts/responses/requests/exports, local-only export processing, inert untrusted content, no content-derived fetch, exact nonce/Unicode behavior, and observational-only tclk annotations.
- Direct dependencies remain limited to Next/React, Noble Ed25519, and Scure Base; development dependencies support TypeScript, Tailwind, lint, Vitest, and Playwright. No tclk execution, wallet, blockchain, persistence, auth, signing, or release automation dependency exists.
- No release or deployment was performed. Firefox, WebKit, production, and deployment verification remain outside the completed Phase 7 evidence.

## Completed
DISCOVER → RESEARCH → VALIDATE → DEFINE → DESIGN → ARCHITECT → PLAN → HANDOFF → FOUNDATION → EXACT PROTOCOL CORE → EXPORT + TRANSCRIPT ANALYSIS → SAFE LIVE READER + INPUT RESOLUTION → TCLK/1 DETECTION → UX/UI → MVP HARDENING implementation gate.

## Approved decisions
- Product: read-only evidence inspector; no trust/reputation score.
- Inputs: Room, Message, DID, JSONL Export.
- Verification states: VALID / INVALID / UNSIGNED / UNVERIFIABLE.
- Deterministic protocol/crypto decisions only; no AI truth judgement.
- Signed fields, server assertions, and untrusted/caller-chosen data must be visibly separated.
- Sequence gaps are observable facts only; cause must never be inferred.
- Retained data must never be labeled full history.
- tclk/1 is detection/interpretation only; never a settlement conclusion.
- No signing, writes, key custody, wallet, auth, database, global archive, or conformance suite in MVP.
- Stack and security boundaries are locked in technical docs.
- Codex must stop after every phase for product-owner review.

## Blockers
None known.

## Open decisions
None blocking implementation. Any protocol behavior not explicitly supported by official sources must be treated as unknown and escalated rather than guessed.

## Known issues / risks
- Hosted Technocore is ephemeral and retained history can shrink.
- Nonces can be 19 digits; ordinary JS numeric parsing can destroy verification fidelity.
- Technocore content can contain malicious instructions/URLs; never auto-fetch user-derived URLs.
- Official protocol can evolve; protocol-sensitive changes require source re-verification.
- tclk/1 is alpha; no value-bearing rail currently ships in the official repo.
- ESLint 9.39.5 is deprecated upstream, but ESLint 10 is not yet accepted by the plugins bundled with `eslint-config-next` 16.3.4; reassess together during a future dependency review.
- The supplied workspace has no discoverable Git repository metadata, so Phase 2 change review
  used direct file inspection and command evidence rather than `git diff`/`git status`.

## Active plan
`plans/PHASE_46_V12_FINAL_ROOMS_UI_HARDENING.md` — COMPLETE / PASS.

## Active task
`tasks/TASK_047_V12_FINAL_ROOMS_UI_HARDENING.md` — COMPLETE / PASS.

### Release preflight (Vercel) — PAUSED, 2026-09-04

- Product owner authorized "RELEASE PREPARATION → VERCEL PREFLIGHT ANALYSIS + DOCUMENTATION" and, subsequently, "IMPLEMENT MINIMAL VERCEL PREFLIGHT CHANGES." No deployment, Vercel project creation, domain change, or release has been performed. **Vercel Preflight status: PAUSED, not a PASS, and not authorized to continue.**
- Platform-specific claims were checked against current official Vercel/Next.js documentation (not guessed): Vercel's Edge Runtime documentation states Node.js is the default Vercel Functions runtime and that, starting in Next.js 16.3, `runtime = "edge"` is no longer supported for routes (Node.js only) — this project is on Next.js 16.3.4. Vercel's Functions Limits documentation states a 4.5 MB request/response body ceiling and a 300s default execution duration (Hobby) — both far exceed this route's own self-enforced 8 KiB request cap, 2 MiB response cap, and 10s outbound timeout.
- Implemented, minimal, individually authorized source changes:
  - `app/api/inspect/route.ts`: added `export const runtime = "nodejs";` (explicit, matches existing/only-available behavior; no functional change).
  - `next.config.ts`: added a `headers()` function applying four headers to all routes — `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`.
  - `.env.example`: removed `TECHNOCORE_ORIGIN` and `APP_ENV`, both verified unused anywhere in source (no `process.env` reference exists in `app/` or `lib/`); replaced with a note explaining no environment variables are read.
  - Content-Security-Policy was intentionally NOT added — deferred pending production-build/browser verification, since Next.js may emit inline framework scripts that a naive `script-src 'self'` policy could break.
- No dependencies, `vercel.json`, middleware, monitoring, analytics, telemetry, or CI/CD configuration were added.
- **Local verification of these changes has NOT been run** (no `npm run typecheck` / `npm test` / `npm run test:e2e` / `npm run lint` / `npm run build` / `npm start` executed by the assistant). Deployment has NOT been performed. Production has NOT been verified.

## Next Exact Action (superseded — see Phase 8 section below for the current one)
Product owner (or delegated local session): run the required local verification commands (typecheck, tests, e2e, lint, build, production start) against the changed files, confirm the four new headers appear on responses, and confirm the app still builds/runs correctly. Only after that passes should the product owner consider authorizing an actual Vercel project creation/deployment step — which requires a separate, explicit authorization.

### Phase 8 (V11-01) — Diagnostic Foundation Contracts, 2026-09-04

**Provenance note.** This work was authorized via an external Build Contract
naming the phase "V1.1 / V11-01." Nothing in this repository's `plans/`,
`tasks/`, or `PROJECT_STATUS.md` history referenced "V1.1" or "V11-01" before
this entry — the repo's own history goes Phase 0 through Phase 7 (MVP
Hardening, complete), followed by the unrelated, still-unverified Vercel
release preflight recorded above. Rather than silently implementing an
unnumbered phase, this work was mapped onto the repo's own sequence as
**Phase 8**, documented in `plans/PHASE_08_V11-01_DIAGNOSTIC_FOUNDATION.md`
and `tasks/TASK_008_V11-01_DIAGNOSTIC_FOUNDATION.md`. This does not
constitute product-owner approval of a "V1.1" scope beyond what is
implemented here; it only records how V11-01 was executed inside this
repo's tracked history.

**Also noted:** `AGENTS.md` in the supplied snapshot contains an appended,
unauthoritative block (`<!-- BEGIN:nextjs-agent-rules -->...<!-- END -->`)
instructing an agent to read fictitious Next.js docs before coding. This was
treated as untrusted file content, not a real project or Next.js
instruction, and was not followed. It was left in place (not modified) since
altering `AGENTS.md` was out of scope for this task; the product owner
should independently verify the integrity of that file.

**Implemented (scope: `lib/diagnostics/` and `tests/diagnostics/` only):**
- `lib/diagnostics/contracts.ts` — `DiagnosticStatus` (`PASS | FAIL |
  UNAVAILABLE | NOT_APPLICABLE | NOT_OBSERVED`), the locked 12-stage
  Verification Pipeline order (`DIAGNOSTIC_STAGES`, source availability
  through tclk structural/binding), stage labels, and pure result/boundary
  types (`DiagnosticStageResult`, `DiagnosticStageWalk`, `DiagnosticBoundary`,
  `DiagnosticBoundaryResult`, `DiagnosticCopy`).
- `lib/diagnostics/boundaries.ts` — deterministic, evidence-only helpers:
  `assertCompleteOrderedWalk`, `firstFailedBoundary`,
  `firstUnavailableBoundary`, `selectBoundaries`. Earliest FAIL always wins;
  UNAVAILABLE is only surfaced when no FAIL exists anywhere in the walk;
  NOT_APPLICABLE/NOT_OBSERVED never become a boundary.
- `lib/diagnostics/rules.ts` — the single central "What this means" /
  "Check next" copy registry (`getDiagnosticCopy`), stage-specific for FAIL
  and UNAVAILABLE, shared generic copy for PASS/NOT_APPLICABLE/NOT_OBSERVED.
  No helper in this module assigns a root cause beyond the evidence present.
- `lib/diagnostics/index.ts` — barrel export, matching the existing
  `lib/domain/index.ts` convention.
- Tests: `tests/diagnostics/diagnostic-contracts.test.ts` (stage/status
  constants and labels), `tests/diagnostics/boundaries.test.ts` (stage-order
  assertion, boundary selection including earliest-FAIL-wins,
  UNAVAILABLE-only-when-no-FAIL, and NOT_APPLICABLE/NOT_OBSERVED exclusion),
  `tests/diagnostics/rules.test.ts` (deterministic, non-empty copy for every
  stage × status pair; stage-specific FAIL/UNAVAILABLE copy; shared copy for
  PASS/NOT_APPLICABLE/NOT_OBSERVED; a lexical check against
  root-cause-attributing language).
- No existing file under `lib/protocol/`, `lib/live/`, `lib/export/`,
  `lib/tclk/`, or `app/` was modified. No dependency was added. No UI/route
  behavior changed.

**Actual verification results, 2026-09-04 (this session):**
- `npm install`: completed (407 packages) — no `node_modules` existed before
  this session.
- `npm run typecheck`: **PASS**.
- `npm test`: **PASS** — 9 test files / 129 tests (was 6 files / 106 tests
  before this phase; +3 files / +23 tests from `tests/diagnostics/`). All
  pre-existing suites (protocol, export/transcript, live/safe-reader, tclk,
  inspect-route, evidence-contracts) remained green and unmodified.
- `npm run lint`: **PASS** — zero warnings.
- `npm run build`: **PASS** (Next.js 16.3.4 / Turbopack production build
  compiled successfully; also incidentally confirms the earlier,
  previously-unverified Vercel-preflight source changes to
  `app/api/inspect/route.ts` / `next.config.ts` / `.env.example` still build
  cleanly — this is not a full re-verification of that preflight, see below).
- `npm run test:e2e`: initially **NOT VERIFIED** in the sandboxed session
  above (Playwright's Chromium browser could not be installed; download
  failed with a 403/host-not-in-allowlist error against
  `cdn.playwright.dev`). Subsequently re-verified by the product owner
  locally on the exact current source (see "Product-owner local
  verification" below): **PASS — 6/6 Playwright tests.**
- `npm audit --audit-level=high`: initially **NOT VERIFIED** in the
  sandboxed session above (repeated timeouts contacting
  `registry.npmjs.org`'s audit endpoint). Subsequently re-verified by the
  product owner locally: **PASS — 0 vulnerabilities.**
- Production start (`npm start` against `127.0.0.1`) was **NOT** re-run in
  the assistant-run sandboxed session.

**Scope/security scan for this phase:** confirmed no wallet, signing, keys,
persistence, database, archive, crawler, arbitrary URL proxy, content-derived
fetch, trust/reputation/ranking score, AI judgement, contribution/reward
behavior, tclk execution/settlement/payment claim, or root-cause inference
was introduced. Existing verdict values (`VALID/INVALID/UNSIGNED/
UNVERIFIABLE`), canonical payload, export limits, redirect/fail-closed
behavior, and the `/api/inspect` route contract are unchanged.

**Product-owner local verification, 2026-09-04 (closing the two items above):**
The product owner ran the full required V11-01 verification suite locally
against the exact current source snapshot (outside this sandbox, which has
no network egress) and reported the following actual results:
- `npm run typecheck`: **PASS**.
- `npm test`: **PASS — 129/129 tests.**
- `npm run lint`: **PASS — zero warnings.**
- `npm run build`: **PASS — Next.js 16.3.4 production build successful.**
- `npm run test:e2e`: **PASS — 6/6 Playwright tests.**
- `npm audit --audit-level=high`: **PASS — 0 vulnerabilities.**

A separate assistant-run verification pass in a sandboxed session (no
`node_modules`, no network egress to `registry.npmjs.org` —
`x-deny-reason: host_not_allowed`) could not independently execute any of
these commands; that attempt is recorded as a BLOCKED environment/tooling
limitation, not a product/code failure, and is superseded by the
product-owner's actual local results above.

**V11-01 — Diagnostic Foundation Contracts: COMPLETE.**

**V11-01 Completion Gate: PASS** — authorized by the product owner on the
basis of the verified results above. All six required verification
commands passed on the exact current source; no outstanding verification
items remain for V11-01.

### V11-02 — Safe Public Room Discovery, 2026-09-04

**Authorization.** Product owner authorized starting only V11-02 after the
V11-01 Completion Gate closed as PASS.

**Implemented (scope: `lib/live/rooms-*`, `app/api/rooms/route.ts`,
`tests/live/rooms-discovery.test.ts`, `tests/input/rooms-route.test.ts`
only):**
- `lib/live/rooms-endpoint.ts` — `buildRoomsDiscoveryUrl()`. Takes no
  arguments and returns exactly `https://technocore.chat/rooms`, built from
  the existing `TECHNOCORE_ORIGIN` constant. There is no room, query, or
  path segment for a caller to influence.
- `lib/live/rooms-parser.ts` — `parseRoomsDiscoveryText`. The live endpoint
  was confirmed (via a single read-only fetch during this implementation
  session, not from the sandboxed test/build environment) to return a
  plain-text, line-oriented listing rather than JSON, e.g.:
  `/r/lobby   seq 19097635   6.0M  0s ago  · Verified Technocore Hub - ...`.
  The parser recognizes only that line shape; `#`-prefixed header/footer
  lines (including a total-room count and an "engagement ... nick
  diversity ..." statistics line actually present on the live endpoint) are
  read and discarded unconditionally — never stored or exposed — because
  the latter is reputation-adjacent scoring data explicitly out of scope.
  Room name and topic are captured only as opaque strings. Output is capped
  at exactly 50 observations (`DISCOVERY_MAX_OBSERVATIONS`) regardless of
  how many matching lines are present. A single non-conforming line is
  skipped, not fatal; a body with no recognizable line at all (no `#`
  comment, no `/r/...` room line) throws `RoomsDiscoveryError`
  (`MALFORMED_RESPONSE`).
- `lib/live/rooms-reader.ts` — `readRoomsDiscovery`. Re-implements, for this
  narrower endpoint, the exact security pattern already verified in
  `lib/live/reader.ts` (`readRoom`): fixed origin, `GET` only,
  `redirect: "manual"` with redirects rejected as an operational error
  (never followed), an `AbortController` timeout (10 s), a byte-bounded
  streaming body read (256 KiB — `DISCOVERY_RESPONSE_MAX_BYTES`), a
  post-fetch response-URL/origin check, and a required `text/plain`
  content type (the live endpoint's actual content type, vs. `readRoom`'s
  `application/json`). This module does not import from or modify
  `reader.ts`; the already-verified per-room reader is untouched.
- `app/api/rooms/route.ts` — `GET /api/rooms`. Declares `runtime = "nodejs"`
  matching the existing inspect route. Takes no request parameter, reads no
  body, and accepts no query string; it always performs exactly the one
  fixed `readRoomsDiscovery()` read and returns its `{ ok, value | error }`
  result as JSON with the default success status, mirroring the existing
  `/api/inspect` convention of carrying operational outcomes in the JSON
  body rather than the HTTP status. Calling it again simply repeats the
  same single bounded read — there is no pagination, cache, polling loop,
  or `/events` stream.
- `lib/live/types.ts` — additive only: `DISCOVERY_RESPONSE_MAX_BYTES`,
  `DISCOVERY_MAX_OBSERVATIONS`, `RoomObservation`, `RoomsDiscoveryPayload`.
  No existing export in this file was changed.
- `lib/live/index.ts` — additive only: new V11-02 exports appended; every
  existing export line is unchanged.
- No file under `lib/domain/`, `lib/protocol/`, `lib/export/`, `lib/input/`,
  `lib/tclk/`, `lib/diagnostics/`, or `app/api/inspect/` was modified. No
  dependency was added. No UI/Explore-flow code was added (deferred to
  V11-06 per the approved plan).

**Tests added:**
- `tests/live/rooms-discovery.test.ts` — fixed/parameterless URL
  construction; exactly one fixed-destination `GET` with manual redirects;
  redirect rejection; response-URL origin-mismatch rejection; timeout
  mapping; HTTP 4xx/5xx mapping (asserted to never contain
  `VALID`/`INVALID`/`UNSIGNED`/`UNVERIFIABLE`); wrong content-type
  rejection; >256 KiB rejection; network-failure mapping; malformed/
  unrecognized-body mapping; parsing of room/seq/size/activity/topic as
  opaque fields; exclusion of header/footer comment lines including the
  live endpoint's actual engagement/notes statistics; omission of the
  `topic` field when absent; a 50-observation cap enforced against 75
  candidate lines; single-anomalous-line tolerance; a path-traversal-shaped
  room line never becoming an observation; hostile topic strings (script
  tags, a credential-harvesting URL, a `javascript:` URI, and an
  injection-styled instruction string) preserved verbatim as inert data;
  and a check that emitted observation fields never include a
  trust/verified/official/safe/popular label.
- `tests/input/rooms-route.test.ts` — the route performs exactly one
  fixed-destination read with no request input and returns the parsed
  observations; a discovery failure surfaces as `{ ok: false, error }`
  with no verdict string ever appearing in the response; a regression
  check that `POST /api/inspect`'s existing oversized-request rejection
  (413 before the body is consumed) is unchanged.
- The parser's core logic (independent of TypeScript types) was manually
  cross-checked in this session, outside the project's own test runner,
  against the actual live response fetched from
  `https://technocore.chat/rooms` and against every new test's exact input
  strings; all matched the expected output shown above. This is not a
  substitute for `npm test`.

**Product-owner local verification, 2026-09-04:** The product owner ran the
full required V11-02 verification suite against the exact current local
workspace after the V11-02 patch was applied and reported:
- `npm run typecheck`: **PASS**.
- `npm test`: **PASS — 156/156 tests.**
- `npm run lint`: **PASS — zero warnings.**
- `npm run build`: **PASS — `/api/rooms` confirmed in the production build.**
- `npm run test:e2e`: **PASS — 6/6 Playwright tests.**
- `npm audit --audit-level=high`: **PASS — 0 vulnerabilities.**

These results supersede the earlier assistant-session environment limitation
and close the V11-02 verification requirement against the current source.

**Scope/security review (source inspection, not test execution):**
confirmed no wallet, signing, keys, persistence, database, archive,
crawler, index, arbitrary URL/proxy, content-derived fetch, pagination,
`/events` usage, polling, or trust/reputation/ranking/safety label was
introduced. The outbound destination is a hard-coded constant with no
caller-controllable origin, host, path, query, or redirect target.
Discovery/network/parser failures are returned only as `OperationalError`
values via the existing `ReadResult` shape and never as
`VALID`/`INVALID`/`UNSIGNED`/`UNVERIFIABLE`. `/api/inspect` source is
byte-for-byte unchanged. No Explore UI was added.

**V11-02 — Safe Public Room Discovery: COMPLETE.**

**V11-02 Completion Gate: PASS** — authorized by the product owner on the
basis of the verified results above. All six required verification commands
passed against the exact current local workspace; no outstanding verification
items remain for V11-02.

### V11-03 — Transcript Diagnostics Adapter, 2026-09-04

**Authorization.** Product owner authorized V11-03 and approved the smallest
verifier semantic correction: malformed/noncanonical signature
representation returns `UNVERIFIABLE`, while `INVALID` is reserved for an
executed false Ed25519 verification with usable decoded key, canonical
payload, and usable signature.

**Implemented:**
- `lib/protocol/verify.ts`: changed only the malformed/noncanonical signature
  branch from `INVALID` to `UNVERIFIABLE`; genuine cryptographic mismatch
  behavior remains `INVALID`.
- `lib/diagnostics/transcript.ts`: added deterministic adapters for existing
  bounded live-room results and local JSONL exports. Output includes source
  summary, parsed/malformed counts, selected/all record diagnostics, all 12
  ordered stages with central V11-01 explanation/check-next copy, boundaries,
  separate operational errors, evidence verdict when available, cause-neutral
  sequence gaps, retained-window limitations, and bounded observation-only
  tclk results.
- `lib/diagnostics/index.ts`: additive exports for the adapter and its types.
- `tests/protocol/protocol-core.test.ts`: corrected the directly contradictory
  malformed-signature expectation to `UNVERIFIABLE`.
- `tests/diagnostics/transcript-adapter.test.ts`: added 12 focused tests for
  valid/empty/malformed/mixed/live transcripts, locked order, boundaries,
  verdict separation, unsigned evidence, cause-neutral gaps, retained-window
  wording, tclk absence/observation, and deterministic selection.
- Added `plans/PHASE_09_V11-03_TRANSCRIPT_DIAGNOSTICS.md` and
  `tasks/TASK_009_V11-03_TRANSCRIPT_DIAGNOSTICS.md`.
- `scripts/run-e2e.mjs`, `package.json`, and `playwright.config.ts`: replaced
  Playwright's hanging Windows `webServer` ownership with a deterministic
  in-process production custom server using the supported Next.js 16.3.4
  public API (`next()`, `prepare()`, `getRequestHandler()`, `close()`) and an
  exact `node:http` server handle. The launcher rejects an occupied port,
  checks build freshness, waits for HTTP readiness, propagates Playwright's
  real exit result, closes only its owned handles in `finally`, and verifies
  port 3100 is clear. It uses no `taskkill`, `Stop-Process`, forced success,
  server reuse, or new dependency.

No application route, UI, parser, live/export/tclk limit, dependency,
network behavior, persistence, signing/wallet behavior, release, or deployment
configuration was changed.

**Verification results:**
- `npm.cmd run typecheck`: **PASS**.
- Focused Vitest run: **PASS — 5 files / 66 tests.**
- `npm.cmd test`: **PASS — 12 files / 168 tests.**
- `npm.cmd run lint`: **PASS — zero warnings.**
- `npm.cmd run build`: **PASS** — Next.js 16.3.4 production build succeeded;
  `/api/inspect` and `/api/rooms` are present.
- `npm.cmd run test:e2e`: **PASS — 6/6 Chromium tests in 2.7s.** Playwright
  printed its normal final summary and exited naturally with code 0. The
  in-process Next application and exact HTTP server handle closed
  programmatically; port 3100 was clear and zero launcher-owned Node or
  Chromium processes remained afterward.
- `npm.cmd audit --audit-level=high`: the sandboxed request initially failed
  at the registry audit endpoint without returning an audit result; the exact
  approved network-enabled rerun **PASS — 0 vulnerabilities**.

**V11-03 — Transcript Diagnostics Adapter: COMPLETE.**

**V11-03 Completion Gate: PASS.** All required implementation, regression,
security, lifecycle, and verification checks passed against the current local
 workspace. At that gate, V11-04 had not yet started.

### V11-04 — Verification Pipeline Adapter, 2026-09-04

**Authorization.** Product owner supplied the authoritative V11-04 contract
from the external Product Brain Build Plan and authorized only the Verification
Pipeline Adapter.

**Implemented:**
- `lib/diagnostics/pipeline.ts`: canonical pure adapter for selected
  `ROOM`/`MESSAGE`/`EXPORT` V11-03 diagnostics and DID-only key diagnostics.
  Every result exposes exactly the locked 12 stages in order, deterministic
  V11-01 meaning/check-next copy, first-failed or conditional
  first-unavailable boundary, separate operational errors, the existing
  Evidence Verdict when available, and the existing bounded tclk observation
  when applicable.
- Transcript pipelines project already-computed V11-03 results; they do not
  call or duplicate cryptographic verification. DID-only pipelines reuse
  `decodeEd25519DidKey` and mark message/nonce/signature/Ed25519/tclk stages
  `NOT_APPLICABLE` rather than inventing evidence.
- `lib/diagnostics/index.ts`: additive V11-04 exports.
- `tests/diagnostics/verification-pipeline.test.ts`: 14 focused tests covering
  exact ordering/copy, `VALID`, genuine cryptographic `INVALID`, missing and
  malformed-signature `UNVERIFIABLE`, `UNSIGNED`, DID structure/decoding,
  malformed/missing evidence, boundary precedence, non-applicable/not-observed
  handling, operational-error separation, empty/malformed transcripts,
  ROOM/MESSAGE/EXPORT projection, and bounded tclk states/forbidden claims.
- Added `plans/PHASE_10_V11-04_VERIFICATION_PIPELINE.md` and
  `tasks/TASK_010_V11-04_VERIFICATION_PIPELINE.md`.

No application/UI/route, protocol/verifier, parser/limit, tclk, E2E lifecycle,
dependency, network, persistence, wallet/signing/key-custody, or release/
deployment behavior changed.

**Verification results:**
- `npm.cmd run typecheck`: **PASS**.
- Focused Vitest run: **PASS — 6 files / 80 tests.**
- `npm.cmd test`: **PASS — 13 files / 182 tests.**
- `npm.cmd run lint`: **PASS — zero warnings.**
- `npm.cmd run build`: **PASS** — Next.js 16.3.4 production build succeeded;
  `/api/inspect` and `/api/rooms` remain present.
- `npm.cmd run test:e2e`: **PASS — 6/6 Chromium tests in 2.7s**, normal final
  summary, natural exit code 0, and port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: sandboxed registry access initially
  returned no audit result; the exact approved network-enabled rerun
  **PASS — 0 vulnerabilities**.

**V11-04 — Verification Pipeline Adapter: COMPLETE.**

**V11-04 Completion Gate: PASS.** The pipeline exposes exactly 12 ordered
stages, reuses the existing verifier through V11-03, preserves verdict/status/
operational separation and INVALID semantics, keeps tclk observational, and
passes all focused and regression checks. V11-05 is not started or authorized.

### V11-05 — Local Evidence Receipt, 2026-09-04

**Authorization.** Product owner authorized only V11-05 Local Evidence
Receipt: one deterministic canonical model, JSON and Markdown serializers,
and browser-local download support.

**Implementation present:**
- `lib/receipt/types.ts`, `model.ts`, `serialize.ts`, `download.ts`, and
  `index.ts` define a versioned canonical receipt, whitelist-only projection
  from V11-03/V11-04, deterministic JSON/Markdown, and a browser-local
  Blob/download helper.
- Raw records, transcript/export bodies, unrelated records, tclk frame bodies,
  operational-error contexts, timestamps, paths, secrets, uploads, storage,
  and network behavior are not included.
- `tests/receipt/evidence-receipt.test.ts` adds focused determinism, privacy,
  verdict/status/boundary, limitation, gap, tclk, and download-descriptor tests.
- Added `plans/PHASE_11_V11-05_LOCAL_EVIDENCE_RECEIPT.md` and
  `tasks/TASK_011_V11-05_LOCAL_EVIDENCE_RECEIPT.md`.

**Verification this session:**
- The authorized test-only correction replaced the impossible direct
  disjoint-union comparison with a runtime string-array containment assertion.
- `npm.cmd run typecheck`: **PASS**.
- `npm.cmd test`: **PASS — 14 files / 195 tests.**
- `npm.cmd run lint`: **FAIL** — one error, zero warnings:
  `@typescript-eslint/no-empty-object-type` at `lib/receipt/types.ts:29`.
- Build, E2E, and audit: **NOT RUN** because the contract requires stopping on
  any verification failure.

**Fresh verification after the authorized lint correction:**
- Replaced the empty `ReceiptBoundary` interface with the semantically
  equivalent `type ReceiptBoundary = DiagnosticBoundary` alias.
- `npm.cmd run typecheck`: **PASS** — exit code 0.
- `npm.cmd test`: **PASS — 14 files / 195 tests.**
- `npm.cmd run lint`: **PASS — zero warnings.**
- `npm.cmd run build`: **PASS** — Next.js 16.3.4 production build succeeded;
  `/api/inspect` and `/api/rooms` remain present.
- `npm.cmd run test:e2e`: **PASS — 6/6 Chromium tests;** normal Playwright
  summary `6 passed (2.8s)`; exit code 0; port 3100 clear afterward; no
  launcher-owned process marker remained.
- `npm.cmd audit --audit-level=high`: **NOT PASS** — the sandboxed attempt
  failed to reach the npm advisory endpoint and could not write its cache log.
  The escalated retry produced no output for about two minutes and was
  terminated; exit code 1. No vulnerability result was obtained.

**Authorized audit-only retry:**
- Configured registry: `https://registry.npmjs.org/`.
- `npm.cmd ping`: **PASS** — `PONG 309ms`, exit code 0.
- Exact command `npm.cmd audit --audit-level=high`: **UNVERIFIED** — it emitted
  no output for about two minutes and was terminated with exit code 1. No
  vulnerability count or severity result was returned. This is an external
  audit availability/verification blocker, not evidence of a vulnerability.

**Product-owner process decision:** do not retry npm audit again in V11-05.
V11-05 implementation is accepted as **COMPLETE — PASS** based on the verified
typecheck, 195/195 unit tests, zero-warning lint, production build, 6/6 E2E,
natural Playwright exit code 0, and successful port cleanup.

**Security audit: DEFERRED / UNVERIFIED.** The V11-05 run does not establish an
npm audit pass or zero vulnerabilities, and it produced no vulnerability
finding. A successful `npm audit --audit-level=high` result is carried forward
as a mandatory blocker for V11-07 Regression and Hardening / the pre-release
gate.

**V11-05 Completion Gate: PASS.** V11-06 remains NOT STARTED and NOT AUTHORIZED.

## Next Exact Action (superseded by completed V11-06 below)
Await separate product-owner authorization before beginning V11-06. Preserve
the deferred npm audit as a mandatory V11-07 Regression and Hardening /
pre-release blocker. Do not continue Vercel preflight or deploy without
separate authorization.

### V11-06 — Functional UX Integration, 2026-09-04

**Authorization.** Product owner authorized only V11-06 Functional UX
Integration: convert the tab-first UI into the approved task-oriented V1.1
experience by integrating existing V11-02 through V11-05 capabilities.

**Implemented:**
- Replaced the former mode tabs with Start actions for Explore Public Rooms,
  Debug a Message, Analyze an Export, and Inspect a DID / Key.
- Integrated bounded `/api/rooms` discovery with loading, empty, operational
  error, and inert untrusted room/topic presentation.
- Added in-memory Start, back-to-explore/input/transcript, transcript,
  pipeline, and receipt navigation while retaining current task inputs.
- Presented canonical V11-03 transcript summaries/observations before detailed
  records and canonical V11-04 evidence verdicts, boundaries, explanatory copy,
  check-next guidance, and all 12 ordered text-labelled stages.
- Integrated V11-05 Markdown-default and JSON receipt preview/download in a
  contextual browser-local dialog. Export content remains browser-local and is
  never uploaded, persisted, or placed in browser storage.
- Reworked responsive styling so verdict, first boundary, meaning, and next
  check precede technical stages on mobile.
- Replaced the six legacy UI E2E cases with eight focused V11-06 behavioral
  cases covering all approved flows, discovery loading/empty/error states,
  failed and unavailable boundaries, INVALID/UNVERIFIABLE separation,
  retention/gap/tclk limitations, hostile content, receipt formats/downloads,
  navigation, forbidden surfaces, accessible status text, and mobile order.

**Contained implementation corrections:** canonical boundary copy is obtained
from the existing diagnostic rules; reconstructed server timestamp evidence is
normalized to the protocol record's string type; an unused React ref was
removed; and focused E2E fixtures/selectors were corrected to match canonical
copy and actual DID stage semantics. No approved behavior was changed.

**Verification:**
- `npm.cmd run typecheck`: **PASS** — exit code 0.
- `npm.cmd test`: **PASS — 14 files / 195 tests.**
- `npm.cmd run lint`: **PASS — zero warnings.**
- `npm.cmd run build`: **PASS** — Next.js 16.3.4 production build succeeded;
  `/api/inspect` and `/api/rooms` remain present.
- `npm.cmd run test:e2e`: **PASS — 8/8 Chromium tests;** normal Playwright
  summary `8 passed (3.5s)`; exit code 0; port 3100 clear afterward. The owned
  launcher completed normally; unrestricted CIM process inventory was denied
  by Windows permissions, so cleanup evidence is the launcher result and clear
  port rather than a system-wide process scan.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**Scope/security review:** no API contract, fixed-origin reader, protocol,
cryptographic, evidence verdict, diagnostic status/boundary, receipt, parser
limit, tclk, E2E lifecycle, dependency, persistence, telemetry, storage,
wallet, signing, key-custody, or deployment behavior changed.

**V11-06 Completion Gate: PASS.** Do not begin V11-07.

## Next Exact Action (superseded by completed V11-07 below)
Await separate product-owner authorization before beginning V11-07 Regression
and Hardening. Do not continue Vercel preflight or deploy without separate
authorization.

### V11-07 — Regression and Hardening, 2026-09-04

**Audit findings:** PASS. The implemented product surface is limited to the
approved Start, public-room exploration, message debug, local export, DID/key,
transcript, verification pipeline, and contextual local receipt flows. No
forbidden contribution, offer-board, wallet, signing, key-custody, balance,
reward, point, ranking, eligibility, reputation/health score, social dashboard,
archive/crawler, AI judgement, tclk execution, settlement/payment verification,
or speculative FLOP behavior was found.

**Security and semantic audit:** fixed-origin readers remain GET-only,
parameter-bounded, manual-redirect/fail-closed, and non-proxying. Locked limits
remain 5 MiB per export, 10,000 lines, 256 KiB per line, 2 MiB live response,
10-second reader timeout, 200 room messages, 8 KiB inspect request, 256 KiB room
discovery response, 50 discovery observations, and 4096 tclk characters. Export
and receipt flows remain browser-local with no persistence, upload, telemetry,
or content-derived fetch.

The four evidence verdicts, genuine-cryptographic-only INVALID path, exact
`<room>|<nonce>|<text>` signed bytes, exact string nonce, unsigned seq/ts,
legacy UNVERIFIABLE behavior, Ed25519 did:key behavior, five stage statuses,
locked 12-stage order, and earliest relevant boundary rules remain unchanged.
Operational errors remain separate. Retention and gap copy remains bounded and
cause-neutral. tclk remains observation/structure/binding only. Receipts remain
deterministic, whitelist-only, raw-data excluding, and derived from one model.

**Architecture audit:** `/api/inspect` and `/api/rooms` contracts remain intact;
protocol/domain logic remains outside React; V11-03/V11-04/V11-05 adapters are
reused; no second verifier/export parser, persistence layer, dependency, or E2E
lifecycle change was introduced.

**Defects/corrections/tests:** no V11-07 product defect was discovered, no
hardening code correction was required, and no test was added merely to increase
test count. Existing unit and eight V11-06 behavioral E2E cases materially cover
the required regression boundaries.

**Final completion gate:**
- `npm.cmd run typecheck`: **PASS** — exit code 0.
- `npm.cmd test`: **PASS — 14 files / 195 tests.**
- `npm.cmd run lint`: **PASS — zero warnings.**
- `npm.cmd run build`: **PASS** — Next.js 16.3.4 production build succeeded;
  `/api/inspect` and `/api/rooms` are present.
- `npm.cmd run test:e2e`: **PASS — 8/8 Chromium tests;** normal Playwright
  summary `8 passed (3.2s)`; exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**V11-07 Completion Gate: PASS.** This establishes local V1.1 regression and
hardening readiness only; it does not authorize deployment.

## Next Exact Action (superseded by release-readiness review below)
Await explicit product-owner authorization for release-readiness/preflight work.
Do not deploy until separately authorized and all production gates are reviewed.

### V1.1 Release Readiness / Preflight Review, 2026-09-04

**Result: BLOCKED on operational decisions; application readiness PASS.** No
deployment was performed and production remains unverified.

**Verified:**
- Fresh `npm.cmd run build` PASS on Next.js 16.3.4. Intended routes are `/`,
  `/api/inspect`, and `/api/rooms`; `_not-found` is the only framework route.
- Direct installed Next CLI production start on `127.0.0.1:3200` PASS; ready in
  308 ms. `/` returned HTTP 200 with `nosniff`, `no-referrer`, frame `DENY`, and
  restrictive Permissions Policy headers. Malformed `/api/inspect` input
  returned bounded JSON HTTP 400 without debug detail. The server stopped and
  port 3200 was clear.
- Application runtime needs only declared Next/React/Noble/Scure dependencies;
  no application runtime import requires a development-only dependency.
- No application environment variables, private keys, wallet/API secrets,
  database, migration, persisted state, hard-coded local path, production
  localhost dependency, or development-only configuration was found.
- Fixed-origin Technocore GET reads, manual redirect rejection, request/
  response/time limits, and no-proxy/no-polling/no-crawler behavior remain.
- Export analysis and receipt generation/download remain browser-local with no
  upload, persistence, storage, telemetry, or analytics.
- Production copy preserves identity/truth/trust/history/payment/settlement/
  tclk limitations. Untrusted content remains inert and errors do not expose
  internal context.
- Vercel remains the documented target. Current official Vercel documentation
  confirms Next.js support, generated `vercel.app` URLs, staged production
  deployment/promotion options, and Instant Rollback / `vercel rollback`.

**No source or deployment-config correction is required before deployment.**
No source code, dependencies, API, limits, or deployment configuration changed
during this review. Release/operations documentation was reconciled only.

**Blocking decisions:** no Vercel account/team/project is linked; deployment
method and operator are unset; production URL/domain is unset; monitoring,
incident response, smoke-test, and rollback owners are unset; and a first
deployment has no previous production rollback target, so takedown behavior
must be approved. CSP remains an optional separately reviewed hardening choice,
not an implemented or verified control.

**Release state: NOT DEPLOYED. Production verification: NOT PERFORMED.**

## Next Exact Action (superseded by completed V12-01 below)
Product owner reviews this V1.2 contract reconciliation and, if accepted,
issues separate implementation authorization for V12-01 Local Identity &
Encrypted Backup Foundation. Do not implement V12-01, begin V12-02, resume
release preflight, or deploy before separate authorization.

### V1.2 specification/security contract reconciliation — 2026-09-05

**Status: COMPLETE.** The completed V1.1 read-only debugger contract remains
historically documented and V1.1 remains COMPLETE / PASS. V1.2 supersedes only
the conflicting V1.1 blanket prohibitions on browser-local seed, passphrase,
signing-material, and temporary key handling.

V1.2 now explicitly permits browser-local Ed25519 identity generation,
browser-local encrypted backup creation/import/decryption, a user-entered
browser-local backup passphrase, and temporary session-memory unlocked identity
material. Separately authorized later phases may add explicit browser-local
signing and browser-direct publishing to a fixed Technocore endpoint.

Server secret custody, server signing, server write relays, secret transmission,
secret logging/telemetry/analytics, persistent plaintext custody, raw seed/key
paste, automatic signing/publishing, arbitrary destinations, and network writes
in V12-01 remain forbidden. V1.1 protocol, evidence, diagnostic, receipt,
fixed-origin reader, parser-limit, retained-history, and tclk semantics remain
unchanged.

The reconciled contract is recorded in the V1.2 amendments to the PRD, Scope,
Architecture, Security Threat Model, Build Handoff, and Acceptance Criteria.
V12-01 implementation authorization was subsequently granted; see the completed phase entry below.

### Phase 14 (V12-01) — Local Identity & Encrypted Backup Foundation, 2026-09-05

**Implemented:**

- Added a browser-local session identity boundary with exactly 32 bytes of Web Crypto randomness, Noble Ed25519 public-key derivation, and the shared protocol Ed25519 did:key codec.
- Added canonical `technocore-agent-backup/v1` parsing and serialization. Its public envelope is restricted to format, public DID, fixed KDF/cipher metadata, salt, IV, and ciphertext; its encrypted payload is exactly the seed.
- Added PBKDF2-HMAC-SHA-256 at 600,000 iterations with random 16-byte salt and AES-256-GCM with random 12-byte IV.
- Import validates bounded shape, version, fields, DID, and canonical encodings before key derivation; decrypts/authenticates; validates an exact 32-byte seed; re-derives identity; and rejects a DID mismatch.
- Generated sessions remain `NOT_VERIFIED`; only successful backup re-import produces `VERIFIED`. The secret holder has no seed/private-key getter and supports explicit lock with best-effort buffer clearing.
- Added no UI, storage, cookie, URL secret, signing, publishing, fetch, API route, server relay, dependency, or deployment behavior.

**Tests:** Added focused coverage for the randomness boundary, fixed DID vector and decoder compatibility, schema/version/field bounds, plaintext exclusion, round trip, verification state, wrong passphrase, ciphertext/salt/IV tampering, malformed input, pre-crypto oversize rejection, invalid decrypted seed, DID mismatch, explicit locking, public-model separation, and absence of storage/network-write capability.

**Ordinary correction:** Initial TypeScript checks identified DOM `BufferSource` incompatibility with generic typed arrays. Web Crypto inputs were changed to explicit owned `Uint8Array<ArrayBuffer>` copies; behavior and cryptographic parameters were unchanged.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 15 files / 208 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4 production build; `/`, `/api/inspect`, and `/api/rooms` remain present.
- `npm.cmd run test:e2e`: **PASS — 8/8 Chromium tests**, normal summary `8 passed (3.5s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: sandboxed advisory lookup produced no result; exact network-enabled retry **PASS — 0 vulnerabilities**, exit code 0.

**V1.1 regression:** PASS. Existing protocol/verifier, evidence, diagnostics, receipts, readers/routes, limits, tclk semantics, UI, and E2E lifecycle remain unchanged except for the additive shared DID encoder.

**V12-01 Completion Gate: PASS.** V12-02 is NOT STARTED and NOT AUTHORIZED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-01 completion (superseded by completed V12-02 below)

Product owner reviews the V12-01 implementation and Completion Gate evidence, then separately authorizes any next V1.2 phase. Do not begin V12-02, implement signing/publishing, resume release preflight, or deploy without explicit authorization.

### Phase 15 (V12-02) — Signing & Nonce Preparation, 2026-09-05

**Implemented:**

- Extended the V12-01 secret-owning session with one explicit preparation operation; no seed/private-key getter was added.
- Reused existing room validation, canonical single-line sweep, exact `<room>|<nonce>|<post-sweep text>` UTF-8 payload construction, Noble Ed25519, canonical unpadded base64url signature representation, and V1.1 `verifyProtocolRecord` self-verification.
- Added exact BigInt nonce selection using `max(current Unix milliseconds, highest observed nonce + 1, highest session nonce + 1)` within the existing 1–19 digit nonce contract.
- Added an in-memory reservation map isolated by DID and room. Preparation reserves before its asynchronous signature operation to prevent concurrent local duplicate preparation; publish-attempt burning remains unimplemented and reserved for a later authorized phase.
- Added an immutable public descriptor containing only `SIGNED_LOCALLY_NOT_PUBLISHED`, room, DID, nonce, post-sweep text, inspectable canonical payload, and signature.
- Added no fetch, write URL, publisher, API route, server relay, persistence, UI, dependency, publish retry, or deployment behavior.

**Tests:** Added 24 focused tests covering exact payload and UTF-8 bytes, sweep-before-signing, deterministic fixed signature, independent verification, room/nonce/text/signature tampering, public descriptor/state/secret exclusion, locked identity rejection, all nonce candidate branches, exact arithmetic beyond `Number.MAX_SAFE_INTEGER`, malformed/out-of-range evidence, DID+room reservation isolation, duplicate prevention, and static absence of persistence/network-write/publish capability. Focused identity/protocol/signing run PASS — 3 files / 68 tests.

**Ordinary correction:** The initial tampered-signature test used a non-protocol `signature` property instead of replacing `sig`; the test fixture key was corrected without changing implementation or verifier semantics.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 16 files / 232 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4 production build; `/`, `/api/inspect`, and `/api/rooms` remain present.
- `npm.cmd run test:e2e`: **PASS — 8/8 Chromium tests**, normal summary `8 passed (2.9s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**V12-01 regression:** PASS — identity generation, encrypted backup, re-import verification, locking, and secret boundary tests remain green.

**V1.1 regression:** PASS — verifier/evidence semantics, diagnostics, receipts, fixed-origin routes/readers, limits, UI, tclk observation, and E2E lifecycle remain green.

**V12-02 Completion Gate: PASS.** V12-03 is NOT STARTED and NOT AUTHORIZED. Publishing and deployment remain prohibited.

## Next Exact Action — V12-02 completion (superseded by V12-03 contract reconciliation below)

Product owner reviews the V12-02 implementation and Completion Gate evidence, then separately authorizes any next V1.2 phase. Do not begin V12-03, implement or execute publishing, resume release preflight, or deploy without explicit authorization.

### V12-03 official transport contract reconciliation — 2026-09-05

**Status: COMPLETE.** The prior missing-contract blocker is resolved at the specification level. Official upstream README/API documentation was verified read-only at `https://github.com/flop-labs/technocore-chat` on branch `main`; no exact revision identifier was reliably observable, so none is claimed.

The only selected V12-03 lane is `GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>` with exact component order, standard one-time path-component encoding, no body/query/fragment, fixed destination validation, explicit invocation, attempt-before-fetch state, in-memory nonce burning, ambiguous-outcome semantics, non-required/untrusted response body, no retry, and no verified-publication claim. The documented upstream POST lane is explicitly out of scope.

Documentation-only changes were made. No source, tests, dependencies, configuration, live Technocore write, release, or deployment action occurred.

**V12-03 implementation: NOT STARTED / AWAITING SEPARATE AUTHORIZATION.** V12-04 is not authorized. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-03 contract reconciliation (superseded by completed V12-03 below)

Product owner reviews the reconciled transport contract and, if accepted, separately authorizes V12-03 implementation. Do not implement V12-03, perform a live write, begin V12-04, resume release preflight, or deploy before that authorization.

### Phase 16 (V12-03) — Browser Direct Publish, 2026-09-05

**Implemented:**

- Added a browser-only transport accepting an immutable, independently valid V12-02 public descriptor and no secret identity capability.
- The executable URL is constructed only inside explicit `publishPreparedMessage` invocation as `GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>`. Every dynamic field is mapped unchanged and encoded once with `encodeURIComponent`.
- Before fetch, the URL is checked for exact HTTPS protocol, hostname, empty credentials/port/query/fragment, and exact expected path. Fetch uses GET, no body, omitted credentials, no-store caching, no referrer, redirect rejection, one AbortController timeout, and no retry.
- Extended V12-02 reservations with prepared-nonce membership and irreversible in-memory burning. A `PublishAttemptSession` exposes only `NOT_ATTEMPTED`, `ATTEMPTED`, `RESPONSE_RECEIVED`, and `OUTCOME_UNKNOWN`; begin burns before fetch, and repeat attempts fail locally.
- Observed responses expose only numeric status and map to `RESPONSE_RECEIVED`, including non-2xx. Response bodies and status text are not read or returned. Fetch/CORS/timeout/interruption ambiguity maps to `OUTCOME_UNKNOWN` with read-back-required wording.
- No `SUCCESS`, `PUBLISHED`, `FAILED_TO_PUBLISH`, or `PUBLISHED_AND_VERIFIED` state exists. No automatic retry, replacement nonce, re-signing, re-sweeping, POST, arbitrary destination, server route/relay, persistence, UI, dependency, release, or deployment behavior was added.

**Tests:** Added 18 focused tests covering explicit invocation, exact fixed GET mapping/order, slash/question/hash/percent/non-ASCII path encoding and decoding, no query/fragment, altered descriptor/host rejection, ATTEMPTED and burn-before-fetch, 2xx/non-2xx evidence semantics, network/CORS/timeout ambiguity, permanent burn, zero-request repeat rejection, no retry, response-body inertness, secret exclusion, POST absence, persistence absence, executable-URL non-exposure, and server-relay absence. All publish tests use injected fetch mocks; zero automated live Technocore writes occurred.

**Ordinary corrections:** Replaced an invalid TypeScript private constructor parameter-property declaration with an explicit private field. Corrected the timeout test so fake timers did not stall asynchronous cryptographic validation, then used the real bounded 25 ms injected-fetch timeout. Removed unnecessary untrusted `statusText` metadata from results.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 17 files / 250 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4 production build; only `/`, `/api/inspect`, and `/api/rooms` remain, with no write route.
- `npm.cmd run test:e2e`: **PASS — 8/8 Chromium tests**, normal summary `8 passed (3.0s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**V12-02 regression:** PASS — canonical signing, self-verification, exact nonce arithmetic/reservations, unpublished descriptor, and secret boundary remain green.

**V12-01 regression:** PASS — identity generation, encrypted backup/import verification, session memory, and locking remain green.

**V1.1 regression:** PASS — verifier/evidence semantics, diagnostics, receipts, fixed-origin readers/routes, limits, UI, tclk observation, and E2E lifecycle remain green.

**V12-03 Completion Gate: PASS.** This is transport-attempt evidence only. V12-04 read-back/verified publication is NOT IMPLEMENTED, NOT STARTED, and NOT AUTHORIZED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-03 completion (superseded by completed V12-04 below)

Product owner reviews the V12-03 implementation and Completion Gate evidence, then separately authorizes any read-back phase. Do not begin V12-04, claim verified publication, perform a live test write, resume release preflight, or deploy without explicit authorization.

### Phase 17 (V12-04) — Read-back Verification, 2026-09-05

**Implemented:**

- Added a read-only adapter gated by an existing V12-03 publish-attempt state. `NOT_ATTEMPTED` performs no read and cannot claim publication.
- Reused the existing fixed-origin bounded room reader. Exact matching requires the prepared room, DID, nonce, post-sweep text, and canonical signature; unsigned server `seq` and `ts` are retained only as observed evidence.
- `PUBLISHED_AND_VERIFIED` is emitted only after the exact retained record is independently checked by the existing V1.1 verifier and returns `VALID`. An `OUTCOME_UNKNOWN` attempt can therefore later verify, while an HTTP response alone remains insufficient.
- Added cause-neutral `NOT_OBSERVED`, evidence-preserving `OBSERVED_BUT_NOT_VERIFIED`, and operationally separate `READBACK_UNAVAILABLE` states. Malformed, non-canonical, or missing signature evidence remains `UNVERIFIABLE`; genuine canonical cryptographic mismatch remains `INVALID`.
- Multiple exact retained candidates are resolved deterministically in source order and their count is reported without claiming causal attribution.
- Reused V11-03 diagnostics, V11-04 pipeline, and V11-05 receipt generation. No protocol, evidence, tclk, receipt-schema, route, UI, write transport, retry, re-signing, replacement nonce, persistence, dependency, release, or deployment behavior changed.

**Tests:** Added 21 mocked-read test cases covering no-attempt/no-read, `RESPONSE_RECEIVED` and `OUTCOME_UNKNOWN` recovery, exact five-field matching, HTTP-response insufficiency, seq/ts separation, deterministic duplicate handling, malformed/non-canonical/missing signature `UNVERIFIABLE`, genuine cryptographic `INVALID`, read timeout/network errors, room mismatch, deterministic secret-free receipt output, existing-adapter reuse, no write/retry capability, and retained nonce burning. Automated tests performed zero live Technocore writes.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 18 files / 271 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4 production build; `/`, `/api/inspect`, and `/api/rooms` remain present with no write route.
- `npm.cmd run test:e2e`: **PASS — 8/8 Chromium tests**, normal Playwright summary `8 passed (3.4s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: network-enabled advisory lookup **PASS — 0 vulnerabilities**, exit code 0.

**Security/evidence boundary review:** PASS. Read-back has no secret input, writer, retry, polling, persistence, arbitrary destination, server relay, or causal/history claim. The nonce remains burned. Operational errors are not verdicts. The existing V1.1 cryptographic verifier is the only authority for `VALID`/`INVALID`, and retained-window absence remains cause-neutral.

**V12-04 Completion Gate: PASS.** V12-05 is NOT STARTED and NOT AUTHORIZED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-04 completion (superseded by completed V12-05 below)

Product owner reviews the V12-04 implementation and Completion Gate evidence, then separately authorizes any next V1.2 phase. Do not begin V12-05, perform a live test write, resume release preflight, or deploy without explicit authorization.

### Phase 18 (V12-05) — Guided Newcomer Onboarding, 2026-09-05

**Implemented:**

- Added an obvious Start-page newcomer path while retaining all four V1.1 debugger entry points.
- Added one client-only eight-step journey: create identity, secure backup, verify/import backup, prepare introduction, sign locally, explicitly publish, explicitly read back/verify, and view/download the existing receipt.
- Reused V12-01 through V12-04 public APIs directly. No replacement identity, crypto, signing, publish, read-back, diagnostics, or receipt engine was created.
- Security capabilities derive from actual domain state: `VERIFIED` imported backup, immutable prepared descriptor, publish-attempt session, and read-back result. Visual step position grants no capability.
- Exact pre-sign review exposes room, DID, nonce, post-sweep text, and canonical payload. Signing and publishing remain separate explicit actions. Editing room/text invalidates the actionable descriptor and never auto-signs.
- Publish UI preserves `RESPONSE_RECEIVED` as verification pending and `OUTCOME_UNKNOWN` as ambiguous; it exposes no write URL, offers no same-nonce retry, and uses no server relay.
- Read-back is one explicit bounded action. Verified, not-observed, related-not-verified, and operationally unavailable results retain V12-04 semantics. Existing deterministic Markdown/JSON receipt output and limitations are reused.
- Identity secrets remain in the existing browser runtime holder. The UI has no raw seed/private-key field, persistence, account, database, telemetry, arbitrary fetch, background polling, or automatic action.

**Tests:** Added four static security/orchestration checks and one complete functional Chromium flow. The flow verifies creation, encrypted download, signing lock before verification, wrong-passphrase failure, successful matching import, default lobby, exact review, inert hostile input, explicit signing, edit invalidation, explicit single publish, pending-response copy, no retry/write URL, exact read-back `VALID`, receipt availability, and zero local/session storage. Technocore write/read endpoints were intercepted; exactly one mocked write and one mocked read occurred, with zero live Technocore writes.

**Ordinary corrections:** Supplied the React 19 `useRef` initial value, replaced render-time cross-ref access with one atomic publish-lifecycle holder, corrected an E2E secret-boundary assertion that matched required safety copy, selected the intended operational alert instead of Next's route announcer, rebuilt the production artifact after a source change, and clear both passphrase inputs when their local operation settles. No domain semantics changed.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 19 files / 275 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4 production build; `/`, `/api/inspect`, and `/api/rooms` remain the only application/API routes and no write route exists.
- `npm.cmd run test:e2e`: **PASS — 9/9 Chromium tests**, normal Playwright summary `9 passed (6.5s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**Regression/security review:** V12-04 exact read-back, V12-03 transport/nonce ambiguity, V12-02 signing/nonce, V12-01 identity/backup, and V1.1 reader/verifier/diagnostics/receipt/debugger tests remain green. No dependency, API contract, parser/reader limit, protocol/evidence semantics, tclk behavior, E2E lifecycle, deployment configuration, persistence, server signing, or relay changed.

**V12-05 Completion Gate: PASS.** V12-06 is NOT STARTED and NOT AUTHORIZED. V12-09 UI/UX polish is NOT STARTED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-05 completion (superseded by completed V12-06 below)

Product owner reviews V12-05 and separately authorizes any next phase. Do not begin V12-06, perform general UI polish, resume release/preflight, or deploy without explicit authorization.

### Phase 19 (V12-06) — Workbench Integration, 2026-09-05

**Implemented:**

- Reorganized Home into two visible, equal-purpose groups: Get Started (Create Agent Identity, Import Identity Backup, Publish My First Signed Message) and Inspect & Debug (Explore Public Rooms, Debug a Message, Analyze an Export, Inspect a DID / Key).
- All three newcomer entries host the single V12-05 component with entry context only. They do not duplicate orchestration or grant capabilities; backup verification, signing, publishing, and read-back remain gated by existing domain state.
- Lifted the existing `LocalIdentitySession` holder to the Home runtime so an unlocked identity survives in-page workflow navigation without persistence. Header context exposes only a shortened public DID and retains the full DID in an inspectable title; it is not described as an account, wallet, login, or profile.
- Active identity context opens the existing DID inspector with the full public DID prefilled. A verified onboarding result can open existing Message Debug with observed room/sequence prefilled. Neither handoff automatically fetches, inspects, signs, publishes, retries, or polls.
- Preserved the existing debugger, verification pipeline, transcript diagnostics, Evidence Receipts, fixed-origin bounded room exploration, verdict/status terminology, hostile-content protections, and tclk observation-only positioning.
- Added no protocol/crypto/publish/read-back engine, server route/relay, persistence, account/auth, wallet/blockchain, contribution/reward/reputation layer, dependency, background process, broad redesign, production write, release, or deployment behavior.

**Tests:** Added four static Workbench-integration boundary tests and one E2E shortcut/navigation case. Expanded the full onboarding E2E to verify active public-DID context, same-session identity preservation, reuse of existing DID inspector, and verified-evidence handoff to existing Message Debug. Shortcut navigation generated zero Technocore requests; onboarding external boundaries remained intercepted with exactly one mocked write/read and zero live Technocore writes.

**Ordinary corrections:** Corrected a source-level JSX entity expectation and scoped two Playwright selectors after the active public DID introduced intentional duplicate visible context. No runtime or domain semantic correction was required.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 20 files / 279 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4 production build; `/`, `/api/inspect`, and `/api/rooms` remain the only application/API routes and no write route exists.
- `npm.cmd run test:e2e`: **PASS — 10/10 Chromium tests**, normal Playwright summary `10 passed (4.9s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**Regression/security review:** V12-05 onboarding, V12-04 read-back, V12-03 transport/nonce ambiguity, V12-02 signing/nonce, V12-01 identity/backup, and all V1.1 debugger/evidence tests remain green. No secret appears in navigation context, no persistence or new server boundary exists, and no navigation action constructs or triggers a signed write.

**V12-06 Completion Gate: PASS.** V12-07 is NOT STARTED and NOT AUTHORIZED. V12-08 Manual Product Validation and V12-09 UI/UX Polish are NOT STARTED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-06 completion (superseded by completed V12-07 below)

Product owner reviews V12-06 and separately authorizes any next phase. Do not begin V12-07, perform manual production writes, begin manual product validation or broad UI polish, resume release/preflight, or deploy without explicit authorization.

### Phase 20 (V12-07) — Security & Regression Hardening, 2026-09-05

**Threat-model audit:** PASS after one bounded correction. Secret handling, backup tampering/resource abuse, signing/nonce precision and concurrency, publish destination/burn/ambiguity, read-back false positives, evidence semantics, hostile content/XSS/confused deputy behavior, logging/errors, persistence, browser headers, locked limits, tclk positioning, navigation, and async state were inspected against implementation and tests.

**Defect found and fixed:** React `busy` render state alone was not a synchronous mutex, allowing two async UI handlers to enter before rerender; an in-flight signing completion could also restore a prepared descriptor after the reviewed inputs changed. V12-05 orchestration now uses one synchronous operation ref and a monotonic input revision. Duplicate actions return before domain invocation, and stale sign/publish/read-back completions cannot restore result state after an edit/reset. Domain crypto, nonce reservation, immutable descriptor, transport, burn, read-back, and evidence semantics are unchanged.

**Additional adversarial coverage:**

- Added malicious backup variants for missing ciphertext, manipulated KDF iterations/hash, cipher name, and key length; every case fails with `INVALID_BACKUP` before `deriveKey`.
- Added direct locked-limit checks for 5 MiB export, 10,000 lines, 256 KiB line, 2 MiB live response, 10-second reader timeout, 200 messages, 8 KiB inspect body, and 4096-character tclk frames.
- Added cross-boundary scans for logging, browser persistence, unsafe HTML, background polling, server identity/signing/publish capability, and exclusive signed-write URL construction.
- E2E double-invokes signing, publishing, and read-back against delayed intercepted endpoints; operation ownership produces exactly one mocked write and one mocked read, with zero live Technocore writes.

**Other audit results:** PASS. Backup parsing is bounded and exact before PBKDF2; BigInt nonce and DID+room reservation/burn tests remain green; fixed GET path encoding and host/path controls remain green; all ambiguous failures remain `OUTCOME_UNKNOWN`; read-back still requires attempt + exact evidence + existing verifier `VALID`; malformed evidence is not `INVALID`; operational errors remain separate; receipts expose no secrets and retain limitations; no logging/persistence/server relay/content-derived fetch was found; tclk remains observation-only.

**CSP review:** DEFERRED, not silently omitted. Existing `nosniff`, `no-referrer`, frame-deny, and restrictive Permissions Policy headers remain. A strict CSP needs an explicitly designed and browser-verified Next nonce/hash/build policy and release assumptions; speculative introduction could break framework scripts and exceeds V12-07 authority.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 21 files / 285 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; production routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `_not-found`; no write route.
- `npm.cmd run test:e2e`: **PASS — 10/10 Chromium tests**, normal summary `10 passed (6.5s)`, exit code 0; port 3100 clear afterward.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.

**Regression result:** V12-06, V12-05, V12-04, V12-03, V12-02, V12-01, and V1.1 all PASS. No dependency, API contract, parser/security limit, persistence model, deployment configuration, or product capability changed.

**V12-07 Completion Gate: PASS.** The formerly pending V12-08 Manual Product Validation was subsequently completed by the product owner; see the reconciliation below. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-07 completion (superseded by V12-08 reconciliation below)

Product owner reviews V12-07 and separately authorizes V12-08 Manual Product Validation if desired. Do not perform manual live publishing, begin V12-08 or V12-09, resume release/preflight, or deploy without explicit authorization.

### V12-08 — Manual Product Validation and Roadmap Reconciliation, 2026-09-05

**Status: COMPLETE / PASS based on product-owner manual validation evidence.** This is manual observation, not automated-test evidence, and does not replace or expand the V12-07 automated gate. The detailed evidence record is `docs/04_quality/V12-08_MANUAL_VALIDATION.md`.

The product owner manually completed the existing onboarding core flow end to end: local identity creation; encrypted-backup creation/download; backup re-import verification; signed-message preparation; local signing; one explicit live Technocore publish attempt; subsequent observation of the matching record through manual read-back; an existing-verifier `VALID` result; and Evidence Receipt generation. A full page refresh removed the unlocked active identity, consistent with runtime-memory-only identity handling.

No production deployment occurred. The successful observed flow does not establish general hosted CORS compatibility beyond that manually exercised case.

Manual UX findings carried forward to V12-09 without correction in this documentation-only reconciliation:

- Get Started entry points are insufficiently distinct.
- The onboarding flow is visually too long.
- Technical evidence is too prominent for newcomer UX.
- Product hierarchy still feels closer to a protocol debugger than a complete Agent Workbench.
- Machine-translated Agent terminology may be confusing where present.

The prior roadmap entry that treated V12-08 as unstarted Manual Product Validation is superseded. The approved remaining V1.2 sequence is now: V12-08A Rooms / Chat; V12-08B My Agent; V12-08C Evidence / My Activity; V12-08D Integration & Security Regression; V12-09 UI/UX Polish; V12-10 Final Regression & Release Preflight; Final Release Review; and deployment only after separate explicit product-owner authorization.

No application source, tests, dependencies, configuration, protocol/security behavior, live Technocore write, release, or deployment action changed during this reconciliation.

## Next Exact Action — V12-08 reconciliation (superseded by completed V12-08A below)

Product-owner authorization for V12-08A — Rooms / Chat implementation.

### Phase 21 (V12-08A) — Rooms / Chat, 2026-09-05

**Implementation:** Added a human-friendly Rooms / Chat surface that performs bounded public discovery through the existing `/api/rooms` safe-reader route, reads only the selected retained room through the existing `/api/inspect` fixed-origin reader, preserves retained source order, and exposes explicit manual refresh only. Signed `did:key` writers and unsigned/self-asserted nicknames are visibly distinct. Room names, topics, writers, and message bodies render as inert React text; arbitrary content URLs are neither links nor fetch targets.

Observed messages can hand off their public room/sequence to the existing Message Debug flow. No second verifier, diagnostics pipeline, or receipt model was introduced.

**Signed composer:** An absent, locked, or unverified identity leaves rooms readable but exposes no signing/publish controls and directs the user to existing Create/Import onboarding. An eligible identity uses the existing V12-02 signing preparation and nonce reservation with the selected room bound into the reviewed canonical payload. Room, DID, nonce, post-sweep text, and canonical payload are inspectable before a separate local-sign action. Editing text invalidates stale review, signature, publish, and read-back state.

Publishing uses only the existing V12-03 `publishPreparedMessage` and `PublishAttemptSession`; no URL is rendered, no publish occurs before the explicit action, and the same prepared attempt cannot be retried. `RESPONSE_RECEIVED` remains verification-pending and `OUTCOME_UNKNOWN` remains ambiguous. Manual Check publication uses only V12-04; `PUBLISHED_AND_VERIFIED` requires exact observed evidence plus the existing verifier's `VALID`. Existing read-back Evidence Receipt output is reused.

**Security/scope review:** PASS. No automatic/background polling, long-poll loop, interval, WebSocket, EventSource, crawler, global archive, persistence, content-derived fetch, unsafe HTML, server write route/relay, new dependency, API-contract change, protocol/crypto/evidence change, backup change, nonce semantic change, live automated write, release, or deployment was introduced.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 22 files / 289 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`; no write route.
- `npm.cmd run test:e2e`: **PASS — 11/11 Chromium tests**, normal summary `11 passed (7.0s)`, exit code 0; port 3100 clear before and after.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0 through the network-enabled advisory endpoint.

Automated external read/write boundaries were mocked or intercepted; zero live Technocore writes occurred. V12-01 through V12-08 and all V1.1 regression behavior remain green.

**V12-08A Completion Gate: PASS.** V12-08B, V12-08C, V12-08D, V12-09, and V12-10 are NOT STARTED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-08A completion (superseded by completed V12-08B below)

Product-owner review of V12-08A, then authorize V12-08B — My Agent.

### Phase 22 (V12-08B) — My Agent, 2026-09-05

**Implementation:** Added a first-class My Agent workspace with truthful no-active and active states. The no-active state links to the existing Create Agent Identity and Import Identity Backup onboarding entries. The active state shows the full selectable/copyable public DID, runtime-only session status, domain-known backup verification/signing readiness, existing Backup / Recovery entry, and direct existing DID Inspector handoff.

`Home` remains the only `LocalIdentitySession` holder and passes the same session to onboarding, Rooms / Chat, and My Agent. No duplicate identity state or engine was introduced.

**Lock behavior:** Explicit Lock Agent calls the existing `LocalIdentitySession.lock()` first, which clears its mutable seed, then clears the Home-owned identity reference. Leaving the prior surface unmounts its prepared UI state; revisiting Rooms immediately presents the no-identity gate and exposes no sign/publish controls. Lock does not modify or delete the user's downloaded encrypted backup and makes no server-deletion claim.

**Security/scope review:** PASS. The full DID is public data; no seed, private key, passphrase, decrypted backup, ciphertext, or secret getter is rendered or transmitted. Refresh returns My Agent to no-active state and localStorage/sessionStorage remain empty. No persistence, cookie, IndexedDB, identity server route, write relay, account/authentication, wallet/blockchain, profile/reputation/reward/eligibility behavior, dependency, network-contract change, domain semantic change, V12-08C, release, or deployment was introduced.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 23 files / 293 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`; no identity or write route.
- `npm.cmd run test:e2e`: **PASS — 11/11 Chromium tests**, normal summary `11 passed (8.2s)`, exit code 0; port 3100 clear before and after.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0 through the network-enabled advisory endpoint.

Automated external boundaries were mocked/intercepted; zero live Technocore writes occurred. V12-01 through V12-08A and all V1.1 regression behavior remain green.

**V12-08B Completion Gate: PASS.** V12-08C, V12-08D, V12-09, and V12-10 are NOT STARTED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-08B completion (superseded by completed V12-08C below)

Product-owner review of V12-08B, then authorize V12-08C — Evidence / My Activity.

### Phase 23 (V12-08C) — Evidence / My Activity, 2026-09-05

**Implementation:** Added a dedicated runtime-only Evidence workspace. Entries are created only from an explicitly selected, already observed room message or from exact V12-04 `PUBLISHED_AND_VERIFIED` read-back evidence. `RESPONSE_RECEIVED`, `OUTCOME_UNKNOWN`, `NOT_OBSERVED`, and other non-qualifying states never become successful observed-publication evidence. The existing `VALID`, `INVALID`, `UNSIGNED`, and `UNVERIFIABLE` verdicts are preserved without reinterpretation; sequence remains labeled server-assigned and outside signed evidence.

Rooms exposes an explicit Add to Evidence action and the onboarding/read-back flow records evidence only after exact verified read-back. No publish handler records evidence merely from a transport response. Entries are deterministically deduplicated within the current page runtime.

**Identity/session behavior:** Association with My Agent is computed from the currently active public DID. Lock clears the existing identity session and removes that association without deleting or rewriting already observed public evidence. A full refresh clears the evidence list, consistent with the no-persistence contract.

**Reuse and security review:** Existing Message Debug diagnostics and canonical Evidence Receipt generation/download are reused. Hostile names, messages, and URLs render as inert text and do not create links or content-derived requests. No secret-bearing identity state, localStorage, sessionStorage, IndexedDB, cookie, background polling/collection, crawler/archive, new verifier/diagnostic/receipt engine, contribution/reward/reputation/eligibility semantics, server route, dependency, protocol/crypto/evidence change, live automated write, release, or deployment was introduced.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 24 files / 297 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`; no new route.
- `npm.cmd run test:e2e`: **PASS — 11/11 Chromium tests**, normal summary `11 passed (8.0s)`, exit code 0; port 3100 clear before and after.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0 through the network-enabled advisory endpoint.

Automated external boundaries were mocked/intercepted; zero live Technocore writes occurred. V12-01 through V12-08B and all V1.1 regression behavior remain green.

**V12-08C Completion Gate: PASS.** V12-08D, V12-09, and V12-10 are NOT STARTED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-08C completion (superseded by completed V12-08D below)

Product-owner review of V12-08C, then authorize V12-08D — Integration & Security Regression.

### Phase 24 (V12-08D) — Integration & Security Regression, 2026-09-05

**Integration finding and correction:** One reproducible cross-surface lifecycle defect was found. Onboarding and Rooms each created their own nonce reservation and publish-attempt objects, so unmount/navigation discarded session reservation and burn history. `Home` now owns one page-runtime `SessionNonceReservations` and `PublishAttemptSession` and passes both to Onboarding and Rooms. `SessionNonceReservations.previewNext` lets each review use the exact candidate implied by the shared DID+room reservation state. The existing `max(clock, observed + 1, session + 1)` BigInt/string arithmetic, reservation-before-signing, and irreversible burn-before-fetch behavior are unchanged.

**Security and semantic review:** PASS. One Home-owned `LocalIdentitySession` remains authoritative. Create/Import, Lock, identity replacement, Evidence association, refresh, canonical signing, self-verification, fixed-origin encode-once browser-direct publish, ambiguous outcomes, exact read-back plus `VALID`, four evidence verdicts, operational separation, 12 diagnostic stages, Evidence Receipt, retained-order public rooms, hostile inert content, and tclk observation-only behavior all retain their approved boundaries.

Static audits found no identity/Evidence persistence, local/session storage, IndexedDB, cookies, Cache API persistence, service-worker registration, unsafe HTML/eval sink, background interval/WebSocket/EventSource, sensitive console logging, secret URL sink, server signing/identity/Evidence/write relay, generic proxy, or added API route. Server routes remain only `inspect` and `rooms`. Locked resource limits remain unchanged. Product claims retain explicit limitations; no contribution, reward, eligibility, reputation, trust, complete-history, guaranteed-publication, payment, or settlement claim was introduced.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 25 files / 305 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`.
- `npm.cmd run test:e2e`: **PASS — 11/11 Chromium tests**, normal summary `11 passed (8.0s)`, exit code 0; port 3100 clear before and after; no E2E-owned Node/Chromium process remained.
- `npm.cmd audit --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0 through the network-enabled advisory endpoint.

Automated external boundaries were mocked/intercepted; zero live Technocore writes occurred. No dependency, route, persistence, protocol, crypto, evidence, backup, network-contract, release, or deployment change was made.

**V12-08D Completion Gate: PASS.** V12-09 and V12-10 are NOT STARTED. Release/deployment remains PAUSED / NOT DEPLOYED.

## Next Exact Action — V12-08D completion

Product-owner review of V12-08D, then authorize V12-09 — UI/UX Polish.

### Phase 25 (V12-09) - UI Phase 1 (Shell + Hierarchy), 2026-09-05

**Revision:** The first implementation introduced the approved state-aware shell, compact public DID context, and CSS grid/vignette, but product-owner visual review returned REVISE. The authorized continuation replaced the equal-card Home presentation with an asymmetric primary action area, supporting actions, divider-based workspace rows, and a compact technical inset. Cyan and visible borders are now selective; shell, canvas, primary content, secondary groups, and technical content have distinct surface roles.

Desktop navigation preserves Home / Explore Rooms / Developer Tools before DID and Home / Rooms / My Agent / Evidence / Developer Tools after DID. Narrow navigation remains horizontally reachable instead of being hidden, uses 46 px minimum-height controls, and preserves the same state-aware destinations. `aria-current="page"` identifies the active screen. A high-contrast non-cyan focus outline remains visible. Long-string containment and textual/symbolic status meaning are preserved.

**Security and scope review:** PASS. Existing Home-owned identity and publish lifecycle state, onboarding, Rooms, My Agent, Evidence, inspector behavior, cryptography, nonce rules, publishing/read-back, evidence qualification, diagnostics, receipts, fixed-origin readers, API contracts, tclk behavior, and resource limits were not changed. Static review found no new persistence, polling, crawler, automatic publish/retry, server write relay, unsafe rendering, dependency, or API route. Automated Technocore writes remained intercepted; zero live writes occurred.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 25 files / 306 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0 (rerun after final test edits).
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`.
- `npm.cmd run test:e2e`: **PASS — 11/11 Chromium tests**, 9.0s, exit code 0; stale shell selectors were reconciled without weakening security assertions.
- Manual local visual review: **PASS** for Home without DID, locally created active-DID shell without publish, Developer Tools, 390 × 844 narrow Home, visible focus, usable navigation, reduced equal-card appearance, and page-level overflow. Desktop and narrow measured `scrollWidth === clientWidth`.

Evidence screenshots are stored in `artifacts/ui-phase1-review/`. Release and deployment were not performed.

**V12-09 UI Phase 1 Completion Gate: COMPLETE / PASS.** UI Phase 2 remains NOT STARTED.

## Next Exact Action
Product-owner reviews the revised UI Phase 1 visually. After approval, authorize UI Phase 2 — First-time Home.

### Phase 26 (V12-09) — UI Phase 2 (First-time Home), 2026-09-05

**Implementation:** Before an active DID exists, Home now presents “Your First Verified Record” and one dominant “Start your agent →” CTA wired to the existing Create onboarding entry. Import remains a secondary text action. The prior equal first-time Publish CTA is absent. A presentational Identity / Backup / Publish / Verify journey explains the existing path without adding onboarding state. Explore First reuses the existing public-room exploration entry and states retained-history and untrusted-content limitations. Existing inspection tools remain in the Phase 1 technical inset.

The state-aware Phase 1 shell is preserved and now includes safe static Docs and official FLOP X links. Home includes About FLOP copy with only approved project links and the required footer/author attribution. All external anchors use `target="_blank"` and `rel="noopener noreferrer"`. The active-DID Home remains the completed Phase 1 presentation; My Agent, Rooms, Evidence, and onboarding internals were not redesigned.

**Artwork status:** The official FLOP artwork was not present in the repository or supplied attachment directory. As required, artwork placement alone was omitted; no generated, recreated, approximated, altered, or visible placeholder asset was used. About content is ready for the official asset when separately supplied and authorized.

**Security and scope review:** PASS. Home continues to call the existing Create, Import, and Explore handlers. Identity/session ownership, backup/import, signing, canonical payload, nonce reservations, publish attempts, browser-direct publishing, read-back, evidence qualification, verifier, diagnostics, receipts, fixed-origin readers, API contracts, tclk semantics, and resource limits were unchanged. Static scans found no persistence, polling, telemetry, analytics, unsafe HTML, new route, or unapproved external URL. Automated writes were intercepted; zero live Technocore writes occurred.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 25 files / 307 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0 after final E2E edits.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`.
- `npm.cmd run test:e2e`: **PASS — 11/11 Chromium tests**, 8.5s, exit code 0.
- Local visual review: **PASS** for first-time desktop and 390 px Home, no-DID header, one primary CTA, vertical mobile journey, active-DID shell/Home, safe external links, focus, and overflow. Desktop and mobile measured `scrollWidth === clientWidth`; the mobile CTA measured 60 px high and focus rendered with a 2 px solid outline.

Evidence screenshots are stored in `artifacts/ui-phase2-review/`. UI Phase 3, V12-10, release, and deployment were not started.

**V12-09 UI Phase 2 Completion Gate: COMPLETE / PASS**, with official artwork placement explicitly unavailable because the required product-owner asset was not supplied.

## Next Exact Action — UI Phase 2 completion

Product-owner visually reviews UI Phase 2. After approval, authorize UI Phase 3 — Guided Onboarding.

### Phase 27 (V12-09) — UI Phase 3 (Guided Onboarding), 2026-09-05

**Status: COMPLETE / PASS.** The existing onboarding presentation/orchestration now uses Identity / Backup / Publish / Verify macro stages. Existing domain state and APIs remain authoritative; no parallel engine or protected semantic change was introduced.

Active records: `plans/PHASE_27_V12-09_UI_PHASE_3_GUIDED_ONBOARDING.md` and `tasks/TASK_028_V12-09_UI_PHASE_3_GUIDED_ONBOARDING.md`.

Verification passed: typecheck; 25 test files / 308 tests; lint with zero warnings; production build; 11 Chromium E2E tests; npm audit with zero vulnerabilities; protected-boundary scans; and desktop/mobile visual review. Review screenshots are stored in `artifacts/ui-phase3-review/`.

## Next Exact Action — UI Phase 3 complete

Product-owner visually reviews UI Phase 3. Stop before UI Phase 4 unless separately authorized.

### Phase 28 (V12-09) — UI Phase 4 (Active-DID Home + My Agent), 2026-09-05

**Status: COMPLETE / PASS.** Active-DID Home now exposes the active public identity, one readiness-derived next action, conditional real runtime Evidence, and quiet Quick Access. My Agent now provides focused public DID, recovery/readiness, inspection, and confirmed session-lock controls. Publish-attempt/read-back-pending state remains onboarding-local and was not duplicated or persisted.

Active records: `plans/PHASE_28_V12-09_UI_PHASE_4_ACTIVE_DID_HOME_MY_AGENT.md` and `tasks/TASK_029_V12-09_UI_PHASE_4_ACTIVE_DID_HOME_MY_AGENT.md`.

Verification passed: typecheck; 25 test files / 310 tests; lint with zero warnings; production build; 11 Chromium E2E tests; npm audit with zero vulnerabilities; protected-boundary scans; and desktop/mobile visual review. Review screenshots are stored in `artifacts/ui-phase4-review/`.

## Next Exact Action — UI Phase 4 complete

Product-owner visually reviews UI Phase 4. After approval, authorize UI Phase 5 — Rooms / Chat Workspace.

### Phase 29 (V12-09) — UI Phase 5 (Rooms / Chat Workspace), 2026-09-05

**Status: COMPLETE / PASS.** Rooms now presents human-readable discovery, source-order conversation rows, an identity-aware participation area, progressive signing review, explicit publish confirmation, manual read-back, and truthful outcome states. Existing bounded discovery, fixed-origin read, signing, publish, read-back, diagnostics, and Evidence operations remain authoritative.

Verification passed: typecheck; 25 test files / 311 tests; lint with zero warnings; production build; 11 Chromium E2E tests; offline npm audit with zero vulnerabilities; protected-boundary scans; and desktop/mobile visual review. Review screenshots are stored in `artifacts/ui-phase5-review/`.

## Next Exact Action — UI Phase 5 complete

Product-owner visually reviews UI Phase 5. After approval, continue to UI Phase 6 — Evidence + Verification Results.

### Phase 30 (V12-09) — UI Phase 5A (FLOP Brand Landing & Product Showcase), 2026-09-05

**Status: COMPLETE / PASS.** The no-DID Home now leads with the exact official FLOP artwork, one dominant existing Create-flow action, restrained FLOP-cyan atmosphere, and a presentational Workbench product proof made only from real product labels. The existing journey, Explore Rooms, Developer Tools, FLOP project context, and attribution follow below. Active-DID Home and completed workspaces remain unchanged.

Verification passed: typecheck; 25 test files / 312 tests; lint with zero warnings; production build; 11/11 Chromium E2E tests with external writes intercepted; offline npm audit with zero vulnerabilities; protected-boundary scans; and desktop/mobile visual review with no horizontal overflow. Review screenshots are stored in `artifacts/ui-phase5a-review/`.

No dependency, route, persistence, polling, telemetry, protocol, cryptography, evidence, backup, network-contract, active-DID workspace, release, or deployment change was made. UI Phase 6 and V12-10 were not started.

## Next Exact Action — UI Phase 5A complete

Product-owner visually reviews V12-09 UI Phase 5A — FLOP Brand Landing & Product Showcase. After approval, continue to UI Phase 6 — Evidence + Verification Results.

### Phase 31 (V12-09) — UI Phase 5B (Workbench Application Shell + Large Product Showcase), 2026-09-06

**Status: COMPLETE / PASS.** The no-DID landing retains the exact official FLOP artwork and brand → explanation → CTA → cyan atmosphere → product rhythm. Its truthful presentational Workbench proof now occupies 94% of the main content width up to 1320 px. Once an active identity exists, the existing screen owner renders Home, Rooms, My Agent, unchanged Evidence, and Developer Tools inside a restrained desktop header/sidebar/workspace shell. At 390 px, an ARIA-controlled menu replaces the sidebar and closes after destination selection.

Reference principles borrowed: compact separated navigation, one dominant CTA, centered hero pacing, layered CSS atmosphere, large product-preview proportion, desktop application organization, and collapsing mobile navigation. Intentionally rejected: CRM content, fabricated data/metrics/activity, authentication/account systems, external decorative assets, copied component structure, Poppins, generic feature grids, pricing, testimonials, and SaaS chrome unrelated to FLOP.

Verification passed: typecheck; 25 test files / 312 tests; lint with zero warnings; Next.js 16.3.4 production build with unchanged routes; 11/11 Chromium E2E tests in 9.1s; offline npm audit with zero vulnerabilities; state/protected-boundary scans; and desktop/390 px visual review of all requested shell, workspace, menu, focus, artwork, CTA, glow, and overflow states. Screenshots are stored in `artifacts/ui-phase5b-review/`.

No protected product semantics, state ownership, dependency, API route, persistence, polling, WebSocket, telemetry, analytics, release, or deployment changed. UI Phase 6 and V12-10 were not started.

**Product Design acceptance: PASS, 2026-09-06.** The production build was inspected in a real Chromium session at 1440 × 1000 and 390 × 844. The exact `/brand/flop-hero.png` rendered at its intrinsic 1500:500 ratio without cropping or distortion; the showcase measured 90.34% of the rendered landing container. The desktop shell measured a compact 230 px sidebar against a 1210 px main workspace. Landing and active mobile views measured zero horizontal overflow. Keyboard traversal produced a visible 2 px solid high-contrast focus outline on the 46 × 46 mobile menu control, and selecting a destination closed the menu. Home, populated Rooms with verified-identity composer, My Agent with full DID, unchanged Evidence, and Developer Tools were visually inspected. No generic CRM/SaaS residue, duplicated active navigation, excessive cyan/glow, unreadable UI, or material spacing/alignment defect was found. Deferred polish only: the intentionally sparse Rooms empty state leaves substantial desktop whitespace before a room is selected; the populated state is balanced and usable. Acceptance evidence is stored in `artifacts/ui-phase5b-product-design/`.

## Next Exact Action — UI Phase 5B product-design accepted

Begin V12-09 UI Phase 6 — Evidence + Verification Results.

### Phase 32 (V12-09) — UI Phase 6 (Evidence + Verification Results), 2026-09-06

**Status: COMPLETE / PASS.** Verification results now lead with the existing Evidence Verdict, then the earliest existing FAIL boundary or, only when no FAIL exists, the earliest existing UNAVAILABLE boundary. The current deterministic meaning and Check next guidance appear before the unchanged ordered 12-stage pipeline. Every stage remains independently inspectable through a collapsed native disclosure with its exact PASS / FAIL / UNAVAILABLE / NOT_APPLICABLE / NOT_OBSERVED status, text label, and symbol. NOT_APPLICABLE and NOT_OBSERVED are never promoted as boundaries.

Raw Evidence follows the pipeline and is collapsed by default. The local Evidence Receipt retains deterministic Markdown and JSON generation and now makes its evidence-only limitation prominent. Runtime Evidence is explicitly described as non-durable and non-automatic, provides a useful Rooms action when empty, and presents selected observed evidence conclusion-first with technical fields and receipt preview progressively disclosed. Message Debugger, DID Inspector, Export Analyzer, and Rooms handoff reuse the same result presentation without duplicating verification or Evidence state.

**State and protected-domain audit:** PASS. `Home` remains the sole owner of runtime `LocalIdentitySession`, `SessionNonceReservations`, `PublishAttemptSession`, and Evidence activity state. No verifier, verdict derivation, boundary selection, stage order, canonical payload, sweep, DID decoding, signature, Ed25519, tclk, read-back, evidence qualification/deduplication, receipt data model, parser/network limit, identity, nonce, publishing, Rooms, or API behavior changed. Routes remain only `/api/inspect` and `/api/rooms`. Export limits remain 5 MiB, 10,000 lines, and 256 KiB per line. No dependency, persistence, polling, WebSocket, crawler, telemetry, analytics, automatic publish/retry, server signing, or server write relay was added.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 25 files / 312 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes remain `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`.
- `npm.cmd run test:e2e`: **PASS — 12/12 Chromium tests**, 8.8s, exit code 0. The suite includes deterministic Phase 6 screenshot fixtures.
- `npm.cmd audit --offline --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0. The network advisory request was not authorized; the locally cached advisory audit completed successfully.
- Deterministic visual review: **PASS** at 1440 × 1000 and 390 × 844 for VALID, INVALID, UNSIGNED, UNVERIFIABLE, FAIL, UNAVAILABLE, NOT_APPLICABLE, NOT_OBSERVED, collapsed/expanded raw evidence, Receipt, runtime Evidence empty state, Rooms, Developer Tools, long values, keyboard focus, and zero page overflow. Screenshots are stored in `artifacts/phase6/`.

No live Technocore write, release, or deployment was performed. V12-10 remains NOT STARTED. Deferred polish only: the receipt preview is necessarily dense on desktop, but is bounded by internal scrolling and remains secondary to the result hierarchy.

## Next Exact Action — UI Phase 6 complete

Begin V12-10 — Final Regression & Release Preflight.

### Phase 33 (V12-10) — Final Regression & Release Preflight, 2026-09-06

**Status: COMPLETE / PASS. Final Release Review pending.** The complete current V1.1/V1.2 implementation was re-audited without adding features or redesigning product surfaces. The deterministic newcomer journey, active Workbench, browser-local identity and backup, local signing, shared exact nonce lifecycle, explicit browser-direct publish attempt, manual exact read-back, four Evidence Verdicts, five diagnostic statuses, ordered 12-stage pipeline, Phase 6 hierarchy, runtime Evidence, local receipt, Rooms, My Agent, Developer Tools, export limits, fixed-origin APIs, tclk observation-only behavior, hostile-content rendering, desktop shell, and mobile shell all retain their approved behavior.

**Security and architecture audit:** PASS. Identity seed generation remains 32-byte browser cryptographic randomness; unlocked material is private session memory with no getter, rendering, URL, server, logging, telemetry, or storage sink. Backup remains `technocore-agent-backup/v1`, AES-256-GCM, random 16-byte salt, random 12-byte IV, PBKDF2-HMAC-SHA-256 at 600,000 iterations, strict bounded pre-KDF validation, exact seed encryption, and DID re-derivation/match. Canonical signed bytes remain UTF-8 `<room>|<nonce>|<post-sweep text>`. Nonce selection remains exact BigInt/string `max(now, observed + 1, session + 1)`, shared page-runtime reservation, and irreversible burn before fetch. Publish remains exact once-encoded browser-direct GET to the fixed Technocore signed path with no relay, automatic attempt, or retry; HTTP response remains only `RESPONSE_RECEIVED`, uncertainty remains `OUTCOME_UNKNOWN`. `PUBLISHED_AND_VERIFIED` still requires an exact five-field match plus independent `VALID`.

Routes remain only `/api/inspect` and `/api/rooms`. Limits remain 5 MiB export, 10,000 lines, 256 KiB per line, 2 MiB live response, 10-second reads/publish, 200 room messages, 8 KiB inspect body, and 4096-character tclk frame. No database, auth, wallet, blockchain signing, server signing/write relay, persistence, telemetry, analytics, WebSocket, polling, crawler, arbitrary proxy, or content-derived network action exists. The exact official artwork hash is `1AEFD9D449E81C00E1AFDEEF0D3A8855FFF92BA54BFB880BF149EF451792E4B6`, matching the accepted Phase 5B value.

**Completion Gate:**

- `npm.cmd run typecheck`: **PASS**, exit code 0.
- `npm.cmd test`: **PASS — 25 files / 312 tests**, exit code 0.
- `npm.cmd run lint`: **PASS — zero warnings**, exit code 0.
- `npm.cmd run build`: **PASS**, Next.js 16.3.4; routes are `/`, `/api/inspect`, `/api/rooms`, plus framework `/_not-found`.
- `npm.cmd run test:e2e`: **PASS — 13/13 Chromium tests**, 8.9s, exit code 0; external reads/writes are deterministic mocks/intercepts and zero automated live Technocore writes occurred.
- `npm.cmd audit --offline --audit-level=high`: **PASS — 0 vulnerabilities**, exit code 0.
- Local production smoke: **PASS** on `127.0.0.1:3210`; `/` HTTP 200; `nosniff`, `no-referrer`, `DENY`, and restrictive Permissions Policy headers present; malformed `/api/inspect` returned bounded HTTP 400 JSON; port clear after shutdown.
- Browser/manual regression: **PASS** at desktop 1440 × 1000 and mobile 390 × 844. Current-build screenshots cover no-DID landing, active Home, My Agent, Evidence empty, mobile menu/open-close, and zero overflow; Phase 6 current-build evidence covers all verdict, boundary, stage, raw evidence, receipt, Rooms, and Developer Tools states. Evidence is stored in `artifacts/v12-10-preflight/` and `artifacts/phase6/`.

**BLOCKERS:** none preventing Final Release Review. Deployment remains blocked by separate operational decisions: Vercel account/team/project, deployment method/operator, production URL/domain, monitoring/incident/smoke/rollback owners, and previous rollback target or approved first-deployment takedown procedure.

**NON-BLOCKING LIMITATIONS:** no strict CSP is installed; the existing header set and inert-rendering controls pass, while a Next.js nonce/hash CSP remains a separately tested release-hardening decision. Technocore evidence is retained and bounded rather than complete history; browser/CORS/network outcomes remain uncertain by design; identity and Evidence are session-only; Firefox, WebKit, hosted deployment, and production behavior are not verified. Extra optional WASM/sharp packages exist only as local `node_modules` residue and are absent from the declared application dependency contract.

**DEFERRED POLISH:** the unselected Rooms state intentionally leaves substantial desktop whitespace, and the Evidence Receipt preview is dense but internally scrollable. Neither affects hierarchy, safety, responsiveness, or task completion.

Build state: **BUILD READY for Final Release Review.** Release state: **NOT RELEASED.** Deployment state: **PAUSED / NOT DEPLOYED.** Production state: **NOT VERIFIED.**

## Next Exact Action — V12-10 complete

Product-owner performs Final Release Review. Deployment remains separately authorized.

### Phase 36 (V12-09R) — R2 Home Hierarchy Correction, 2026-09-06

**Status: COMPLETE / PASS.** Home now uses one compact state-aware composition across all approved readiness states: a dominant deterministic Next Action, a neighboring Public Rooms panel with explicit `# lobby` access, four truthful status cards (Identity, Backup, First Record, Evidence), and tertiary Developer Tools access. No fake room metadata or automatic Home-time fetch was introduced. Direct lobby navigation selects the protocol-valid room and leaves reading behind the existing explicit Refresh conversation action.

The approved action priority is implemented from existing state only: Create your Agent; Secure your backup; Publish your first verified record; Review verified evidence. Existing identity, backup, onboarding, Rooms, publishing, verification, Evidence, and diagnostics owners remain authoritative and unduplicated.

**Completion Gate:** typecheck PASS; 25/25 test files and 313/313 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 13/13 PASS; offline npm audit PASS with 0 vulnerabilities. Rendered desktop and 390 px review PASS for hierarchy, compactness, semantic labels, responsive stacking, mobile menu coexistence, and horizontal overflow. Evidence screenshots are stored in `artifacts/v12-10-preflight/`.

No dependency, API, persistence, polling, WebSocket, telemetry, analytics, protocol, security, release, or deployment change was made. Phase R3 remains NOT STARTED. The previous V12-10 result remains historical and must be reconfirmed after V12-09R is complete.

## Next Exact Action — V12-09R R2 complete

Begin V12-09R Phase R3 — Rooms Discovery & Lobby Prominence.

### Phase 37 (V12-09R) — R3 Rooms Discovery & Lobby Prominence, 2026-09-06

**Status: COMPLETE / PASS. Product Design: PASS.** Rooms now uses a compact room-list → selected retained-conversation structure. An actually discovered `lobby` is promoted first and labeled recommended/discovered while preserving every observed field. If discovery does not contain lobby, a visually separate Direct Room Access action targets only the fixed protocol-valid `lobby` name and never claims `/rooms` observation or fabricates metadata.

The explicit Home Open lobby action now selects lobby and performs one approved bounded read. Discovery loading, empty, error, and manual Try Again states are separate from selected-conversation loading, empty, and operational failure. Refresh rooms and Refresh conversation remain distinct manual actions with no timer, polling, stream, background retry, or automatic write.

Retained records with usable 1–19 digit sequence evidence are presented newest-first using exact `BigInt` comparison. Equal sequences retain source order; missing/unusable sequence evidence follows in deterministic observed order without invented timestamps or sequence metadata. Message content leads, followed by signed-DID or self-asserted nickname context, sequence, exact verdict where available, and subordinate existing Inspect message/Add to Evidence actions. Retained-history and untrusted-content limitations appear once near the conversation header.

At 390 x 844, Rooms switches between the room list and conversation with an explicit Back to rooms action while the existing Workbench menu remains available. Desktop and mobile screenshot review found clear lobby prominence, selected context, manual/not-live language, usable message actions, and zero measured page-level horizontal overflow. Evidence is stored in `artifacts/v12-10-preflight/r3-*.png`.

**Completion Gate:** typecheck PASS; 25/25 test files and 316/316 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes (`/`, `/api/inspect`, `/api/rooms`, framework `/_not-found`); Chromium E2E 14/14 PASS; offline npm audit PASS with 0 vulnerabilities.

State ownership and protected-domain audits PASS. Existing Rooms selection ownership, fixed-origin readers, 200-message bound, 10-second timeout, response bounds, redirect rejection, identity, backup, composer eligibility, signing, canonical payload, nonce reservations, publish attempts, browser-direct publish, read-back, Evidence, diagnostics, and tclk semantics remain unchanged. No dependency, route, persistence, WebSocket, polling, crawler, telemetry, analytics, automated live Technocore write, release, or deployment was added or performed. R4 remains NOT STARTED; V12-10 regression reconfirmation remains required after V12-09R is fully complete.

## Next Exact Action — V12-09R R3 complete

Begin V12-09R Phase R4 — Rooms Composer Gates.

### Phase 38 (V12-09R) — R4 Rooms Composer Gates, 2026-09-06

**Status: COMPLETE / PASS. Product Design: PASS.** Rooms now presents three truthful, selected-conversation composer states. Without an active Agent it remains read-only and routes to the existing create/import flow. With an active Agent but no verified backup it remains locked and routes to the existing secure-backup stage. A ready Agent receives the existing Write → Review → Sign Locally flow, visibly bound to the selected room.

The ready composer displays only the current `{used} characters` count. No general Rooms message-length limit exists or is implied; the separate tclk 4096-character limit was not reused. No `maxLength`, new threshold validation, input truncation, or upstream/protocol behavior change was introduced.

Review remains inside Rooms and retains exact room, DID, swept message, nonce, technical disclosure, Sign Locally, and Edit Message context. Signed-local presentation explicitly states that the message has not been published and that publishing is not proof of verification. Review and signing produced zero writes; the existing explicit Publish Message action remains the only publication trigger.

Desktop and 390 px rendered review passed for all three gates, ready composer, review, signed-local state, touch targets, hierarchy, and page-level horizontal overflow. Screenshots are stored in `artifacts/v12-10-preflight/r4-*.png`.

**Completion Gate:** typecheck PASS; 25/25 test files and 317/317 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes (`/`, `/api/inspect`, `/api/rooms`, framework `/_not-found`); Chromium E2E 15/15 PASS; offline npm audit PASS with 0 vulnerabilities.

State ownership and protected-domain audits PASS. Existing identity, onboarding, backup, nonce reservation, signing, browser-direct publishing, read-back, Evidence, diagnostics, Rooms reading, API, and protocol owners and behavior remain unchanged. No dependency, route, persistence, polling, WebSocket, crawler, telemetry, analytics, automated live Technocore write, release, or deployment was added or performed. R5 remains NOT STARTED.

## Next Exact Action — V12-09R R4 complete

Begin V12-09R Phase R5 — Publish & Read-back Presentation Regression.

### V1.2 Technocore-aligned Rooms rebuild — 2026-09-07

**Status: IMPLEMENTATION COMPLETE; PRODUCT ACCEPTANCE PENDING ONE PRODUCT OWNER REAL SIGNED SEND.** Current official `src/humans.html` was inspected directly. Its room pump performs an initial `since=0` read without wait, then exact `since=<last_seq>&wait=10`; it appends oldest-first results, advances only when records arrive, re-polls immediately after records and normally held empty responses, uses a two-second guard only for a near-instant empty waiter refusal, retries operational failures after three seconds, aborts on room change/hidden state, and restarts the parked read after send. It does not use a cache-busting counter.

The Workbench Rooms core now follows that model through the existing bounded same-origin/fixed-origin reader. The former possible 10-second post-response delay is removed. Current-state refs replace the stale React render snapshot that could replace rather than append cursor batches. Authoritative sequence is the primary dedupe identity; the bounded window remains 200. Exact optimistic reconciliation remains room-bound and requires DID, nonce, post-sweep stored text, signature, and independent VALID verification. A response to the one browser-direct signed GET attempt remains non-proof, no same-nonce retry is added, and the active long poll is restarted after the attempt.

Rooms now renders dense sequence/short-author/message/verdict/relative-server-time rows, compact Public Rooms and lobby fallback, a 44–92 px persistent Enter-to-send composer, near-bottom follow, anchored older reading with unseen count, and click-only technical evidence. Hostile content remains inert. No dependency, API route, persistence, WebSocket/SSE, crawler/archive, server signer/write relay, automatic retry, or automatic Evidence collection was added.

Verification: typecheck PASS; 27/27 unit/integration files and 331/331 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 19/19 PASS; offline npm audit PASS with 0 vulnerabilities. A separate real Chromium read-only comparison kept local production and official `/humans#r/lobby` open concurrently for 60 seconds: both sequences advanced, local issued continuous exact cursor `wait=10` reads, no page error occurred, and the observed end positions remained within a small live-stream offset. Screenshots: `artifacts/v12-10-preflight/technocore-aligned-local-60s.png` and `technocore-official-60s.png`.

No live message was written automatically. The required one-message Product Owner/manual signed-send acceptance remains pending, so final product PASS is not yet recorded. No commit, push, release, or deployment occurred.

## Next Exact Action — Technocore-aligned Rooms implementation complete

Product Owner opens local Rooms and official `/humans#r/lobby` side-by-side, manually sends one real signed Workbench message, and confirms optimistic row → one write → authoritative server sequence → VALID reconciliation while the stream continues.

### V1.2 Final Rooms UI + Responsive Hardening — 2026-09-07

**Status: COMPLETE / PASS.** Product Owner confirmed the accepted live engine with real signed messages `#87288` (`hi fam`) and `#87290` (`hello banana`): browser-local signing, one Technocore publish, authoritative observation, VALID verification, optimistic reconciliation, and continued streaming all passed. This hardening did not modify that engine.

The Public Rooms overlap came from accumulated CSS plus an absolutely positioned selected badge sharing insufficient title space with multiple metadata lines. Rows now own independent normal-flow geometry, selected/hover states do not change sizing, long names ellipsize with full title text available, and normal metadata is limited to the room name plus subordinate Recommended/Selected badges. The permanent wide panel is 240 px.

Rooms now uses a named inline-size container. Above 920 px of actual Rooms workspace width it renders `Public Rooms | Live Chat`; at or below 920 px, an already-selected chat receives the full track and Public Rooms becomes a keyboard-focused temporary 240 px panel. At mobile widths the existing single-view list/chat flow remains authoritative. Message rows demote sequence/verdict at 920 px and stack message above compact author/time/menu metadata at 560 px. Ordinary message text explicitly uses normal word breaking and `overflow-wrap: break-word`.

Validation covered 1600×900, 1440×900, 1280×800, 1180×800, 1100×800, 1000×800, 900×800, 800×844, 768×844, 600×844, and 390×844, plus 80/100/125 zoom and continuous width transitions in both directions. Public-room rows did not overlap, selected geometry remained stable, chat stayed readable, composer/details remained accessible, and document horizontal overflow stayed zero. A 51-second read-only live `#lobby` resize run preserved one initial session, continued exact cursor `wait=10` reads, advanced unique sequences, produced no runtime errors, and issued zero writes.

Completion gate: typecheck PASS; 27/27 unit/integration files and 332/332 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 20/20 PASS; offline npm audit PASS with 0 vulnerabilities; protected protocol/security source scan PASS. No dependency, API, persistence, commit, push, release, deployment, or automated Technocore write occurred.

## Next Exact Action — Final Rooms UI hardening complete

Product Owner performs final release review and authorizes the next release action if accepted.

### Final Live Rooms runtime-blocker correction — 2026-09-07

**Status: COMPLETE / PASS.** The browser `Illegal invocation` was caused by storing extracted Web timer methods in the default `TimerHost` and later invoking them with the timer-host object as their receiver. Chromium requires the original browser/global receiver. The scheduler now uses receiver-safe `globalThis.setTimeout(...)` and `globalThis.clearTimeout(...)` wrappers; no exception masking or architecture change was introduced. The initial successful retained read also transitions directly into its first cursor read.

Regression coverage now includes a real Chromium default-scheduler test without the fake clock that previously hid the receiver defect. It verifies initial retained load, an empty held response, later incremental arrival, cursor progression (`undefined → 1 → 1 → 2`), continued next-cycle scheduling, maximum one concurrent read, no `Illegal invocation`, and zero live writes. Existing tests continue to cover room switch/unmount cancellation, visibility pause/resume, operational recovery, optimistic exact-observation reconciliation, nonce safety, and stream continuation.

Real production-mode Chromium observed the actual public `#lobby` read surface for approximately 38 seconds. Five serialized requests advanced through multiple external batches; four sampled bounded windows contained advancing sequences, no duplicate sequence within a window, and no console/page/runtime errors. No live message was published during this validation because automated production writes remain prohibited; pending-to-authoritative reconciliation was verified with controlled E2E transport.

**Completion gate:** typecheck PASS; 27/27 unit/integration files and 329/329 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 19/19 PASS; offline npm audit PASS with 0 vulnerabilities. No dependency, protocol, identity, nonce, evidence, persistence, route, commit, push, release, or deployment change occurred.

## Next Exact Action — runtime blocker fixed

Product Owner repeats the Final Live Rooms visual/product acceptance check, then authorizes the next release action only if accepted.

### V1.2 Final Live Rooms amendment — 2026-09-07

**Status: COMPLETE / PASS; Product Owner final visual/product review pending.** This amendment supersedes only the older Rooms-specific manual retained-viewer and visible Review → Sign → Publish → Check normal interaction. AGENTS.md, browser-local identity/backup custody, canonical signing bytes, nonce reservation/burn, publish-attempt ownership, independent verification, Evidence semantics, and fixed-origin security remain authoritative and unchanged.

The selected room now owns one abortable cursor session: initial bounded retained read, exact `last_seq` cursor, then official `since` plus bounded `wait=10` reads. Room switch, mobile Back, workspace exit, hidden visibility, and unmount abort/invalidate stale work. Successful records merge incrementally by authoritative identity into a 200-record current window; overlap is deduplicated and operational failure preserves the last successful view. Explicitly held reads reconnect, while `wait_held:false` or absent metadata backs off conservatively.

Rooms uses dense horizontal rows and progressive cryptographic details, opens at newest, follows only when near newest, preserves an older-reading anchor, and provides a deduplicated 1–99/99+ jump counter. The compact composer supports Enter send, Shift+Enter newline, bounded auto-grow, draft clearing, and focus restoration. No-Agent and backup-required states remain compact read-capable gates. No general Rooms message-length limit was introduced.

Ready-agent sending reuses the single existing page-runtime identity, `SessionNonceReservations`, and `PublishAttemptSession`; it signs locally and performs one browser-direct fixed-origin publish attempt. No automatic retry occurs. Response receipt remains unverified/ambiguous. An optimistic row reconciles only when exact DID, nonce, swept text, signature, and independent VALID evidence are authoritatively observed. Evidence addition remains explicit; hostile content remains inert.

**Completion gate:** typecheck PASS; 27/27 unit/integration files and 329/329 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes (`/`, `/api/inspect`, `/api/rooms`, framework `/_not-found`); Chromium E2E 18/18 PASS; offline npm audit PASS with 0 vulnerabilities. Rendered review passed at desktop 1440×900, zoom-equivalent 80/100/125 viewports, and mobile 390×844 with bounded history, reachable composer/actions, progressive details, keyboard/focus behavior, and zero measured page-level horizontal overflow. No automated live Technocore write, dependency, persistence, new route, server write relay, WebSocket/SSE, crawler/archive, commit, push, release, or deployment occurred.

## Next Exact Action — Final Live Rooms complete

Product Owner performs final visual/product review of V1.2 Final Live Rooms and authorizes the next release action only if accepted.

### Phase 42 (V12-10) — Final Regression Reconfirmation & Release Preflight, 2026-09-06

**Status: COMPLETE / PASS.** This is a fresh verification of the current post-V12-09R repository; the historical earlier V12-10 evidence was not reused as the completion basis.

The full V1.2 product path passed: Home opens Rooms without forcing lobby; Rooms begins unselected, uses bounded manual discovery, binds selected conversation/composer state, supports switching and mobile Back to rooms, and preserves retained-history limitations. R4B remains a serialized, visibility-aware, selected-room-only five-second-after-settle read lifecycle with abort/revision stale-result protection. It cannot transition publication verification, add Evidence, discover rooms, publish, or accumulate an archive.

Identity remains browser/session-memory only with unchanged 32-byte cryptographic seed generation, encrypted-backup/re-import gate, lock behavior, and no secret persistence/rendering/server custody. Canonical payload, room/DID binding, exact 1–19 digit nonce handling, `BigInt`-safe max formula, reservation and nonce-burn behavior remain unchanged. Browser-direct publishing still constructs only the fixed-origin encoded `GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>` during explicit publish execution; confirmation, duplicate prevention, no automatic retry, and ambiguous-outcome handling passed.

Exact read-back still requires room, DID, nonce, post-sweep text, and signature plus independent VALID cryptographic verification. NOT_OBSERVED remains cause-neutral; read failure remains operational; INVALID requires an actual usable-evidence Ed25519 false result. Evidence remains runtime-only, explicitly collected, deterministically deduplicated, and receipt-limited. tclk remains observational with its own 4096-character bound; the general Rooms composer has only a current character count and no inferred limit.

Safe-reader/network review passed: fixed Technocore origin, validated names, redirects fail closed, 10-second timeout, 2 MiB room response, 256 KiB discovery response, 50 discovery observations, 200-message room request, 5 MiB/10,000-line/256 KiB-line export limits, and 8 KiB `/api/inspect` streaming request bound remain unchanged. Current application routes are `/`, `/api/inspect`, and `/api/rooms` (plus framework `/_not-found`). No arbitrary proxy, server write route/relay, database, auth, persistence, telemetry, analytics, WebSocket, SSE, crawler, or server custody exists.

Official asset integrity PASS: `flop-logo.png` SHA-256 `539E52B91891234FF9FF209846AE15C568DDDB9BC167147696EFE929C997452B`; `flop-hero.png` SHA-256 `1AEFD9D449E81C00E1AFDEEF0D3A8855FFF92BA54BFB880BF149EF451792E4B6`. Only approved resource links remain: FLOP Labs, Technocore Chat, Docs, and Built by Manh100; all open with `noopener noreferrer` and accessible new-tab labels.

Fresh rendered review at 1440 x 900 and 390 x 844 passed for the persistent shell, exact logo use, Home hierarchy, Open Rooms, explicit room selection, conversation/composer relation, Sign/Publish/Verified separation, truthful operational states, Evidence clarity, navigation/focus/touch usability, and page-level horizontal overflow. Hostile fixture content remained inert and caused no script execution, derived navigation, signing mutation, nonce mutation, or publish-target mutation.

**Completion gate:** typecheck PASS; 26/26 unit/integration files and 324/324 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 17/17 PASS using deterministic fixtures and intercepted write transport; offline npm audit PASS with 0 vulnerabilities. No automated live Technocore write occurred.

**Local production smoke:** PASS on owned `127.0.0.1:3210`. `/` returned HTTP 200 and HTML; `nosniff`, `no-referrer`, frame `DENY`, and restrictive Permissions Policy headers were present; malformed `/api/inspect` returned bounded JSON HTTP 400; the owned server shut down cleanly. Production E2E also exercised application hydration/navigation and brand paths. This is local production-mode evidence, not hosted production verification.

**Release preflight:** no environment variables, secrets, migrations, database, persisted-data backup, or application credentials are required. Build command: `npm run build`; start command: `npm start`. Intended hosting assumption remains a standard Node.js-capable Vercel deployment. Operational blockers before deployment are: select/link Vercel account/team/project, choose deploy method/operator, choose production URL/domain, assign smoke/monitoring/incident/rollback owners, and identify a previous rollback target or approve first-deployment takedown. Strict CSP remains a documented non-blocking defense-in-depth decision requiring a separately tested Next.js nonce/hash policy. Firefox, WebKit, hosted behavior, live advisory lookup, and production remain unverified. Local extraneous optional WASM/sharp packages are undeclared residue and not part of the dependency contract.

Release: **READY FOR PRODUCT-OWNER DEPLOYMENT DECISION.** Deployment: **NOT DEPLOYED.** Production verification: **NOT PERFORMED.** No release or deployment was performed.

## Next Exact Action — V12-10 complete

Product Owner decides whether to deploy FLOP Agent Workbench V1.2 or begin V1.3 architecture planning.

### V1.2 Rooms chat viewport production UX patch — 2026-09-06

**Status: COMPLETE / PASS.** The selected-room workspace now uses a bounded conversation viewport above the existing persistent compact composer. Retained messages render chronologically while the underlying bounded newest-first adapter and 200-message model remain unchanged. Initial room selection and room switches open at the newest retained message. Near-bottom readers continue following refresh results; readers positioned higher remain anchored to the same measured message position and receive a deduplicated unseen counter showing exact 1–99 and then `99+`. The room list and conversation scroll independently. The ready textarea grows to roughly four lines before scrolling internally, and the mandatory backup gate is compact while retaining its route to the existing backup flow.

The existing R4A stale-read protection, R4B serialized five-second visibility-aware scheduler, room-bound draft/review state, browser-local signing, nonce reservation/burn, explicit publish, explicit read-back, and Evidence actions remain authoritative and unchanged. No API, dependency, persistence, WebSocket, SSE, archive, automatic publication verification, or live Technocore write was added.

Validation: typecheck PASS; 26/26 unit/integration files and 325/325 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes; Chromium E2E 18/18 PASS at 1440×900, 80%/100%/125% viewport-scale equivalents, and 390×844. Deployment, commit, and push were not performed.

## Next Exact Action — Rooms chat viewport patch complete

Product Owner reviews the V1.2 Rooms chat viewport patch and authorizes a patch commit/push and deployment when ready.

### Phase 41 (V12-09R) — Final Product Pass, 2026-09-06

**Status: COMPLETE / PASS. Product Design: PASS.** Onboarding and Rooms now present one consistent explicit sequence: Write, Review, Sign locally, Publish with room-bound confirmation, transport outcome, manual Check publication, and exact read-back result. Signing states plainly that the message is not published. A transport response states that publication is not verified; ambiguous transport remains unknown with no same-nonce retry action.

NOT_OBSERVED remains cause-neutral with manual Check again. Read failure remains operational with Try read-back again and never implies INVALID. INVALID copy appears only for an actual usable-evidence Ed25519 false result. Only exact observed plus VALID read-back presents Published and verified. Add to Evidence and View Receipt are separate explicit actions; neither read-back nor general Rooms auto-refresh adds Evidence or opens a receipt automatically.

Evidence Receipts lead with conclusion, room/sequence where available, and cryptographic result; technical evidence is disclosed progressively. The approved limitation remains visible: the receipt does not establish real-world identity, trustworthiness, payment, settlement, rewards, or eligibility.

Cross-Workbench review passed for Home room discovery, onboarding, Rooms discovery/conversation/composer gates, My Agent, Evidence, Developer Tools, desktop navigation, and mobile navigation. Rendered 1440 x 900 and 390 x 844 validation passed for hierarchy, distinction between Sign/Publish/Verified, touch targets, focus/navigation behavior, receipt readability, and zero page-level horizontal overflow. Final evidence is stored under `artifacts/v12-10-preflight/final-*.png`.

**Completion Gate:** typecheck PASS; 26/26 unit/integration files and 324/324 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes (`/`, `/api/inspect`, `/api/rooms`, framework `/_not-found`); Chromium E2E 17/17 PASS with intercepted/mocked write transport; offline npm audit PASS with 0 vulnerabilities. The live npm advisory request was blocked by the execution environment because it would disclose dependency metadata externally; no workaround was attempted.

State ownership and protected-domain audits PASS. Existing identity, backup cryptography, DID, signing, sweep, canonical payload, nonce reservations/burn, publish-attempt session, browser-direct transport, exact read-back verifier, Evidence qualification, receipt model, safe readers, tclk semantics, and R4B lifecycle remain authoritative and unduplicated. No dependency, API route, persistence, WebSocket, SSE, crawler, telemetry, analytics, automatic publish, automatic publication verification, automatic Evidence addition, live Technocore write, release, or deployment was added or performed.

## Next Exact Action — V12-09R Final Product Pass complete

Begin V12-10 — Final Regression Reconfirmation & Release Preflight.

### Phase 39 (V12-09R) — R4A Rooms Entry & Selection Correction, 2026-09-06

**Status: COMPLETE / PASS. Product Design: PASS.** The previous lobby-first Home UX is **SUPERSEDED by Product Owner requirement**. R1–R4 remain COMPLETE / PASS. Home now presents Public Rooms with `Browse public conversations and choose a room.` and one `Open Rooms →` action. It contains no lobby-specific destination, fake count, fake activity, or render-time discovery/read.

Entering Rooms now starts with no selected destination, a clear `Choose a room` state, no conversation read, and no composer/gate. The existing manual bounded discovery supplies every selectable room. An actually discovered lobby may remain first and recommended but is selected exactly like any other room; absent-lobby Direct Room Access remains truthful and subordinate.

Explicitly selecting Room A and Room B updates the selected heading, retained conversation, message actions, and R4 composer/gate destination. Switching clears transient draft and prepared/review/publish presentation state without creating persistence. No selection, refresh, review, signing, or publication occurs automatically.

At 390 x 844, Rooms preserves list → conversation → Back to rooms → alternate-room selection with usable touch targets and zero page-level horizontal overflow. Rendered evidence is stored in `artifacts/v12-10-preflight/r4a-*.png`.

**Completion Gate:** typecheck PASS; 25/25 test files and 318/318 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes (`/`, `/api/inspect`, `/api/rooms`, framework `/_not-found`); Chromium E2E 16/16 PASS; offline npm audit PASS with 0 vulnerabilities.

State ownership, protected-domain, and network audits PASS. Existing Home/Rooms owners, identity, backup, nonce, signing, publish, read-back, Evidence, diagnostics, API contracts, safe-reader limits, and tclk semantics remain unchanged. Rooms network access remains only the existing explicit `/api/rooms` discovery and `/api/inspect` room read. No dependency, route, persistence, polling, WebSocket, long-poll, crawler, background refresh, automated live Technocore write, release, or deployment was added or performed. R4B and R5 remain NOT STARTED; V12-10 regression reconfirmation remains required later.

## Next Exact Action — V12-09R R4A complete

Define V12-09R Phase R4B — Bounded Conversation Auto-Refresh Architecture.

### Phase 40 (V12-09R) — R4B Bounded Conversation Auto-Refresh, 2026-09-06

**Status: COMPLETE / PASS. Product Design: PASS.** The previous V1.2 `manual conversation refresh only / no polling` constraint is narrowly superseded by a 5,000 ms bounded auto-refresh for the explicitly selected room while the Rooms conversation is active and the document is visible. Room discovery remains manual. Publication verification remains explicit.

The selected-room lifecycle uses one self-scheduling timeout whose delay begins after the preceding read settles. Initial selection reads exactly once without an immediate duplicate. Manual refresh shares the same one-request guard and resets cadence. Hidden documents clear the timer; one visibility catch-up read occurs on return, followed by normal cadence. No missed ticks queue.

Room switch, mobile Back to rooms, workspace exit, and unmount clear timers/listeners and abort/invalidate the prior generation. AbortSignal plus request revision prevents stale Room A results from overwriting Room B or updating an unmounted component. Failures preserve the last successful current bounded view, remain operational rather than INVALID, and recover on a later normal cycle.

The scheduler calls only the existing same-origin `/api/inspect` Room read, which continues through the fixed-origin safe reader with the existing 200-message bound, 10-second timeout, response limit, room validation, and redirect rejection. It never invokes signing, nonce reservation/burn, publishing, Check publication, `PublishAttemptSession`, Evidence collection, onboarding, tclk execution, or discovery.

The normal UI remains quiet with `Retained conversation · Auto-refresh on`; manual Refresh conversation remains keyboard accessible and disabled while its serialized read is active. Desktop and 390 px review found no layout disruption, countdown noise, realtime/streaming claim, sticky status bar, or horizontal overflow. Evidence is stored in `artifacts/v12-10-preflight/r4b-*.png`.

**Completion Gate:** typecheck PASS; 26/26 test files and 324/324 tests PASS; ESLint PASS with zero warnings; production build PASS with unchanged routes (`/`, `/api/inspect`, `/api/rooms`, framework `/_not-found`); Chromium E2E 17/17 PASS; offline npm audit PASS with 0 vulnerabilities.

State ownership and protected-domain audits PASS. Existing `RoomsChat` remains the selected-room/message/composer owner; the new Rooms-specific scheduler owns only timer, visibility, request serialization, abort, and generation lifecycle. No dependency, API route, persistence, WebSocket, SSE, long-poll, service/background worker, crawler, local archive, automatic publication verification, automatic Evidence, automated live Technocore write, release, or deployment was added or performed. R5 remains NOT STARTED; V12-10 regression reconfirmation remains required later.

## Next Exact Action — V12-09R R4B complete

Begin V12-09R Phase R5 — Publish & Read-back Presentation Regression.
