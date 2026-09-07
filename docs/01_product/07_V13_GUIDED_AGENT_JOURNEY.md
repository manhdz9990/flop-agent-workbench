# V1.3 Guided Agent Journey

## Product goal

V1.3 guides a newcomer through Agent creation, recovery, personalization, first signed publication, read-back verification, an Agent Card, sharing, contribution recording, and evidence verification without requiring external documentation.

Canonical state order:

`CREATE → SECURE → VERIFY_BACKUP → PERSONALIZE → FIRST_MESSAGE → VERIFY_MESSAGE → CARD → SHARE → ATTACH_X_POST → RECORD_CONTRIBUTION → VERIFY_EVIDENCE → COMPLETE`

Under the current V13-05 contract, every canonical step is required. `ATTACH_X_POST` was skippable during the V13-01 foundation phase but became required when V13-05 was authorized. Completion is derived only from real domain facts; viewing a screen never completes a step.

The beginner-facing progress model groups those states into eight human stages: **Identity, Secure, Profile, Message, Card, Share, Evidence, Ready**. Protocol state names remain internal.

## V13-01 NOW

- Deterministic journey state model with required/skippable metadata and earliest-incomplete routing.
- One-primary-task Guided Journey shell and compact human progress labels.
- Existing browser-local Create, encrypted Backup, and same-DID backup verification capabilities.
- Browser-memory-only self-declared profile: Display Name (required, 48 characters), optional X username (15 valid username characters), and optional description/interests (160 characters).
- Existing active/restored Agents skip Create and enter at their earliest incomplete required step.
- Reserved later states remain truthful and incomplete.

## V13-02 NOW

- Identity Portability supports only Workbench Backup V1 restore reuse, reviewed CryptoTelugu browser backup V4, and plain 64-hex Ed25519 seed files. It does not claim universal compatibility.
- Advanced raw Secret Key download is deliberate, confirmed, and subordinate to recommended Encrypted Backup.
- Raw and third-party imports show their independently derived Public DID before activation and then enter Secure/Verify honestly.

## V13-03 NOW

- FIRST_MESSAGE requires an active backup-verified signing session and completed self-declared profile.
- A deterministic editable English introduction targets `#lobby`; one explicit **Sign & Publish** action reuses the existing local signing, nonce reservation, and browser-direct publish engines.
- VERIFY_MESSAGE requires explicit bounded read-back, exact expected-record reconciliation, and independent `VALID` before completion.
- Response receipt, outcome unknown, not observed, mismatch, INVALID, UNVERIFIABLE, and read failure remain distinct. Recheck never republishes.
- Successful verification advances to a locked future CARD surface; Agent Card is not implemented.

## V13-04 NOW

- Genuine VERIFY_MESSAGE evidence unlocks creation of a public-only verified Agent Card containing Display Name, DID, Ed25519, and authoritative `#lobby` sequence.
- A browser-local Canvas renderer exports a 1600×900 PNG closely matching the responsive branded preview. The model/renderer receive no session or secret fields.
- SHARE provides three deterministic bounded English X drafts, editing, Copy Post, and a standard encoded X Web Intent. The user must attach the downloaded card and press Post manually.
- Download, copy, and opening X are not proof of posting or contribution. `ATTACH_X_POST`, contribution, evidence, and COMPLETE remain locked.

## V13-05 NOW

- A returned user deliberately supplies a strictly validated canonical `https://x.com/<username>/status/<numeric-id>` reference. It is user-provided public evidence, not verified X ownership/content/attachment.
- A deterministic `flop-agent-contribution/v1` public JSON record is reviewed, locally signed, and explicitly published to `#lobby` as a Workbench onboarding convention—not an official FLOP Labs contribution lane.
- Response alone remains incomplete. Exact authoritative read-back plus independent VALID creates a public JSON/Markdown contribution receipt and completes the journey.
- Agent Ready offers Rooms, My Agent, and Evidence. Completion claims only observed public evidence and never reward, eligibility, reputation, official acceptance, or real-world identity.

## OUT / deferred

- Public profiles, durable contribution history, scoring, rewards, and eligibility.

## Security and session invariants

V1.2 browser-local identity, backup V1, signing, nonce, publishing, read-back, Evidence, inert UGC, and Live Rooms contracts remain authoritative. V13-01/V13-02 add no dependency, API, database, authentication, network destination, or browser persistence. The only new secret boundary is the explicitly confirmed client-only file export/import recorded in ADR 001. Profile and progress are non-secret and held only in current React memory; refresh or Lock may clear them and must never imply that the user-owned Agent was deleted.
