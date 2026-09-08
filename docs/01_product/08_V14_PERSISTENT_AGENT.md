# V1.4 Persistent Agent

After an owner creates or restores an Agent and produces a Workbench Backup V1 envelope, FLOP may save that encrypted envelope in this browser with the Agent's public DID, public key, validated self-declared profile, and bounded public evidence. A fresh page load recognizes the same Agent but always starts **Locked**.

Unlock requires the Backup Password and reuses browser-local Workbench Backup V1 decryption. The password and seed remain runtime-only. Lock zeroes the runtime seed while retaining encrypted state. Confirmed **Remove Agent from this browser** clears local saved/runtime state; it cannot delete the DID or public Technocore records, and later recovery requires the owner's backup file and password.

No account, login, cloud sync, server custody, recovery service, multi-Agent selector, plaintext secret persistence, nonce/publish persistence, automatic Technocore write, or X automation is included. Journey continuity may use only validated public profile data and exact evidence-qualified facts, never UI completion flags.
