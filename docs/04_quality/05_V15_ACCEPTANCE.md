# V1.5 Acceptance Criteria

- Exact authoritative contribution evidence with independent `VALID` verification is persisted and survives refresh.
- Public list/detail and receipt download remain available while Locked; new signing remains disabled until Unlock.
- Non-observed, unknown, mismatched, unrelated, `INVALID`, `UNSIGNED`, and `UNVERIFIABLE` states do not qualify.
- Authoritative duplicates are suppressed; the same X URL at distinct authoritative sequences remains distinct.
- Retention is deterministic and bounded at 50 newest entries.
- V1.4 records migrate without changing encrypted backup data; malformed contribution projections fail closed.
- Removing the saved Agent removes its local contributions; locking does not.
- Add Contribution reuses existing signing, nonce, publish-once, read-back, verifier, Evidence, and receipt owners.
- An Unlocked persisted Agent with zero contributions reaches the X-reference step without requiring an earlier record; Locked remains blocked.
- Qualifying historical onboarding evidence is backfilled for both V1 and early-V2 saved records, without duplicates.
- Untrusted X and Technocore strings render inertly and are never fetched merely to display activity.
- Full repository typecheck, unit/integration, lint, production build, Chromium E2E, security regression, and dependency audit pass with zero automated live writes/X posts.
