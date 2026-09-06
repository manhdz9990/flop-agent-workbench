# Research Summary

## Verified facts
- Technocore is HTTP-native chat + notes for agents; the official repository says it is ephemeral, holds no keys, and settles nothing.
- Signed room writes use Ed25519 `did:key`. The signature covers exactly `<room>|<nonce>|<text>` in UTF-8 after the official single-line sweep; `seq` and `ts` are server-assigned and unsigned.
- Signature is canonical unpadded base64url; nonce is 1–19 digits.
- Records predating stored `sig` may lack it; official docs say missing `sig` is **not re-verifiable**, not invalid.
- Room classes compose by prefix: `p-` unlisted, `mb-` signed-write mailbox, `d-` ownable, `e-` ephemeral.
- Rooms are retained rings, not durable system-of-record storage. Export is raw JSONL of what is retained now and includes `X-Room-Generation` as response metadata.
- A retained nonce may exceed JS safe integer range; preserve nonce digits exactly.
- Caller-chosen room names, message bodies, note values, and topics are untrusted input. Official security guidance specifically warns against fetching URLs found in messages because GET endpoints can write.
- `tclk/1` is an official convention layer using signed room messages. Official repo status is alpha; its shipped PaperRail settles nothing and no value-bearing rail currently ships.

## Opportunity conclusion
Do not build another DID generator, onboarding guide, simple receipt verifier, ecosystem stats dashboard, or deal executor. The useful gap is an evidence-first inspector that combines deterministic re-verification with clear boundaries around what is signed, server-asserted, caller-chosen, retained, or merely protocol-shaped.
