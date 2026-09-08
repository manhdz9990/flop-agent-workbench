# TASK 056 — V1.5 Agent Activity & Contributions

**State:** COMPLETE / LOCAL PASS / PRODUCT OWNER REVIEW REQUIRED.

## Scope

Add beginner-facing persistent My Contributions to My Agent by projecting only existing exact authoritative `VALID` contribution evidence into the canonical persistent Agent record. Provide empty/list/detail/receipt and Add Contribution states while preserving V1.4 locking and every established protocol owner.

## Decisions

- Schema: `flop-persistent-agent/v2`, stored under the unchanged canonical V1 key.
- Migration: deterministic rebuild from retained V1 public evidence; encrypted backup unchanged.
- Bound: newest 50; oldest-first eviction.
- Deduplication: exact authoritative room + DID + sequence.
- X URL is untrusted, unverified, and not a deduplication key.
- No second storage, contribution, evidence, signing, nonce, publishing, or read-back engine.
- Product Owner blocker correction: direct V1.5 contributions do not reuse the onboarding-only Agent Card first-record prerequisite; all saved-record versions backfill their contribution projection from authoritative Evidence.

## Acceptance

See `docs/04_quality/05_V15_ACCEPTANCE.md`. Completion requires all repository gates, security/diff review, status reconciliation, and Product Owner manual review. Commit, push, deploy, live Technocore writes, and X posts are prohibited.
