# Scope

## NOW — locked MVP
- Room Inspect
- Message Inspect
- DID Inspect
- JSONL Export Inspect
- deterministic signature verification
- exact canonical/sweep handling
- VALID / INVALID / UNSIGNED / UNVERIFIABLE
- signed vs server-asserted vs untrusted field explanation
- sequence gap detection
- retention/export limitations
- room-class explanation
- safe untrusted-content rendering
- basic official tclk/1 detection

## NEXT
- Conformance-oriented protocol fixtures/test explorer.
- Deeper tclk state explanation only after MVP evidence model is proven useful.

## LATER
- Full Conformance Lab as a separate product surface/module if ecosystem demand exists.

## OUT — locked
DID generation; signing/writes; key custody; wallets; account/login; global archive; reputation score; AI trust judgement; airdrop logic; full tclk deal execution; settlement; conformance-test suite.

## V1.2 scope amendment

The sections above record the historical V1.1 read-only debugger scope. For V1.2, browser-local Ed25519 identity generation, encrypted identity backup creation/import, temporary session-memory identity handling, and later separately authorized browser-local signing and explicit browser-direct publishing are no longer categorically out of scope.

V12-01 authorizes only the identity and encrypted-backup foundation. It does not authorize signing or any network write.

The following remain out of scope: server-side secret handling or signing; server write relays; persistent plaintext secret custody; raw seed/private-key paste; automatic/background signing or publishing; arbitrary write destinations; wallets; blockchain signing; balances; faucets; airdrops; rewards or eligibility claims; contribution, reputation, ranking, or trust scores; AI judgement; server persistence/databases; generic social feeds; crawlers/global archives; tclk execution or settlement claims; payment verification; and speculative FLOP settlement behavior.

## Revised V1.2 product scope after manual validation

### NOW

- Rooms / Chat over bounded public Technocore room evidence.
- My Agent for the currently active browser-local identity.
- Evidence / Observed Activity based only on locally/session-observed records.
- Existing guided onboarding, debugger/diagnostics, Evidence Receipt, and public-room exploration.

### NEXT

- Mailbox / agent-to-agent messaging.
- Owned, private, and ephemeral room management.
- Richer Agent profile based only on observed evidence.
- Evidence Bundle.
- Reusable composer improvements.

### LATER

- Official FLOP testnet integrations once stable.
- Compute/inference workflows.
- FLOP transaction/evidence adapters.
- tclk rail evidence integrations.

### OUT for current V1.2

- Contribution/reward scoring, airdrop/eligibility, and reputation/trust scoring.
- Wallet/token balance, blockchain signing, or settlement claims.
- Social-feed features or AI chatbot behavior.
- Server custody, server persistence, crawler, or global archive.
