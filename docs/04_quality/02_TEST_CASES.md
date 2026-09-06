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
