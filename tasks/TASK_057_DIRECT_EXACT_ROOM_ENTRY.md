# Task 057 — Direct Exact Room Entry

## Goal

Allow a user to open a valid official Technocore room name that is absent from bounded discovery, using the existing Rooms selected-room pipeline.

## Acceptance

- Exact names are checked by the existing canonical room-name validator.
- Valid submission calls the existing selected-room transition and reader.
- Invalid names cause no read or write.
- Room switching retains the existing draft and in-flight presentation reset.
- Heading, composer, refresh/live reads, signing, publishing, read-back, and Evidence remain bound to the one selected room.
- Discovery selection remains unchanged.
- Full local regression gates pass; no live write, release, commit, push, deployment, or X post occurs.

## Status

LOCAL IMPLEMENTATION COMPLETE — PRODUCT OWNER REVIEW PASSED — V1.5.1 RELEASE AUTHORIZED.

Verification: typecheck PASS; 33/33 test files and 436/436 tests PASS; ESLint PASS with zero warnings; production build PASS; Chromium E2E 26/26 PASS; focused security regression 2/2 files and 11/11 tests PASS; offline dependency audit PASS with 0 vulnerabilities; diff/whitespace check PASS.
