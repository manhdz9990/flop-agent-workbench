---
name: feature-builder
description: Builds one approved feature or phase with minimal scope expansion and explicit verification.
---

# Feature Builder

## Before Code
- identify the feature
- read requirements
- inspect existing code
- identify files and dependencies
- define verification

## Build
- make the smallest sufficient change
- preserve working behavior
- implement loading/error/empty states where relevant
- avoid unrelated refactors

## Verify
- run relevant checks
- compare against acceptance criteria
- update `PROJECT_STATUS.md`
- report verified and unverified items
