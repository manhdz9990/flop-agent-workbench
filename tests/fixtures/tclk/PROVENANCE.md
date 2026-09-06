# tclk/1 Fixture Provenance

Official source: https://github.com/flop-labs/tclk

Pinned commit: `d48e87343200e3115e243df39e8f295f5ce2e645`

Package/spec version: `@flop-labs/tclk` 0.1.0, Alpha, inspected 2026-09-04.

- `offer` is copied byte-for-byte from `tests/vectors.test.ts` constant `OFFER_LINE` at the pinned commit.
- `receipt` is minimally instantiated from the required/optional field table in `SPEC.md` section 3 and `src/frames.ts`. The official vector contract id and payer DID are reused; optional rail/ref fields are omitted. It is structural coordination data only.
- `heartbeat` is derived exactly from the official frame constructed in
  `tests/live-wire-conformance.test.ts` lines 207–216: `type`, payer `from`, contract,
  and nonce are unchanged; only canonical JSON serialization and the required `tclk1 ` prefix
  are applied. Normative definitions are `SPEC.md` generated field table line 139 and section
  3.6 lines 218–224, plus `src/frames.ts` lines 134–152 and validation lines 368–372.
- `heartbeatHostile` adds only the optional `note` field allowed by those definitions, for inert
  content testing. The note value is local test data, not an upstream example.

Heartbeat is also publicly exported by `src/index.ts` lines 14 and 19, constructed by
`makeHeartbeat` in `src/frames.ts` lines 413–421, and bounded/decoded in the official
`tests/live-wire-conformance.test.ts` lines 237–261.

No transport signature, private key, seed, wallet secret, token, real asset credential, or value-bearing rail reference is included. The fixtures test passive wire recognition only.
