# Project Agent Instructions

## Mission

Turn the approved product specification into a reliable product with minimum ambiguity and minimum rework.

## Mandatory Operating Loop

READ
→ UNDERSTAND
→ CONFIRM
→ PLAN
→ IMPLEMENT
→ TEST
→ VERIFY
→ REVIEW
→ UPDATE PROJECT_STATUS
→ REPORT

- CONFIRM = validate scope, assumptions, dependencies, and understanding before implementation.
- VERIFY = verify actual behavior and acceptance criteria after implementation/testing.

## Hard Gates

### Gate A — Before Coding
Do not implement until:
- the relevant requirements are understood
- the active phase is known
- acceptance criteria exist or can be derived from approved requirements
- architecture impact is understood
- major ambiguity is resolved

### Gate B — Before Phase Completion
Do not mark a phase complete until:
- planned requirements are implemented
- relevant tests have run
- acceptance criteria were checked
- known failures are reported
- `PROJECT_STATUS.md` is updated

### Gate C — Before Production
Do not deploy until:
- production configuration is reviewed
- secrets are not committed
- backups and rollback are considered
- deployment checklist is complete
- production verification is planned

## Source of Truth

Follow the priority order in `README.md`.
If sources conflict, do not silently choose. Explain the conflict and ask for a decision when the impact is material.

## Skill Routing

`.agents/skills/` is the canonical, portable location for skill definitions. Tool-specific copies (e.g. `.claude/skills/`) are adapters that mirror this content for a specific tool — they are not the source of truth. If a tool-specific copy and `.agents/skills/` disagree, `.agents/skills/` wins.

Route work to skills as follows:
- `product-executor` → new project/product planning
- `feature-builder` → feature implementation
- `bug-fixer` → bug investigation and repair
- `tester` → testing and verification
- `release-operator` → release/deployment preparation

## Rule and Workflow Adapters

`.agents/rules/` and `.agents/workflows/` are portable adapters derived from this file (`AGENTS.md`) and other canonical project files. They do not carry independent authority and must not override `README.md`, `AGENTS.md`, `PROJECT_STATUS.md`, or `.agents/skills/`.

`.claude/*` (including `.claude/skills/`) are tool-specific adapters only, scoped to Claude Code.

If any adapter conflicts with its canonical source, the canonical source wins and the adapter is treated as stale until synchronized.

## Scope Control

Never:
- invent user-facing requirements
- add features because they seem useful
- rewrite unrelated working code
- silently change architecture
- claim a test passed when it was not run
- claim browser or production verification without actually doing it

## Change Control

For non-trivial work, first identify:
- goal
- files likely affected
- dependencies
- risks
- tests
- rollback or recovery path when relevant

## Context Management

Read only the context needed for the current task, then use `PROJECT_STATUS.md` as the primary continuation point.

When a decision changes architecture, behavior, infrastructure, or an external integration:
1. create/update an ADR
2. update affected specifications
3. update the implementation plan if needed
4. record the decision in `PROJECT_STATUS.md`

### Task Files

Create a file in `tasks/` when work is:
- independently executable
- non-trivial
- likely to be handed between agents or sessions
- in need of explicit acceptance criteria

Do not create a task file for trivial, single-step edits — proceed directly and report the change.

## Definition of Done

A task is done only when:
- the requested behavior exists
- expected failure states are handled
- relevant tests/checks are performed
- acceptance criteria are checked
- documentation/status is updated when behavior or architecture changed

## User Communication

Before substantial implementation:
- summarize understanding
- state assumptions
- identify risk
- present the plan

After work:
- summarize changes
- list files changed
- list commands/tests run
- list verified and unverified items
- state known issues
- state the exact next action

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
