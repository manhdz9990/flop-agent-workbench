# ADR 004 — V12-04 Exact Read-back Verification Boundary

## Status

Accepted for V12-04 on 2026-09-05.

## Decision

Read-back is a separate read-only operation after a recorded V12-03 attempt. It reads the prepared room through the existing bounded fixed-origin reader. Publication is verified only when a retained record exactly matches the prepared DID, nonce, post-sweep text, and signature and the existing V1.1 protocol verifier returns `VALID` for that room and record.

Sequence and timestamp are unsigned server evidence and do not participate in signed-evidence matching. Source order resolves multiple exact retained candidates deterministically; multiplicity is reported without claiming which transport attempt caused any record.

No attempt yields `NOT_ATTEMPTED`. No matching retained evidence yields the cause-neutral `NOT_OBSERVED`. Related evidence that does not independently verify yields `OBSERVED_BUT_NOT_VERIFIED` with the actual existing evidence verdict. Reader/network/parser failure yields `READBACK_UNAVAILABLE` as operational evidence, never a cryptographic verdict.

## Consequences

An observed HTTP response is insufficient, while a previously ambiguous `OUTCOME_UNKNOWN` attempt can later become verified through exact independent evidence. Read-back never writes, retries, re-signs, selects a replacement nonce, unburns a nonce, polls, or claims complete history or causality. Existing diagnostics, pipeline, receipt, protocol, tclk, and evidence semantics remain authoritative.
