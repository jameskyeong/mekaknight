# Plan: forge depth references — iteration 3 (PLAN routing + Finish)

## Goal

Cover the two remaining phases that `forge` directly executes — Route's PLAN sub-step and Finish — with their own discipline references. After this iteration, every executable phase of forge except Preflight (mechanical environment check) and Ship-check (slot, deferred) has a dedicated depth reference. forge's discipline surface is then complete for the phases forge actually runs.

## Scope (this iteration)

In scope:
- Author `references/planning.md` — Route PLAN discipline (plan file structure, task sizing, dependencies, out-of-scope, anti-patterns, cross-session resume).
- Author `references/finishing.md` — Finish discipline (4-option branch decision tree, commit rules, git-safety anti-patterns, edge cases like incomplete work and merge conflicts).
- Update `forge/SKILL.md` to add pointer lines at the Route PLAN sub-step and at the Finish phase.

Out of scope:
- `subagent-patterns.md`, `prototyping.md`, `architecture.md`, `diagnosis.md` — these are either cross-cutting (subagents) or apply to unsupported routes. Separate decisions.
- DAILY route, DIAGNOSE route — still deferred.
- Changes to forge's phase structure or exit gates.

## Tasks

### Task 1: planning.md
- **Create** `skills/forge/references/planning.md`
- **Sections**:
  - Why PLAN exists (the cost of mid-flight redirection; the value of a confirmed artifact)
  - Anatomy of a good plan file (Goal, Tasks, Dependencies, Out-of-scope, Verification)
  - Task sizing — one task = one RED-GREEN-REFACTOR cycle on a small surface; rules of thumb for splitting and merging
  - Dependencies — explicit ordering; how to recognize "this task can't start until X"
  - Out-of-scope — the cheapest possible scope guard; what belongs and what does not
  - Verification per task — the test that proves the task is done, named in the plan
  - Anti-patterns: vague task ("implement auth"), too-large task (multiple unrelated behaviors in one cycle), no exit criteria, hidden dependencies, scope creep allowed at write-time, plan-as-document instead of plan-as-contract
  - Edge cases: mid-execution discovery requires plan change; user adds a task mid-flight; task turns out to be wrong; cross-session resume rehydration
  - The exit gate sentence ("Plan written at <path>; user confirmed at <timestamp>: <quote>")
- **Verification**: file exists; each plan section has examples of the good form; every anti-pattern has a concrete bad-example sketch

### Task 2: finishing.md
- **Create** `skills/forge/references/finishing.md`
- **Sections**:
  - Why Finish is an explicit phase (defaulting to "auto-commit and push" loses optionality; the branch decision is a real choice the user should make consciously)
  - The four options sharpened — Local merge / Open PR / Keep branch / Discard — with the precise situation each fits
  - Commit message discipline — type prefix, scope, AI attribution forbidden, semver bumps when relevant
  - Git-safety anti-patterns: auto-push without explicit user choice, `--no-verify`, `--amend` on published commits, `git reset --hard` as a "clean up", force push on shared branches, deleting branches with uncommitted state
  - Edge cases: working tree not clean at Finish, merge conflict on local merge, PR cannot be opened (auth, branch protection), "Keep branch" with intentional uncommitted state, strike caller integration
  - The exit gate sentence ("`git status` shows <state>; user chose <option>")
- **Verification**: file exists; every git-safety rule has a justification; each branch option has a specific "use this when" criterion

### Task 3: Wire forge SKILL.md
- **Edit** `skills/forge/SKILL.md`:
  - Route → PLAN.1 (or PLAN sub-step opening): add `> **For the deeper discipline — see `references/planning.md`.**`
  - Finish phase: add `> **For the deeper discipline — see `references/finishing.md`.**`
- **Do not** duplicate content into SKILL.md
- **Verification**: `grep -n "references/planning.md\|references/finishing.md" skills/forge/SKILL.md` returns at least one hit each

### Task 4: End-to-end review and commit
- Read forge SKILL.md top to bottom; flow check
- Read both new references end to end; depth check
- Cross-check pointer targets exist
- Commit + push with evidence-based verification sentence

## Verification (overall)

- `ls skills/forge/references/` shows six files (`tdd-discipline.md`, `verification.md`, `grilling.md`, `peer-review.md`, `planning.md`, `finishing.md`)
- `grep -n "references/" skills/forge/SKILL.md` returns six pointer hits
- SKILL.md line count grows by ~4-6 (two pointer lines + spacing)
- No new ADR — approach unchanged; ADR 0005 still covers it

## Non-goals (be explicit)

- No new ADR
- No `subagent-patterns.md`, `prototyping.md`, `architecture.md`, `diagnosis.md`
- No `DAILY` or `DIAGNOSE` route in this iteration
- No rewrites of existing modules (iteration 1 + 2 modules stay as they are)
