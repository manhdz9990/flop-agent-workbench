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
