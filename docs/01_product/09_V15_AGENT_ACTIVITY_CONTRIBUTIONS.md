# V1.5 Agent Activity & Contributions

## Product contract

My Agent presents the Agent's lock state, public identity, and a bounded **My Contributions** list. The list means only that this Workbench observed the exact expected public contribution record and the existing verifier returned `VALID`. It is not a complete Technocore history and does not establish FLOP Labs approval, identity, trust, quality, payment, rewards, reputation, or eligibility.

Only existing `READBACK_VERIFIED` evidence in `PUBLISHED_AND_VERIFIED` state qualifies. Clicks, local progress, publish responses, outcome-unknown states, manually claimed references, unrelated same-DID records, and non-`VALID` verdicts never qualify.

My Contributions is public local context and remains viewable while the Agent is Locked. Adding a contribution requires an Unlocked Agent and reuses the established X URL, exact review, local signing, one publish attempt, explicit authoritative read-back, independent verification, and Evidence Receipt flow. No X ownership or content is verified.

The first contribution does not require a previous Agent Card or contribution. The direct V1.5 record contains the public DID and canonical X reference; it becomes durable activity only after that exact record is authoritatively observed and independently verified `VALID`. Historical V1.3 Agent Card contributions use their unchanged V1 wire record and qualify through the same projector.

The empty state says no verified contributions have been recorded by this Workbench; it makes no claim about all activity by the DID.
