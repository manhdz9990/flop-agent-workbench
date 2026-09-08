# V1.4 Persistent Agent — Product Owner Acceptance

Status: PASS — Product Owner completed manual acceptance on 2026-09-08.

Accepted flow: Persisted Agent → refresh → Locked → Unlock → refresh → Locked → Lock Agent → Remove Agent from this browser → Restore from encrypted backup. The restored Public DID exactly matched the original. No release blocker was reported.

Use a disposable Agent and perform no Technocore or X write. In order verify: create encrypted backup; refresh to Locked with exact DID; wrong password remains locked; correct password unlocks; Lock retains public context; new tab/browser restart is Locked; profile and qualified Evidence continuity; Rooms reads while locked and gates signing; Remove confirmation truth/cancel/confirm; restoration of the same backup; corrupt-storage recovery; desktop and 390 px layout/accessibility with no overflow or hidden critical action.

Automated coverage must include encrypted round-trip, absence of password/seed fields, storage absence/removal, bounds, corrupt/schema/profile/evidence rejection, DID/public-key binding, locked identity behavior, and the full existing regression gate.
