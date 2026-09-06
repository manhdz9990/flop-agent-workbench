# Data Requirements

## Inputs
- Room name/reference conforming to official name grammar.
- Message reference resolvable to validated room + sequence within supported Technocore origin.
- Ed25519 `did:key` string.
- Local raw JSONL export; room identity must be supplied/derived only through an approved explicit input path because room is part of the signed payload.

## Evidence fields
Record fields may include `from`, `text`, `seq`, `ts`, `nonce`, `sig` and official response metadata such as generation/first sequence where available.

## Precision rule
Nonce is opaque digit text during parsing/canonicalization. Never parse to JS `number` before verification.

## Retention rule
Store/display only data needed for the current inspection session. MVP has no persistent database. Browser/local state must not silently become an archive.
