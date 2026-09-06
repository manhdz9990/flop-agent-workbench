# ADR 005 — Selected-room bounded auto-refresh

## Status

Accepted for V12-09R R4B.

## Decision

After explicit room selection, Rooms uses one self-scheduling five-second timeout. The delay begins only after the previous bounded read settles. The lifecycle runs only while the selected conversation is active, the component is mounted, and the document is visible. One request may be active; switching or cleanup aborts and invalidates the old generation.

The scheduler calls only the existing same-origin bounded Room inspection path. Room discovery remains manual. General conversation observation never updates `PublishAttemptSession`, triggers publication read-back verification, reserves/burns a nonce, signs, publishes, or adds Evidence.

## Consequences

The selected retained view can feel current without realtime, streaming, synchronization, completeness, or publication-verification claims. A hidden or inactive workspace generates no periodic reads. Failures preserve the previous successful view and wait for normal cadence or explicit manual refresh.
