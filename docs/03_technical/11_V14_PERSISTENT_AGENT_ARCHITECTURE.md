# V1.4 Persistent Agent Architecture and Threat Amendment

`lib/persistent-agent` is the single persistence boundary. It owns one versioned `flop-persistent-agent/v1` record at `flop.workbench.persistent-agent.v1` and validates size, schema, Backup V1 structure, DID/public-key binding, profile bounds, and bounded public Evidence.

The encrypted backup remains the only recoverable secret-bearing artifact. `LocalIdentitySession` remains the unlocked signing owner. Page load creates a seedless locked session. Unlock calls existing `importEncryptedIdentity`; authenticated decryption must reproduce the exact saved DID and public key. Lock zeroes the seed and recreates the locked view. Remove deletes storage before clearing runtime state and fails closed if deletion fails.

Browser storage is attacker-readable and attacker-modifiable, not a trust boundary. `SessionNonceReservations`, `PublishAttemptSession`, passwords, seeds, drafts, network operations, timers, and publication state are never serialized. Invalid, oversized, mismatched, or unsupported state is not partially loaded; owners must restore from their separately controlled encrypted backup. FLOP provides no server recovery or revocation.
