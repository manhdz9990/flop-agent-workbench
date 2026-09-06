# Claude Code Project Briefing

Read `AGENTS.md` first. It contains the canonical project operating rules.

## Start Here

1. `PROJECT_STATUS.md`
2. relevant active plan in `plans/`
3. `docs/03_technical/07_BUILD_HANDOFF.md`
4. relevant requirements and acceptance criteria
5. existing implementation

## Default Behavior

Use plan-first behavior for substantial tasks.

Before coding:
- understand the task
- inspect relevant code
- identify acceptance criteria
- identify risk
- make the smallest sufficient plan

After coding:
- run relevant checks
- verify acceptance criteria
- update `PROJECT_STATUS.md`
- report exactly what was and was not verified

## Skills

`.agents/skills/` is the canonical, portable source for skill definitions (see `AGENTS.md`). `.claude/skills/` is a Claude Code–specific adapter that mirrors that content for this tool. Use the matching skill when the task concerns:
- product execution
- feature implementation
- bug fixing
- testing
- release/operations

If `.claude/skills/` and `.agents/skills/` ever disagree, treat `.agents/skills/` as authoritative.
