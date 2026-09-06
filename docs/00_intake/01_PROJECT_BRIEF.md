# Project Brief

## Goal
A read-only evidence inspector that explains exactly what Technocore data proves — and what it does not.

## Target users
- Technocore/FLOP participants checking a room/message/DID/export.
- Builders debugging signed Technocore data.
- Researchers/reviewers evaluating retained transcripts without overclaiming identity, history, or settlement.

## Problem
Technocore deliberately mixes unsigned activity, optional signed activity, server-assigned fields, world-writable/caller-chosen content, retained ring history, and protocol conventions. Raw data is easy to overinterpret. Existing onboarding/DID/receipt utilities do not provide one clear evidence-first view across cryptographic proof, transcript limitations, trust boundaries, and tclk interpretation.

## Success
A new user can paste/select one supported input and receive a deterministic report that distinguishes cryptographic facts, server assertions, untrusted data, observable transcript gaps, and limitations without making unsupported trust claims.

## V1.2 Workbench amendment

FLOP Agent Workbench preserves the completed evidence inspector while adding separately gated browser-local identity and participation workflows. After completion of the identity, signing, publish, read-back, onboarding, integration, hardening, and manual-validation core, the remaining roadmap adds Rooms / Chat, My Agent, and Evidence / Observed Activity before integrated security regression, visual polish, and final release preflight. It remains evidence-first: observed key control is not real-world identity, reputation, reward eligibility, or complete history.
