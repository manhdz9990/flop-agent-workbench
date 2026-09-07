# Critical Test Matrix

| ID | Area | Case | Expected |
|---|---|---|---|
| V01 | Verify | independent known-good signed record | VALID |
| V02 | Verify | mutate text after signing | INVALID |
| V03 | Verify | mutate room | INVALID |
| V04 | Verify | mutate nonce digits | INVALID |
| V05 | Verify | malformed/noncanonical signature | INVALID or structural operational error per locked verifier contract; never VALID |
| V06 | Verify | malformed/unsupported DID | operational input/parse error; no fabricated verdict |
| V07 | Verify | unsigned record | UNSIGNED |
| V08 | Verify | legacy signed record missing retained sig | UNVERIFIABLE |
| C01 | Canonical | seq/ts changed only | signature result unchanged |
| C02 | Canonical | controls/format/private-use/Zl/Zp sweep | exact official replacement + trim |
| C03 | Canonical | NFC vs NFD | no normalization; distinct bytes remain distinct |
| C04 | Precision | 19-digit nonce >2^53 | exact digits preserved; known-good verifies |
| T01 | Transcript | seq 10,11,14 | gap 11→14 reported; no cause asserted |
| T02 | Retention | first observed seq >1 | retained/incomplete context warning; not “messages deleted” |
| E01 | Export | valid raw JSONL | parsed; exact evidence retained |
| E02 | Export | malformed line | bounded line error; no crash/fake INVALID |
| E03 | Export | missing generation header metadata | “metadata unavailable”; not invalid |
| R01 | Room | p-/mb-/d-/e- composition | official classes recognized |
| S01 | XSS | `<script>`, HTML, bidi/control payloads | inert display; no execution |
| S02 | URL | Technocore write URL inside message | displayed only; never fetched |
| S03 | SSRF | localhost/file/private-IP/custom-host input | reader rejects; no request |
| S04 | Redirect | allowlisted read redirects off-origin | fail closed |
| S05 | Write boundary | attempt `/say`, `/say-signed`, `/kv/.../set` | impossible/rejected by reader API |
| S06 | Secrets | seed/private-key-like text | no special upload/log/storage path; safety copy present |
| N01 | Network | timeout | operational error, not INVALID |
| N02 | Network | 4xx/5xx | operational error, not INVALID |
| N03 | Parser | server malformed JSON | operational parser error |
| K01 | tclk | verified official/spec-derived frame | detected/interpreted conservatively |
| K02 | tclk | lookalike malformed text | not detected as valid frame |
| K03 | tclk | terminal-looking frame | never says settled/funds moved |
| UI01 | Responsive | long DID/sig/text mobile | wraps safely, no page overflow |
| ID01 | Secret UX | open My Agent normally | raw Secret Key absent; masked Advanced view only |
| ID02 | Secret UX | reveal dialog Cancel / confirm / Hide | Cancel stays masked; confirm shows exact 64 lowercase hex; Hide removes it |
| ID03 | Secret UX | Copy before / after reveal, then Lock/remount | copy unavailable before reveal; exact secret after confirmation; Lock/remount masks and makes unavailable |
| ID04 | Secret boundary | inspect APIs, URLs, storage, cookies, diagnostics, receipts, logs, and SSR | raw Secret Key absent everywhere; client-only Advanced reveal is sole exception |
| ID05 | Backup | old minified V1 and new pretty V1 import | both recover same DID; schema and cryptography unchanged |
| ID06 | Beginner UX | Public/Protected/Secret, signing, proof limits, portability | share/recovery/ownership boundaries are understandable and accessible |
| ID07 | Unloaded session | initial load, refresh, or post-Lock My Agent | says Agent not loaded; Create New Agent is the sole filled primary CTA; Restore Agent is a secondary text action |
| ID08 | Existing restore | valid minified/pretty V1 + correct Backup Password | same Public DID becomes active and Ready to Sign; no new identity wording |
| ID09 | Restore failure | wrong password, malformed envelope, or DID mismatch | safe local failure; no active identity or fabricated readiness |
| ID10 | Restore boundary | inspect requests and browser storage during restore | Backup Password and raw secret are absent; no server recovery path |
| ID11 | Unloaded Home hierarchy | desktop/tablet/mobile without identity | only Create/Restore entry, Public Rooms, and Developer Tools; Agent status cards absent; no overflow |
| ID12 | Header continuity | unloaded then active | minimal No Agent loaded; shortened DID button has Open My Agent purpose and opens My Agent |
| ID13 | Ready navigation | verified backup or restored Agent | Open Technocore Rooms is the single dominant next action; guided publish remains optional/subordinate |
# V13-01 Guided Journey cases

- Assert exact canonical state order, required/skippable metadata, and earliest-incomplete routing for new, created, backup-created, verified, and personalized facts.
- Assert merely rendering future steps does not complete them.
- Validate Display Name, X username, and description normalization/bounds.
- Chromium: Create → show Public DID → create/download backup V1 → re-import with password → same-DID verification → Personalize → truthful FIRST_MESSAGE boundary.
- Assert no application/Technocore requests occur during the V13-01 journey, browser storage remains empty, mobile has no page overflow, and later actions are not fabricated.
- Re-run all V1.2 identity, backup compatibility, restore, signing/nonce, Rooms, Evidence, security, responsive, and accessibility regression coverage.

# V13-02 Identity Portability cases

- V13-02 deterministic portability fixture matrix: Workbench V1 detection/restore reuse; valid lowercase/uppercase/ASCII-padded raw seed; invalid length/hex/extra/empty/oversize; malformed/unknown JSON; Crypto V4 detection/import, wrong password, corrupted ciphertext, unsupported version/algorithm, DID mismatch, and public-key mismatch.
- Assert exact `.txt` filename/payload, same-DID derivation/reimport, candidate confirmation before activation, Lock capability removal, no rendered error leakage, no storage, and no import network traffic.
- Re-run existing onboarding, identity/backup, Rooms, security-boundary, desktop/mobile overflow, and accessibility regression.

# V13-03 Guided First Signed Message cases

- Verify entry gates and deterministic English draft with Display Name/optional description, editable content, `#lobby`, bounded generated length, and no secret/prohibited claims.
- Controlled transport: zero writes on entry; one click/one attempt; response alone incomplete; unknown burns nonce without retry; explicit recheck performs no write.
- Reuse shared identity/reservation/attempt modules; exact observed record plus VALID alone unlocks locked CARD. NOT_OBSERVED, mismatch, INVALID, UNVERIFIABLE, and read failure remain incomplete.
- Re-run Restore, Import, Backup, Secret portability, Rooms send/reconciliation, security, desktop/mobile overflow, focus, and accessibility regression. No live write.

# V13-04 Verified Agent Card + X Share cases

- Assert CARD remains locked until exact observed + VALID and uses actual profile/DID/lobby/authoritative sequence.
- Unit-test exact public DTO keys, bounds, absence of secret/session fields, truthful label, three deterministic ≤280-character English drafts, public evidence/URL/@flop_labs, prohibited-claim exclusion, and exact intent encoding.
- Chromium verifies card preview, local PNG signature/type and 1600×900 IHDR, safe filename, same-model values, edit/copy/alternate draft, intercepted X intent, attachment reminder, V13-05 lock, 390×844 scaling/overflow, and zero live posts/writes.

# V13-05 X Attachment + Contribution Evidence cases

- URL matrix covers canonical/query/fragment/trailing-slash normalization and scheme/host/deceptive-host/credentials/path/username/status/length rejection without fetch or verification claim.
- Test exact public-only contribution V1 wire serialization, shared sign/nonce/attempt ownership, explicit one-attempt behavior, ambiguity/non-observation/mismatch/INVALID/UNVERIFIABLE gates, and exact VALID completion.
- Test deterministic public receipt JSON/Markdown, limitation, local copy/download, Evidence addition, truthful checklist, Rooms/My Agent/Evidence actions, mobile overflow, and all V13/V1.2 regressions with controlled writes only.

# V13-06 Product QA cases

- Walk the complete controlled Create → Backup → Verify → Profile → Publish → Verify → Card → Share → X reference → Contribution → Evidence → Ready flow from the production build.
- Capture and inspect Share/Card and Agent Ready at 1440×900, 1280×720, 768×1024, and 390×844; assert no page-level overflow and that Share/Ready progress remains visible on mobile.
- Assert new task-heading focus, one primary action, Card-before-X handoff, receipt actions, and transition to Rooms/My Agent/Evidence.
- Re-run Restore, Import, Lock, refresh/session limitation, identity/backup, publish ambiguity, read-back, INVALID/UNVERIFIABLE, Live Rooms, inert UGC, secret-boundary, full Chromium, and dependency audit coverage.
