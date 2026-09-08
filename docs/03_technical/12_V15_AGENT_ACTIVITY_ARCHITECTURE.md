# V1.5 Agent Activity Architecture

## Canonical ownership

`lib/evidence-activity` remains the authoritative runtime evidence model and the existing read-back engine remains the only qualification source. `lib/contribution/activity.ts` is a projection from exact `READBACK_VERIFIED + PUBLISHED_AND_VERIFIED + VALID` evidence whose canonical contribution JSON, writer, room, sequence, and Evidence Receipt source all agree.

The projector supports unchanged onboarding `flop-agent-contribution/v1` Agent Card records and direct `flop-agent-contribution/v2` X-reference records. The latter removes the onboarding-only first-record prerequisite for later activity while retaining the same local signer, nonce reservation, publish-once, read-back, and verifier owners.

The existing `flop.workbench.persistent-agent.v1` storage key remains the sole storage boundary. Its record schema advances from `flop-persistent-agent/v1` to `/v2`; both V1 and V2 loads deterministically rebuild contributions from all retained qualifying evidence. This backfills V1.3 onboarding evidence and repairs early V2 records whose projection index was empty. The encrypted backup bytes are never changed by migration. Malformed or forged projections are discarded and reconstructed only from valid retained evidence, leaving the encrypted Agent intact.

At most 50 contributions are retained. New unique authoritative evidence is appended and the oldest entry is removed first. Identity is `room + public DID + authoritative sequence`; X URL is intentionally not a deduplication key.

Persisted contribution fields are public contribution JSON, lobby room, authoritative sequence, `SIGNATURE_VERIFIED`, and the existing public contribution/protocol receipt. No seed, Secret Key, Backup Password, decrypted backup, nonce reservation, pending attempt, signing draft, account, database, cloud state, or second persistence system exists.
