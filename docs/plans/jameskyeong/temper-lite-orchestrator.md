# Plan: temper lite orchestrator (v2.0 M1 Week 1)

> ⚠️ Historical document — written under v1 names. See [ADR 0002](../adr/0002-mekaknight-rebrand.md) for the v2 rebrand. Command mapping: `temper`→`forge`, `harden`→`lock`, `ship-ready`→`launch`, `setup-issue`→`link`, `report-issue`→`tag`, `resolve-issue`→`strike`.

## Goal
Replace the external-dependency workflow orchestrator with a self-contained `temper` skill that embeds core development philosophies directly.

## Tasks

### Task 1: Move existing workflow to workflow-external
- **Move** `skills/workflow/SKILL.md` → `skills/workflow-external/SKILL.md`
- **Update** frontmatter `name:` from `jameskill:workflow` to `jameskill:workflow-external`
- **Test**: `ls skills/workflow-external/SKILL.md` exists, `skills/workflow/SKILL.md` does not
- **Commit**: `refactor: preserve v1.x workflow as workflow-external`

### Task 2: Create temper SKILL.md
- **Create** `skills/temper/SKILL.md` with the full lite orchestrator
- **Phases**: Preflight → Clarify → Route (DIRECT/PLAN) → Build (strict TDD) → Peer-review (Agent-based) → [Ship-check slot] → Verify (lint+typecheck+test+architecture+direct output) → Finish (4 options)
- **Embedded philosophies**:
  - Clarify: relentless questioning until ambiguity checklist = 0, then user confirmation
  - Build: strict RED → GREEN → REFACTOR loop, no exceptions
  - Cross-cutting verify gate: no soft language, direct output inspection at every phase boundary
  - Peer-review: Agent tool with Standards + Spec two-axis prompt
  - CONTEXT.md: optional reference (read if exists, skip if not)
  - Ship-check: empty slot with activation note
  - Finish: 4 choices (merge/PR/keep/discard)
- **PLAN route details**:
  - LLM auto-generates plan file in `docs/plans/<slug>.md`
  - User confirms before execution
  - Sequential task execution with TDD per task
  - Docs checkpoint (separate commit) before build starts
- **Unsupported routes guidance**: DIAGNOSE/PROTOTYPE/PRD → inform user, suggest alternatives
- **Test**: Skill file is valid markdown with correct frontmatter
- **Commit**: `feat: add temper — self-contained development orchestrator`

### Task 3: Update resolve-issue to reference temper
- **Edit** `skills/resolve-issue/SKILL.md` Step 6b:
  - `jameskill:workflow` → `jameskill:temper`
  - Update phase description line to match temper's phases
  - Update fallback message ("If `jameskill:temper` is not available...")
- **Test**: `grep "jameskill:temper" skills/resolve-issue/SKILL.md` finds references
- **Commit**: `refactor: update resolve-issue to invoke temper instead of workflow`

### Task 4: Update CLAUDE.md
- **Edit** project CLAUDE.md to reflect new skill names:
  - `/workflow` → `/temper` in Available Skills
  - Description update
- **Test**: `grep "temper" CLAUDE.md` finds reference
- **Commit**: `docs: update CLAUDE.md for temper rename`

## Dependencies
- Task 1 must complete before Task 2 (directory slot freed)
- Task 2 must complete before Task 3 (temper must exist for resolve-issue to reference)
- Task 4 is independent of Task 2/3 but logically last

## Out of scope
- ship-check / auth-check implementation (Week 2)
- DIAGNOSE / PROTOTYPE / PRD routing (M5)
- superpowers / Matt Pocock skill removal from system (user choice)
- Strategy docs update (reference only, not code)
