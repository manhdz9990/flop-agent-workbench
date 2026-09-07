# Public Agent Card and X Share — V13-04

## Public model

`PublicAgentCard` contains exactly `displayName`, `publicDid`, `room`, `authoritativeSeq`, `algorithm`, `verification`, and `product`. Display Name is self-declared. `SIGNATURE_VERIFIED` describes only the independently verified first record. No session object, seed, Secret Key, password, backup, ciphertext, nonce, signature, or private metadata is accepted.

## Export

The DOM preview and browser Canvas renderer consume the same model. Export is PNG, 1600×900, filename `flop-technocore-agent-card.png`, with same-origin official FLOP logo and no server or external image service. Canvas text rendering keeps untrusted user strings inert.

## Share

Three deterministic English variants use only public card evidence and remain within 280 characters at supported maximum field lengths. The user can edit or copy the draft. Open in X uses an encoded compose intent and cannot attach the local PNG; UI requires manual attachment and manual Post. X_OPENED is an interaction state, not proof of a post. V13-05 attachment/contribution states remain incomplete.
