# MVP Acceptance Criteria

1. Supports exactly Room, Message, DID, and JSONL Export inspection.
2. VALID/INVALID/UNSIGNED/UNVERIFIABLE are deterministic and mutually exclusive per inspected record; operational errors are separate.
3. Known-good official-compatible signed fixture verifies VALID.
4. Mutating room, nonce, text, DID, or signature produces the expected non-valid outcome; crypto failure is INVALID.
5. Canonical payload is exactly `<room>|<nonce>|<text>` UTF-8 after official sweep; seq/ts never affect verification.
6. Sweep implements official Unicode-category replacement and trim; no Unicode normalization is introduced.
7. 19-digit nonce beyond 2^53 re-verifies without precision loss.
8. Missing legacy `sig` is UNVERIFIABLE, not INVALID.
9. Unsigned activity is UNSIGNED, not an error.
10. Report visibly separates signed fields, server assertions, and untrusted/caller-chosen data.
11. VALID UI states that signature proves key control only, not identity/reputation/honesty/truth.
12. Adjacent sequence discontinuities are reported without assigning cause.
13. Room/export views state retained-window limitation and never claim full history.
14. Room class prefixes p-/mb-/d-/e- are interpreted according to official composable rules.
15. Uploaded JSONL is parsed safely with bounded resources; malformed lines produce operational parse errors without fabricating verdicts.
16. Hostile HTML/script/markdown-like content renders inertly; no executable markup.
17. URLs from user/Technocore content are never fetched automatically.
18. Safe live reader cannot be used as an arbitrary proxy and cannot call Technocore write endpoints.
19. Network timeout/4xx/5xx/parser/server failures do not become INVALID.
20. Basic tclk/1 detection recognizes only verified official forms and never concludes settlement/value transfer.
21. No seed/private key/password/wallet secret is requested, stored, logged, or transmitted.
22. No database/auth/wallet/signing/write/AI trust score exists in MVP.
23. Desktop/mobile core flows are usable; long DIDs/signatures/content do not break layout.
24. All required automated tests, lint, typecheck, production build, and critical E2E pass at final gate.

## V1.2 acceptance-contract amendment

The 24 criteria above remain the completed V1.1 debugger contract. Criterion 21's blanket secret-handling prohibition applies to V1.1; for V1.2 it is superseded only by the following requirements. These are future acceptance requirements and are not marked PASS by this documentation change.

25. Approved local identity generation occurs only in the browser using cryptographically secure browser randomness.
26. Seed, private-key material, backup passphrase, decrypted backup, and derived encryption key never reach the application server or Technocore.
27. A versioned, authenticated, encrypted user-downloaded identity backup is permitted; plaintext identity backup is not.
28. Backup passphrase entry, key derivation, encryption, import, authentication, and decryption remain browser-local.
29. Unlocked identity material is session-memory only and is not persisted in localStorage, sessionStorage, IndexedDB, cookies, URLs, server sessions, logs, telemetry, analytics, or databases.
30. Raw seed and private-key paste inputs remain prohibited.
31. V12-01 contains no signing, publishing, Technocore write, write API route, server relay, or placeholder relay.
32. Browser-local signing and browser-direct publishing require separate phase authorization and explicit user actions.
33. Any future publishing uses a fixed purpose-specific Technocore endpoint, never an application-server relay or arbitrary destination.
34. Future ambiguous publish outcomes are not success, are not automatically retried, and do not reuse the nonce; success requires exact read-back plus independent verification.
35. Every V1.2 phase keeps the completed V1.1 regression suite green and preserves its protocol, evidence, diagnostic, receipt, limit, retention, and tclk semantics.

## V12-03 acceptance-contract amendment

These requirements defined the V12-03 implementation gate and were not marked PASS by the earlier documentation-only reconciliation. The subsequent verified implementation state is recorded in `PROJECT_STATUS.md`.

36. Publishing consumes only an immutable V12-02 public prepared descriptor and never re-signs, re-sweeps, or receives identity secrets.
37. The only transport is browser-direct `GET https://technocore.chat/r/<room>/say-signed/<did>/<sig>/<nonce>/<text>` with exact component order, no body, query, fragment, credentials, alternate port, arbitrary origin, server relay, or POST fallback.
38. Each descriptor value is encoded exactly once as a URL path component and decodes to the original protocol value without allowing reserved or non-ASCII text to alter URL structure.
39. No network request or executable write URL exists before explicit publish invocation; the URL is never rendered, linked, prefetched, preloaded, previewed, or derived from untrusted content.
40. State transitions from `NOT_ATTEMPTED` to `ATTEMPTED` immediately before fetch and burns the DID+room+nonce for the session regardless of outcome.
41. A repeated attempt with the same burned nonce fails locally before network execution and neither retries nor prepares a replacement automatically.
42. Any observable HTTP response maps only to `RESPONSE_RECEIVED`; no status or body maps to published or verified success.
43. Fetch rejection, CORS rejection, timeout, interruption, or unreadable response maps to `OUTCOME_UNKNOWN`, never definitive publish failure.
44. Response body/content type is non-required, bounded if read, untrusted, and never executed or interpreted as instructions.
45. `PUBLISHED_AND_VERIFIED` and read-back verification remain unimplemented until a separately authorized later phase.
46. Automated tests use injected transport boundaries and perform no live Technocore write.
47. V12-03 keeps V12-02, V12-01, and V1.1 regression suites green.

## V12-04 read-back verification amendment

48. Read-back is unavailable before a recorded V12-03 attempt and causes no read in that state.
49. The adapter performs a bounded read of only the prepared room through the existing safe fixed-origin reader.
50. `PUBLISHED_AND_VERIFIED` requires an exact room, DID, nonce, post-sweep text, and signature match plus an independent existing-verifier result of `VALID`.
51. Sequence and timestamp remain unsigned server evidence and are excluded from signed-evidence matching.
52. An observed HTTP response alone is not publication proof; an `OUTCOME_UNKNOWN` attempt may later verify from exact independent evidence.
53. No retained match is reported as cause-neutral `NOT_OBSERVED`; no eviction, rejection, failure, or complete-history cause is inferred.
54. Related but non-verifying evidence is `OBSERVED_BUT_NOT_VERIFIED` and preserves the actual V1.1 evidence verdict. Operational read failures remain separate as `READBACK_UNAVAILABLE`.
55. Multiple retained candidates are selected deterministically without claiming that a particular transport attempt caused a record.
56. Read-back adds no write, retry, re-sign, replacement nonce, nonce reuse, polling, persistence, secret exposure, UI work, release, or deployment behavior.
57. Mocked tests cover the attempt precondition, exact match, VALID/INVALID/UNVERIFIABLE evidence, ambiguity recovery, absent evidence, operational failure, deterministic multiplicity, receipt boundaries, burned nonce, and zero live writes.
58. V12-04 keeps V12-03, V12-02, V12-01, and V1.1 regression suites green.

## V12-05 guided newcomer onboarding amendment

59. Start exposes an obvious guided onboarding path while preserving every existing debugger entry point.
60. Identity creation uses V12-01 and renders only public identity in the normal flow. It creates no ordinary raw seed/private-key field or persistent identity store; the sole output exception is the authorized, confirmed My Agent Advanced Secret Key reveal.
61. Encrypted-backup creation/download does not enable signing. Only successful local import/decrypt of the matching identity with `VERIFIED` state does.
62. Wrong-passphrase, tampered, invalid-schema, and DID-mismatch imports fail closed without enabling signing.
63. Introduction defaults to room `lobby`; exact room, DID, nonce, post-sweep text, and canonical payload are inspectable before signing.
64. Signing is an explicit action using V12-02. Its result says locally signed/not published; editing a signed input invalidates the actionable descriptor and never auto-signs.
65. Publishing is a separate explicit action using V12-03. UI constructs/exposes no executable write URL or relay, provides no same-nonce retry, and never maps HTTP response or ambiguity to verified success/failure.
66. Read-back requires an actual attempt and a separate bounded action using V12-04. Verified, absent, related-nonverified, and operationally unavailable outcomes preserve their approved meanings.
67. Existing deterministic receipt JSON/Markdown and limitation semantics are reused without secret or full-raw-transcript inclusion.
68. Hostile introduction content remains inert and content URLs are not fetched.
69. The flow adds no persistence, accounts, wallet/token/reward/eligibility/trust scoring, automatic polling/retry, server signing/relay, generic network destination, dependency, V12-06, release, or deployment behavior.
70. Functional tests mock all external read/write dependencies, perform zero live Technocore writes, and keep V12-04 through V12-01 and V1.1 regressions green.

## V12-06 Workbench integration amendment

71. Home visibly separates Get Started and Inspect & Debug while exposing the three onboarding and four debugger entries without hiding either workflow.
72. All onboarding shortcuts host the single V12-05 flow and cannot bypass verified-backup, explicit-signing, explicit-publish, or attempted-state/read-back gates.
73. An unlocked active identity is retained only in page-runtime memory. Normal identity UI displays public identity only. Secret signing material may appear only through the explicitly authorized Advanced Secret Key reveal flow—not as account, login, wallet, profile, or ordinary identity data.
74. Active identity navigation reuses the existing DID inspector; verified onboarding room/sequence navigation reuses existing Message Debug without an automatic read.
75. Existing public-room discovery remains fixed-origin and bounded; existing diagnostics, Evidence Receipt terminology, verdict/status taxonomy, and tclk observation-only behavior remain accessible.
76. Navigation causes no signed write construction/request, background polling, content-derived fetch, or hostile-content execution.
77. No persistence, account/auth, wallet/blockchain, contribution/reward/reputation layer, server write route/relay, dependency, V12-07, broad polish, manual production write, release, or deployment is added.
78. Integration tests use intercepted/mocked external boundaries, perform zero live Technocore writes, and keep V12-05 through V12-01 and V1.1 regressions green.

## V12-07 security and regression hardening amendment

79. Secrets remain excluded from ordinary rendered output, server output, logs, URLs, persistence, diagnostics, receipts, network requests, and public serializable models; passphrase UI values clear after local operations. Deliberate client-only rendering inside the authorized Advanced Secret Key reveal flow is the sole exception.
80. Backup input is bounded and exact-shape/version/KDF/cipher/encoding validation rejects manipulated metadata before PBKDF2.
81. Exact nonce arithmetic, reservation-before-signing, burn-before-fetch, no same-descriptor retry, and fixed one-time encoded GET destination remain unchanged.
82. V12-03 ambiguity and V12-04 exact-match/VALID-only success preserve their approved meanings; HTTP and operational errors cannot fabricate verification.
83. UI async actions are synchronously single-flight, and input revision prevents stale sign/publish/read-back completions from restoring actionable state.
84. Hostile content remains inert; no content URL, signed GET URL, logging, storage, polling, server relay, or generic proxy is introduced.
85. Locked export, line, live-response, timeout, room-count, inspect-body, and tclk limits remain unchanged and directly checked.
86. Existing browser headers remain enabled; strict CSP is deferred with rationale to release architecture review rather than introduced speculatively.
87. Full V12-06 through V12-01 and V1.1 regression gates pass with zero automated live Technocore writes before V12-08.

## V12-08 manual-validation evidence and roadmap amendment

V12-08 Manual Product Validation is recorded as COMPLETE / PASS from product-owner manual observation: the existing onboarding flow was exercised from local identity creation through encrypted backup/download, verified re-import, signed-message preparation, local signing, one explicit live publish attempt, matching read-back observation, existing-verifier `VALID`, and Evidence Receipt generation. Full refresh removed the unlocked identity. This is not automated evidence, not production deployment evidence, and not proof of general hosted CORS behavior beyond the observed flow.

The following are phase-definition constraints, not completed acceptance claims:

88. V12-08A uses bounded public-room reads, retained source order, inert hostile content, manual refresh, existing inspection/diagnostics, V12-02 signing, V12-03 explicit publish, and V12-04 manual read-back; it adds no polling, crawler/archive, server relay, persistence, or private/social/scoring features.
89. V12-08B exposes only the current browser-memory Agent's public DID, session/backup controls, restore/lock/clear actions, inspection, and observed-evidence links without account, wallet, authentication, secret persistence, server custody, reputation, or real-world identity claims.
90. V12-08C presents only locally/session-observed activity, verification, references, receipts, and diagnostics; it never labels this as contribution credit, reward, eligibility, reputation, trust, or complete/global history.
91. V12-08D verifies identity and backup boundaries, nonce/signing, explicit publish, read-back and verdict semantics, hostile content, no persistence, no unintended writes/relay, and full V1.1/V1.2 regression safety before V12-09.

## V12-08B My Agent completion

92. My Agent presents truthful no-active and active runtime-memory states, the full public DID, and only domain-known backup/signing readiness.
93. Create, Import, Backup/Recovery, and DID inspection reuse existing Workbench flows; no duplicate identity, backup, or DID engine exists.
94. Explicit Lock invokes the existing session lock before clearing the single Home-owned identity holder; onboarding and Rooms observe the same holder and lose identity-bound capability immediately.
95. Lock does not mutate downloaded encrypted backups, and refresh continues to lose the unlocked identity with local/session storage empty.
96. V12-08B adds no secret rendering/transmission/persistence, account/auth/wallet/profile semantics, server identity/write route, dependency, V12-08C behavior, release, or deployment.

## V12-08C Evidence / My Activity completion

97. Evidence truthfully represents only public evidence observed during the current page runtime and presents an honest empty state rather than account, contribution, or complete-history claims.
98. Entries originate only from an explicitly selected observed room message or an exact V12-04 `PUBLISHED_AND_VERIFIED` read-back result; no background or automatic collection occurs.
99. `RESPONSE_RECEIVED`, `OUTCOME_UNKNOWN`, `NOT_OBSERVED`, and other non-qualifying read-back states cannot create a successful observed-publication entry.
100. Existing `VALID`, `INVALID`, `UNSIGNED`, and `UNVERIFIABLE` verdicts remain unchanged, and server-assigned sequence remains visibly outside signed evidence.
101. Active-Agent association is computed from the current public DID; Lock removes that association while leaving already observed public evidence intact, and refresh clears the runtime-only list.
102. Existing Message Debug diagnostics and canonical Evidence Receipt generation/limitations are reused without a second verifier, diagnostic, or receipt engine.
103. Hostile room/message/user content remains inert and content URLs are neither activated nor fetched.
104. V12-08C adds no persistence, secret-bearing state, background polling/collection, contribution/reward/reputation/eligibility semantics, route, dependency, protocol change, live automated write, V12-08D behavior, release, or deployment.

## V12-08D Integration & Security Regression completion

105. One Home-owned identity and one page-runtime nonce/publish lifecycle are authoritative across Onboarding, Rooms, My Agent, and Evidence association.

## Final Live Rooms amendment

106. The older Rooms-only manual-refresh and visible Review → Sign → Publish → Check normal interaction is superseded; all non-Rooms security and evidence requirements remain authoritative.
107. The selected room follows the official `/humans` initial-tail then `since=<last_seq>&wait=10` cursor pump, immediately re-polling after records and normally held empty responses, with only the official near-instant-empty hot-loop guard.
108. Authoritative records append from current state and deduplicate by sequence; room switches, hidden tabs, send restarts, exit, and unmount cannot accept stale work.
109. A sent optimistic row reconciles only against exact room, DID, nonce, post-sweep stored text, signature, and independent VALID evidence; a write response alone never verifies publication.
110. Normal Rooms presentation is dense chat, with relative server time, click-only details, a compact direct-lobby fallback, and a persistent compact Enter-to-send composer without a new general message-length limit.
107. One selected-room cursor session performs initial retained load and bounded `since`/`wait` reads, aborts stale work, pauses hidden work, reconnects safely, deduplicates overlap, and retains at most 200 records.
108. The stream opens at newest, follows only near newest, preserves older-reading position, and exposes a deduplicated 1–99/99+ jump counter.
109. Enter sends and Shift+Enter inserts a newline; no-Agent and unverified-backup states remain compact read-capable gates; no general Rooms length limit exists.
110. Sending uses only the existing browser-local identity, nonce reservations, publish-attempt owner, and fixed-origin transport. It never automatically retries a nonce and never treats response receipt or network failure as cryptographic verification/INVALID.
111. An optimistic row reconciles without duplication only when the exact authoritative DID, nonce, post-sweep text, signature, and independent VALID evidence are observed. Evidence collection remains explicit and hostile content remains inert.
106. Navigation, Lock, and identity replacement cannot discard reservation/burn history or restore stale signing capability; refresh clears runtime identity and Evidence.
107. Exact BigInt/string nonce selection remains `max(currentUnixMilliseconds, highestObservedNonce + 1, highestSessionNonce + 1)` per DID+room, with reservation before signing and irreversible burn before fetch.
108. Backup crypto, canonical payload/signature behavior, explicit-only fixed-origin publishing, ambiguity, exact read-back qualification, evidence verdicts, 12-stage diagnostics, receipts, and tclk semantics remain unchanged.
109. Secret/persistence, hostile-content, public-room, API/read-only server, resource-limit, product-claim, logging, and automatic-network audits pass with zero automated live Technocore writes.
110. The full V12-08C through V12-01 and V1.1 regression gate passes before V12-09.

## Existing Agent restore UX amendment

- An unloaded browser session says **Agent not loaded**, not that no identity exists. **Create New Agent** is the sole filled primary CTA; **Already have an Agent? Restore Agent** follows as a keyboard-accessible text action.
- Restore Agent reuses the existing bounded V1 importer, local authenticated decryption, seed validation, public-key/DID derivation, envelope DID match, and single runtime holder.
- A successful restore identifies **AGENT RESTORED**, shows the recovered Public DID, confirms local decryption, DID match, and signing readiness, and offers **Open Technocore Rooms** without implying a new identity was created.
- Create New Agent states that it creates a new DID and directs existing owners toward Restore Agent before generation.
- Wrong Backup Password, malformed V1 envelope, and DID mismatch fail safely. Backup Password and secret material reach neither server/network requests nor browser persistence.
- Lock and refresh continue clearing the unlocked runtime identity. The unloaded/locked UI retains an obvious Restore Agent path without weakening zeroization or adding persistent login.
- Backup V1, signing, nonce, publishing, read-back, Evidence, Live Rooms, APIs, dependencies, and production architecture remain unchanged.
- Unloaded Home hides Agent-dependent Identity/Backup/First Record/Evidence progress cards; Public Rooms and Developer Tools remain available and visually subordinate to Create New Agent.
- The unloaded header shows only **No Agent loaded**. The active header shows only the shortened Public DID, has accessible purpose **Open My Agent**, and navigates to My Agent rather than DID Inspector.
- Active Home does not show Create/Restore entry actions. Before backup verification its dominant action is backup protection; when Ready to Sign its dominant action is **Open Technocore Rooms** and status cards use beginner-facing Ready/Verified/Not published/Observed/Available terminology.
- After backup verification, **Open Technocore Rooms** is the dominant action; the existing guided-first-message route remains a subordinate text action. Restore success retains the same Rooms continuation.
# V13-01 Guided Onboarding Foundation

- A newcomer enters a branded one-primary-task Guided Agent Journey from Home.
- The canonical 12-step model derives completion from real facts and identifies required versus skippable steps.
- Create reuses the existing browser-local identity implementation and shows the Public DID.
- Secure creates/downloads the existing encrypted backup V1; Verify imports locally and requires the same derived DID.
- An active/restored verified Agent begins at Personalize instead of recreating an identity.
- Personalize requires a self-declared Display Name of 1–48 characters; optional X username and description are bounded to 15 and 160 characters.
- Profile/progress are current-memory-only; no secret or non-secret browser persistence is added in V13-01.
- Later states remain incomplete and do not claim working message, card, share, X, contribution, or verification actions.
- Secret reveal, backup schema/cryptography, signing, nonce, publish/read-back, Evidence, Live Rooms, dependencies, APIs, and backend behavior remain unchanged.
- Desktop/mobile layout, keyboard controls, full tests, typecheck, zero-warning lint, production build, Chromium E2E, and dependency audit pass.

# V13-02 Identity Portability

- V13-02 distinguishes Create New Agent, Restore Workbench Agent, and Import Existing Agent without creating another runtime identity owner.
- Advanced Secret Key download requires explicit warning/confirmation and emits only 64 lowercase seed-hex characters plus an optional final newline.
- Import accepts only the closed supported registry, validates files locally within documented bounds, shows the derived Public DID, and requires confirmation before activation.
- Workbench V1 detection reuses the existing Restore path. Raw/Crypto imports are not labeled backup-verified and route to the earliest genuinely incomplete Secure/Verify step.
- CryptoTelugu V4 asserted DID and public key must exactly match independently derived values. Unknown, malformed, unsupported, corrupted, and mismatching material fails without secret leakage.
- No import/export secret enters network, persistence, SSR, log, error, diagnostic, Evidence, or server boundaries.

# V13-03 Guided First Signed Message

- Entry requires active signing capability, verified recovery, and Display Name; locked/incomplete Agents route to genuine earlier steps.
- Draft is deterministic English, editable, based only on approved profile data, and targets `#lobby` without prohibited claims or secrets.
- Nothing publishes on entry or edit. One Sign & Publish activation creates at most one attempt through shared signing/nonce/publish owners.
- A response or ambiguous outcome cannot complete verification; no automatic retry or nonce reuse exists.
- Explicit recheck performs no write and advances only on exact authoritative observation plus independent VALID.
- INVALID, UNVERIFIABLE, mismatch, not observed, read unavailable, and outcome unknown remain distinct and do not advance.
- CARD remains locked/unimplemented until VERIFY_MESSAGE genuinely completes.

# V13-04 Verified Agent Card + X Share

- CARD cannot be created without genuine PUBLISHED_AND_VERIFIED journey evidence and authoritative sequence.
- The explicit public model contains only bounded Display Name, public DID, lobby, authoritative sequence, Ed25519, verification label, and product name.
- Preview and 1600×900 PNG use actual values and `SIGNATURE VERIFIED`, never identity/trust/reward/contribution claims or secret/session material.
- Export is deterministic from the public model, browser-local, same-origin branded, PNG, and requires no dependency/server/upload.
- Three deterministic English drafts remain within 280 characters for maximum supported public fields, include DID, record, production URL and `@flop_labs`, and avoid prohibited claims.
- Draft remains editable; Copy and encoded X Web Intent work. UI states that the user must attach the card and press Post manually.
- Download/copy/open do not prove an X post or unlock attachment, contribution, evidence, or COMPLETE.

# V13-05 X Attachment + Contribution Evidence

- ATTACH requires completed Card/Share and deliberate local input; only canonical bounded X status URLs pass, with no fetch or ownership/content claim.
- Contribution V1 is deterministic, bounded, human-inspectable public JSON reviewed before one explicit shared-stack Sign & Record attempt.
- `#lobby` is labeled a Workbench onboarding convention, never an official FLOP Labs lane or acceptance mechanism.
- Response/unknown/not-observed/mismatch/INVALID/UNVERIFIABLE cannot complete; recheck never republishes. Exact authoritative observation plus VALID alone completes evidence.
- Public JSON/Markdown receipts are deterministic, locally copied/downloaded, limitation-bearing, and secret-free.
- COMPLETE reflects genuine journey facts and offers Rooms/My Agent/Evidence without claiming official acceptance, identity, reward, eligibility, reputation, or durable history.

# V13-06 Release Candidate QA

- Visible progress is the eight-stage beginner model and exposes the current stage at desktop, laptop, tablet, and mobile widths.
- Every journey transition has one dominant action; Card creation and X handoff contain no stale phase-lock language.
- The user must download the Card before Open in X is enabled, and copy/download failures provide safe alternatives without changing evidence facts.
- Step transitions focus the new task heading. Status and errors retain semantic announcements, keyboard-native controls, and non-color labels.
- Production-build review covers 1440×900, 1280×720, 768×1024, and 390×844 without page overflow or inaccessible critical actions.
- Release candidate status never implies release, deployment, live write verification, X ownership, or official contribution acceptance.
