# UI Specification

## Visual direction
**Dark Infrastructure Grid** — premium dark canvas, subtle low-contrast technical grid/noise, restrained cyan/indigo accents, high-contrast data surfaces. Background supports hierarchy and never competes with report text. No excessive glow, particles, parallax, or decorative animation.

## Information architecture
**Home / Inspect → Trust Report → Message Detail**.

## Home / Inspect
- Hero: concise value proposition: “See what Technocore evidence proves — and what it doesn’t.”
- Four input tabs: Room / Message / DID / Export.
- One primary input area and Inspect CTA.
- Persistent compact notice: read-only; never paste seeds/private keys.
- Export: drag/drop or file picker; JSONL only; processing is local in MVP.

## Trust Report
Desktop: 12-column layout; main report 8 columns + evidence/context rail 4 columns. Mobile: single column.

Order:
1. Input identity + room class/context.
2. Evidence Verdict summary with counts/states.
3. Evidence Boundaries: Signed / Server assertions / Untrusted.
4. Transcript Integrity: observed seq range, gaps, retained-window warning, generation metadata when available.
5. Messages table/list.
6. Basic tclk/1 interpretation panel only when detected.

## Message Detail
- State badge + plain-language meaning.
- Exact evidence inputs used: room, nonce as text, stored/swept text, DID, signature presence.
- Field classification table: signed / server assertion / untrusted.
- Canonical payload explanation; raw bytes/technical detail may be collapsible but no new feature beyond inspection.
- tclk detection explanation if applicable.
- Never render message HTML.

## States
- VALID: “Signature matches the exact signed payload.” Secondary warning: proves key control for this signature, not identity/truth/reputation.
- INVALID: “Signature evidence is present but does not verify under the official rules.”
- UNSIGNED: “No cryptographic signature evidence for this message.” Neutral, not error.
- UNVERIFIABLE: “Required retained evidence is missing, so this record cannot be re-verified.” Neutral/amber; explicitly “not the same as Invalid.”

## Loading / empty / error
Skeleton only for network reads. Empty room/export is an empty state, not failure. Parser/network/server failures use operational error surfaces separate from verdict colors. Invalid input stays inline near input.

## Responsive
Desktop report table may use columns; <=768px switches to stacked message cards and stacked evidence sections. Long DID/signature/text wraps safely; no horizontal page overflow.

## V1.2 post-validation information-architecture amendment

Before the V12-09 visual overhaul, the Workbench adds functional surfaces in this order: Rooms / Chat, My Agent, Evidence / Observed Activity, then an integration/security regression phase. Rooms uses a rooms list → selected retained conversation → message inspection → composer/action-area hierarchy and manual refresh only. Technical proof remains accessible without implying durable history, trust, reputation, or real-world identity.

### Current V1.2 Rooms amendment

The Technocore-aligned Rooms Product Owner contract supersedes the prior Rooms viewer and visible Review → Sign → Publish → Check normal path. The selected-room surface is a viewport-bounded live chat with dense `seq · short author · message · verification · relative server time` rows, click-only technical evidence, intelligent scroll/unseen count, and a persistent 44–92 px composer. Enter sends and Shift+Enter inserts a newline. Ready-agent sending reuses the existing browser-local security owners underneath; response receipt is not verification, and only exact authoritative observation plus independent VALID verification reconciles the optimistic row. The normal UI has no prominent refresh control or large direct-access card. No general Rooms message-length limit is introduced.

Product-owner manual review found that the existing Get Started entries are insufficiently distinct, onboarding is visually too long, technical evidence is too prominent for newcomers, and the hierarchy still resembles a protocol debugger more than a complete Agent Workbench. Machine-translated Agent terminology may also confuse users where present. These are explicit V12-09 inputs and are not corrected by the roadmap reconciliation.
