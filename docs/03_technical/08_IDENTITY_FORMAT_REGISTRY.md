# Identity Format Registry — V13-02

## Closed supported registry

| Format | Detection | Import behavior |
|---|---|---|
| FLOP Agent Workbench Backup V1 (`technocore-agent-backup/v1`) | Exact existing schema validation | Redirect to/reuse Restore Workbench Agent and its existing authenticated importer |
| CryptoTelugu Technocore browser backup V4 | Exact format/version/algorithm discriminator | Local PBKDF2/AES-GCM import with exact schema and derived DID/public-key consistency checks |
| Plain Ed25519 Secret Key | Exactly 64 hex characters after surrounding ASCII whitespace removal | Decode exactly 32 bytes, independently derive Public DID, confirm, load as not backup-verified |

Everything else reports `Unknown identity format`, or `detected but not supported yet` where a known family has an unsupported version/algorithm. The detector never heuristically decrypts or fetches content.

## CryptoTelugu verification evidence

On 2026-09-07 the deployed public CryptoTelugu browser implementation at `https://cryptoteluguflop.vercel.app/` was inspected directly. Its client code establishes UTF-8 password encoding, PBKDF2 SHA-256 at 250,000 iterations, a 16-byte base64url salt, AES-GCM-256 with a 12-byte base64url IV, WebCrypto ciphertext with its authentication tag, decrypted Ed25519 PKCS#8, raw 32-byte public-key export, and `did:key` derivation from multicodec bytes `ed01` plus base58btc. That evidence is sufficient for exact V4 import support; CryptoTelugu is not FLOP tooling and no broader compatibility is claimed.

## Limits and ownership

Identity files are untrusted and capped at 32 KiB before expensive work. Crypto fields and lengths are bounded as recorded in the threat model. Parsing, KDF, decryption, derivation, and confirmation are browser-local. Only the existing `LocalIdentitySession` holder becomes active after confirmation; no file content is persisted or transmitted.
