# User Flows

## Primary flow
1. User opens Home / Inspect.
2. Selects Room, Message, DID, or Export.
3. Enters a room/message reference or DID, or chooses a local JSONL export.
4. Product validates the input locally before any network request.
5. For Room/Message, product reads only allowlisted Technocore read endpoints constructed from validated identifiers. Export stays local. DID inspection is local unless room/message context is supplied by the chosen input flow.
6. Product parses evidence, verifies deterministically, analyzes sequence/retention/room class/tclk shape.
7. Trust Report shows Evidence Verdict, Evidence Boundaries, Transcript Integrity, Protocol Context, and warnings.
8. User opens a Message Detail row for exact field-level explanation.

## Failure flow
Invalid input → inline validation. Network/parser/server failure → operational error, never INVALID. Malformed export → line-specific parse failure with safe partial summary only where evidence is independently valid.

## V12-05 guided newcomer flow

1. User explicitly creates a browser-local Ed25519 identity or imports an existing encrypted identity backup.
2. A new identity creates and downloads its encrypted recovery file. Download alone does not unlock signing.
3. User selects the encrypted file and enters its passphrase. Existing local import/decrypt must authenticate it and produce the matching DID with `VERIFIED` backup status.
4. User enters an introduction in default room `lobby`, then explicitly prepares an exact review of room, DID, nonce, post-sweep text, and canonical payload.
5. A separate explicit action signs that reviewed payload locally. Editing room or text invalidates the actionable signed descriptor and never auto-signs.
6. A second explicit action performs the single V12-03 browser-direct publish attempt. Response and ambiguous outcomes remain verification-pending/unknown, never success or failure claims.
7. User explicitly checks bounded room evidence through V12-04. Only exact observed evidence plus independent `VALID` is published-and-verified; absence and operational failure retain their bounded meanings.
8. When evidence exists, the user views or downloads the existing deterministic JSON/Markdown receipt with its limitations.

The visual sequence does not grant capabilities. Domain state gates signing, publishing, read-back, and receipt availability. The existing public-evidence debugger remains independently available from Start.

## V12-06 Workbench integration flow

Home presents two equal groups. **Get Started** contains Create Agent Identity, Import Identity Backup, and Publish My First Signed Message; all three host the single guided flow and retain its security gates. **Inspect & Debug** contains Explore Public Rooms, Debug a Message, Analyze an Export, and Inspect a DID / Key with their existing behavior.

An unlocked identity may appear as a shortened public DID in the Workbench header while the full DID remains inspectable. Selecting it opens the existing DID inspector input. After a verified read-back with an observed sequence, the user may open existing Message Debug with room and sequence prefilled. These navigation actions transfer only public evidence and do not automatically fetch, inspect, sign, publish, retry, or poll.

The active identity holder is page-runtime memory only. Browser refresh or tab closure loses it; no persistence or account semantics are introduced.

## Revised post-validation Workbench flow

V12-08A adds a Rooms / Chat surface: browse bounded public rooms, select one retained conversation, refresh it manually, inspect an observed message through the existing debugger, and—only with an eligible unlocked and verified local identity—compose, review, sign locally, explicitly publish once, and manually check publication using the existing V12-02 through V12-04 engines. It introduces no automatic polling, crawler/archive, server write relay, or persistence.

V12-08B then provides a dedicated My Agent workspace for the current runtime-memory identity: public DID, session/backup state, restore and lock/clear actions, DID inspection, and links to observed own evidence where available. It is not an account, wallet, authentication system, persistent profile, or real-world identity assertion.

V12-08C then provides Evidence / Observed Activity for locally or session-observed signed activity, verification status, room/message references, receipts, and diagnostics. Observed activity is not a contribution, reward, eligibility, reputation, trust, or official-credit score and is not a global archive.

V12-08D audits the combined integration and security boundaries before V12-09 visual polish. V12-10 performs final regression and release preflight; final release review and deployment each require explicit authorization.

## Existing Agent restore and unloaded-session flow

Agent ownership is distinct from the currently loaded browser session. Refresh, tab close, browser restart, or Lock clears the unlocked runtime holder, but the UI must not imply that the user-owned Agent ceased to exist.

For an unloaded session, **Create New Agent** is the sole filled primary CTA for a new user. Directly below it, **Already have an Agent? Restore Agent** is a secondary text action for a returning owner. The Create flow clearly warns that creation produces a new DID and retains a path to restore instead. Restore selects the existing Encrypted Backup V1 JSON, accepts the Backup Password, validates and decrypts locally, re-derives the DID, requires it to match the envelope DID, and loads that same Agent into the existing runtime holder as ready to sign. Successful restore shows the recovered Public DID, local-decryption/DID-match/readiness confirmations, and an Open Technocore Rooms action. No persistent login, raw-secret storage, server recovery, or second backup/recovery engine is introduced.

Final lifecycle hierarchy: unloaded Home hides Agent-dependent status cards and keeps Public Rooms and Developer Tools available without implying an error. The unloaded header says only **No Agent loaded**. Once an Agent exists, useful Identity/Backup/First Record/Evidence status cards appear; the Home next action is backup verification until protected, then **Agent ready → Open Technocore Rooms**. The active header shows only a shortened Public DID and opens My Agent. Lock or refresh returns to the same unloaded Create/Restore entry without deletion language.
