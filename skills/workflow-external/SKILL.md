---
name: mekaknight:workflow-external
description: >-
  [Legacy v1.x] Skill orchestrator that depends on Matt Pocock and superpowers skills.
  Preserved for reference. For the current self-contained orchestrator, use /mekaknight:powertasking.
  Use when: 'workflow-external', 'use v1 workflow', 'use external workflow'.
---

# Workflow — Skill Orchestrator

Orchestrates [Matt Pocock skills](https://github.com/mattpocock/skills) and [superpowers](https://github.com/obra/superpowers) into a complete development flow: understand the problem, build it right, review it independently, verify it works, and finish the branch cleanly.

**Tracker-free.** This workflow has no external dependencies beyond git. All artifacts (specs, plans, PRDs, ADRs, CONTEXT.md) live in the repository. Cross-session work resumes by re-running `/mekaknight:workflow-external` with the relevant plan or PRD file path as context.

**Compound engineering guarantee:** Every workflow run improves domain docs, test coverage, and codebase structure — not just the immediate deliverable.

**Hard requirement:** This workflow requires both skill families to be available in the current session (via plugin, user-level, or project-level installation). Phase -1 verifies this and **halts the workflow** if any required skill is missing. There is no fallback path — if a required skill cannot be invoked, the workflow stops.

---

## Phase -1: Preflight — Verify required skills

**Goal:** Confirm every required skill is available before doing anything else.

Check whether the following skills are available in the current session by verifying each appears in the system context's available skill list:

**Matt Pocock skills:**
- `grill-me`, `grill-with-docs`, `diagnose`, `prototype`, `tdd`, `improve-codebase-architecture`

**superpowers skills:**
- `writing-plans`, `subagent-driven-development`, `requesting-code-review`, `verification-before-completion`, `finishing-a-development-branch`

Skills may be installed as plugins, in `~/.claude/skills/`, or in `.claude/skills/` — the installation method does not matter. What matters is that each skill can be invoked via the Skill tool.

**If any required skill is missing, STOP IMMEDIATELY.** Do not proceed to any other phase. Report to the user:

> Cannot run the workflow — required skills are not installed.
>
> **Missing skills:** [missing list]
>
> **How to install:**
> - Matt Pocock skills — see [mattpocock/skills](https://github.com/mattpocock/skills) for installation instructions.
> - superpowers — see [obra/superpowers](https://github.com/obra/superpowers) for installation instructions.
>
> Re-run `/mekaknight:workflow-external` after installation completes.

Proceed to Phase 0 only when all required skills are confirmed available.

---

## Cross-cutting gate: verification before completion

Every phase that ends with a "done", "passing", or "fixed" claim **MUST** invoke `verification-before-completion` first. This applies everywhere — it is non-negotiable.

- No phase declares success without running a fresh verification command and observing the output directly.
- No agent summary substitutes for direct output inspection.
- Soft language ("should work", "seems to pass", "probably fixed") is a red flag — treat it as "not verified".

This gate is referenced explicitly in Phase 3, 3.5, 4.5, and 5.

---

## Phase 0: Clarify — `grill-me`

**Goal:** Reach shared understanding of what the user actually wants.

**MUST invoke `grill-me` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report to the user — do NOT proceed manually.

- Interview the user until every branch of the decision tree is resolved
- If invoked from `mekaknight:strike`, use the issue title + body as the starting context
- If invoked standalone, use whatever the user provided

**Skip conditions:**
- Only allowed when the user explicitly requests it (e.g., "skip clarify", "requirements are clear", "skip brainstorming")
- The agent must NOT skip on its own judgment that "this is enough"

**Output:** A clear, agreed-upon problem statement.

### Phase 0 exit gate: ambiguity check

After grill-me completes, run this checklist before proceeding to Phase 1.

1. **List remaining ambiguities explicitly:**
   - Undecided items (options still open)
   - Items with unclear scope (how far to go is unclear)
   - Implicit assumptions (premises not explicitly confirmed)
   - Terminology confusion (the same word potentially carrying different meanings)
2. **If 1+ items are listed** — show them to the user and continue grill-me until each is resolved. Once all are resolved, return to step 1 and re-verify.
3. **Only when 0 items remain** may you proceed to Phase 1.

---

## Phase 1: Grill — `grill-with-docs`

**Goal:** Validate the clarified requirements against the project's domain model and documented decisions.

**MUST invoke `grill-with-docs` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.

- Challenge the plan against CONTEXT.md and existing ADRs
- Sharpen terminology to match the project's ubiquitous language
- Update CONTEXT.md / ADRs inline as decisions crystallize

**Compound effect:** Domain documentation gets refined every run.

**Output:** A validated implementation direction with updated docs.

### Phase 1 exit gate: CONTEXT.md guarantee

After grill-with-docs completes, run this checklist before proceeding to Phase 2.

1. **Check for CONTEXT.md** — verify whether `CONTEXT.md` (or `CONTEXT-MAP.md`) exists in the project root. If it exists, this gate passes.
2. **If missing, enumerate the domain items surfaced during Phase 1:**
   - Domain vocabulary (project-specific concepts, excluding generic programming terms)
   - Relationships between terms
   - Ambiguities that were resolved
   - Decisions worth recording as an ADR
3. **If 1+ items are listed** — write `CONTEXT.md` following the `CONTEXT-FORMAT.md` format from the grill-with-docs skill (located at `~/.claude/skills/grill-with-docs/` or wherever the Matt Pocock skills are installed). After writing, report which items were included.
4. **If 0 items are listed** — report to the user that no domain context surfaced, and proceed to Phase 2 without creating CONTEXT.md.

---

## Phase 2: Route

Based on Phase 1 output, determine the nature of the work and route accordingly. **Only one route is taken per run.**

| Route | When | Skill chain |
|---|---|---|
| **DIAGNOSE** | Error reports, stack traces, "it used to work", reproducible broken behavior | `diagnose` |
| **PROTOTYPE** | UI shape uncertain, data model needs experimentation | `prototype` |
| **PRD** | Large feature, requirements need formalization, may span multiple sessions | local PRD → `writing-plans` → `subagent-driven-development` |
| **PLAN** | Coherent feature, multiple dependent tasks, one session, no PRD needed | `writing-plans` → `subagent-driven-development` |
| **DIRECT** | Single contained change, requirements obvious | Phase 3 directly (`tdd`) |

### Route DIAGNOSE — Bug → `diagnose`

**MUST invoke `diagnose` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. Follow its discipline:
1. Reproduce the bug
2. Minimize the reproduction
3. Form a hypothesis
4. Instrument to verify
5. Fix
6. Regression test

After diagnose completes, proceed to **Phase 3.5** (skip Phase 3 — diagnose already includes the fix + test).

### Route PROTOTYPE — Exploration → `prototype`

**MUST invoke `prototype` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. It will either:
- Build a runnable terminal app (for state/logic questions)
- Generate multiple UI variations (for design questions)

After the user picks a direction from the prototype, proceed to **Phase 3** (or re-enter the router at Phase 2 with the prototype findings as input if the chosen direction warrants Route PRD or PLAN).

### Route PRD — Large feature → local PRD + plan + subagent execution

**Signal:** Phase 1 output contains 3+ distinct tasks, spans multiple modules, requirements need formalization as a PRD. May span multiple sessions — but cross-session pickup happens via the local PRD/plan files, not an external tracker.

This route formalises requirements into a PRD that lives in the codebase, then breaks it into an execution plan, then executes the plan via subagents. No external tracker — git is the single source of truth.

#### PRD.1: Write the PRD

Save to `docs/prd/YYYY-MM-DD-<feature-slug>.md` using this template (adapted from matt's `to-prd`):

```markdown
# <Feature Name> PRD

## Problem Statement
The problem from the user's perspective.

## Solution
The solution from the user's perspective.

## User Stories
1. As a <actor>, I want <feature>, so that <benefit>
... (extensive numbered list covering every aspect)

## Implementation Decisions
- Modules to build/modify and their interfaces
- Schema changes, API contracts, architectural decisions
- Do NOT include specific file paths or code snippets (they go stale fast).
- Exception: snippets from a Route PROTOTYPE that encode a decision more precisely than prose (state machine, reducer, schema, type shape) — inline trimmed and note the prototype origin.

## Testing Decisions
- What makes a good test (test external behavior, not implementation details)
- Which modules to test
- Prior art for the tests (similar tests already in the codebase)

## Out of Scope
Things deliberately excluded from this PRD.
```

Use the project's domain glossary from `CONTEXT.md` throughout. Respect any ADRs in `docs/adr/` for the area you're touching.

#### PRD.2: Write the execution plan

**MUST invoke `writing-plans` via the Skill tool** to produce a local plan file (typically under `docs/plans/<feature-slug>.md`). The plan breaks the PRD into bite-sized tasks with explicit test → implement → commit steps, and notes dependencies between tasks.

#### PRD.3: Execute the plan

**MUST invoke `subagent-driven-development` via the Skill tool** to execute the plan. Each task runs in a fresh subagent context with built-in spec-compliance and code-quality review loops.

If a task returns `BLOCKED` or `NEEDS_CONTEXT`, surface it to the user — do NOT improvise.

If invocation fails or the skill is unavailable, STOP and report — do NOT fall back to manual sequential implementation (use Route PLAN or DIRECT for that).

After all tasks complete, proceed to **Phase 3.5** (skip Phase 3 — subagent-driven-development already includes implementation + per-task review).

#### Cross-session pickup

If the session ends mid-execution, the user resumes by running `/mekaknight:workflow-external` with the plan file path as context. Phase 0 (grill-me) is skipped when the plan file already encodes the agreed problem statement. Re-invoking `subagent-driven-development` on the same plan picks up from incomplete tasks.

### Route PLAN — Medium in-session feature → `writing-plans` → `subagent-driven-development`

**Signal:** single coherent feature that spans multiple tasks but fits in one session. Tasks may have dependencies. No formal PRD needed. Typical shape: 5–15 commits touching 2–4 files with shared state.

**Why this route exists separately from PRD:** when requirements are already clear from Phase 0–1, skip the PRD overhead and go straight to a plan file.

#### PLAN.1: Write the plan

**MUST invoke `writing-plans` via the Skill tool** to produce a local plan file (typically under `docs/plans/<feature-slug>.md`).

#### PLAN.2: Execute the plan

**MUST invoke `subagent-driven-development` via the Skill tool** — same discipline as PRD.3.

After all tasks complete, proceed to **Phase 3.5**.

### Route DIRECT — Small clear feature → Phase 3 directly

**Signal:** None of the above. Requirements are clear, scope is contained (typically 1–4 commits, single file or tightly-grouped files), ready to build.

Proceed directly to **Phase 3**.

---

## Phase 2.5: Checkpoint — Commit docs baseline

**Goal:** Seal off Phase 0–2 documentation work (CONTEXT.md, ADRs, terminology updates, PRD files, plan files) as a separate commit so Phase 4's review diff sees only code changes.

**Applies to:** all routes. Phase 2.5 runs after the route's spec artifacts are written but before any code is built or subagent execution starts.

For each route, this means:
- **DIAGNOSE** — runs after Phase 0–1 docs updates, before `diagnose` is invoked (or skipped if `diagnose` already creates its own fix commits)
- **PROTOTYPE** — runs after prototype artifacts (`LOGIC.md` / `UI.md`) are committed alongside Phase 0–1 docs
- **PRD** — runs after PRD.1 and PRD.2 produce the PRD file and plan file, before PRD.3 subagent execution
- **PLAN** — runs after PLAN.1 produces the plan file, before PLAN.2 subagent execution
- **DIRECT** — runs after Phase 0–1 docs updates, before Phase 3 tdd

**Skip conditions:**
- Not a git repository
- No changes to commit (Phase 0–2 produced no docs updates)

If the working tree has uncommitted documentation changes, create one commit scoped to docs only:

```bash
git add CONTEXT.md docs/adr/ docs/prd/ docs/plans/ <other-doc-paths>
git commit -m "docs: capture domain context for <problem statement>"
```

Record the resulting commit SHA — Phase 4 uses it as the baseline for the implementation diff.

**Output:** Clean working tree, baseline commit SHA captured.

---

## Phase 3: Build — `tdd`

**Goal:** Implement the solution with test-driven development.

**MUST invoke `tdd` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. Follow the red-green-refactor loop strictly:
1. **RED** — Write a failing test first
2. **GREEN** — Write minimal code to make it pass
3. **REFACTOR** — Clean up while keeping tests green
4. Repeat until the feature is complete

Before declaring the feature complete, invoke `verification-before-completion` to confirm all tests pass with direct output inspection.

**Skip conditions:**
- UI-only work with no testable logic — if the project's `CLAUDE.md`/`AGENTS.md` explicitly excludes UI tests, honour that
- Route DIAGNOSE already completed fix + test via `diagnose`
- Route PRD / PLAN already completed build + per-task review via `subagent-driven-development`

**Output:** Working implementation with tests, verification gate passed.

---

## Phase 3.5: Architecture — `improve-codebase-architecture`

**Goal:** Check whether the new code fits well structurally, and fix what can be fixed now.

**MUST invoke `improve-codebase-architecture` via the Skill tool**, scoped to the files changed in Phase 3 (or in DIAGNOSE's diagnose, or in PRD / PLAN's subagent execution). If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.

Review results and act:

| Finding | Action |
|---|---|
| In scope of current work | Fix immediately (loop back to Phase 3 tdd, or PRD.3 / PLAN.2 subagent execution) |
| Out of scope, small (1-2 lines) | Fix immediately |
| Out of scope, large | Note for the user — suggest `/mekaknight:tag` to track separately in Notion |

If any fixes are applied, invoke `verification-before-completion` before proceeding.

**Compound effect:** Codebase architecture improves incrementally with every workflow run.

**Output:** Cleaner codebase + list of deferred improvements (if any).

---

## Phase 4: Review — `requesting-code-review`

**Goal:** Independent code review by an isolated reviewer subagent. The reviewer has no recency bias from writing the code, and the two-axis (standards + spec) discipline is preserved through structured prompts.

**MUST invoke `requesting-code-review` via the Skill tool**, passing:

- **BASE SHA** — the Phase 2.5 baseline commit (the docs commit captured before implementation began). If Phase 2.5 was skipped, fall back to the commit at which the workflow started.
- **HEAD SHA** — current `HEAD`
- **Spec sources** — the problem statement from Phase 0–1, the original issue body if invoked from `strike`, the PRD file from Route PRD, or the plan file from Route PRD / PLAN
- **Standards sources** — `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CONTEXT.md`, `docs/adr/`. Machine-enforced standards (linter/formatter configs) — note them but don't re-check what tooling already enforces.

If invocation fails or the skill is unavailable, STOP and report — do NOT fall back to manual inline review.

Triage findings:

| Severity | Action |
|---|---|
| **Critical** | Fix immediately, loop back to Phase 3 (or PRD.3 / PLAN.2), then re-run Phase 4 |
| **Important** | Fix unless the user explicitly defers |
| **Minor** | Note in the Phase 5.2 commit body, suggest `/mekaknight:tag` for follow-up |

If you believe a reviewer finding is technically wrong, follow `receiving-code-review`'s `push back with technical reasoning` guidance — do NOT performatively agree. If `receiving-code-review` is available, invoke it to structure the response.

**Output:** Review report with all Critical and Important items resolved.

---

## Phase 4.5: Quality & Security Review

**Goal:** Defense-in-depth review beyond the Standards/Spec axes. Security is default-ON; quality is conditional.

### 4.5.1: Quality — `simplify` (conditional)

**Skip when ALL hold:**
- Diff < 30 lines net (`git diff --shortstat <Phase 2.5 baseline>..HEAD`)
- No new files or modules introduced
- Phase 3.5 reported no out-of-scope findings

Otherwise invoke the `simplify` skill on the Phase 4 diff. It reviews changed code for reuse, quality, and efficiency, then applies fixes. If it produces fixes, loop forward to Phase 5 for re-verification — do **not** re-trigger Phase 4 (the diff scope is unchanged).

**If `simplify` is unavailable in the session, skip with a note — this step is non-blocking.**

### 4.5.2: Security — `/security-review` + `semgrep` (default ON)

**Skip ONLY when ALL hold:**
- Diff is purely cosmetic (CSS / className / copy / comment / markdown only)
- No new dependencies (`package.json` / lockfile unchanged)
- No changes under any of: auth-related paths, API route/controller handlers, DB schema files, env or config files, crypto utilities, external integration adapters, file upload handlers

Otherwise run in order:

1. **Invoke `/security-review` skill** — OWASP Top 10–oriented audit of pending changes
2. **Invoke `semgrep` skill if available** — deterministic SAST rule matching. If the `semgrep` plugin is not installed, skip with a note (do not block)

Merge findings, deduplicated by file:line.

### 4.5.3: Triage findings

| Severity | Action |
|---|---|
| Critical / High | Fix immediately, loop back to Phase 3 (TDD-driven fix), then re-run 4.5.2 |
| Medium | Present to user, default = fix unless the user explicitly defers |
| Low / Info | Note in the Phase 5.2 commit body, suggest `/mekaknight:tag` for follow-up |

If any fixes are applied, invoke `verification-before-completion` before proceeding to Phase 5.

**Compound effect:** Security posture and code clarity improve incrementally with every workflow run.

---

## Phase 5: Verify and finish

**Goal:** Mechanical verification, then commit the implementation, then explicit branch-finish decision.

### 5.1: Verification — `verification-before-completion`

**MUST invoke `verification-before-completion` via the Skill tool.** Run every check the project exposes:

- **Type checking** — ensure the codebase compiles without type errors
- **Tests** — run the full test suite (or the relevant subset if the project is large)
- **Lint/format** — verify code style and formatting rules pass

If the project has a single command that runs all checks, prefer that over running individual tools.

The verification gate **does not pass** until every check is green and the output is directly observed. If any check fails, fix the issue and re-run from 5.1 (do not re-run earlier phases unless the fix is substantial).

### 5.2: Final commit

Once every check is green, commit the implementation as a single coherent change.

**Skip conditions:**
- Not a git repository
- No code changes to commit (e.g., docs-only workflow)
- Route PRD / PLAN already produced per-task commits via `subagent-driven-development` (in which case skip — the work is already captured)

```bash
git add <implementation files>
git commit -m "<type>: <one-line description of what was built>"
```

Use the spec source from Phase 4 to inform the message. If invoked from `strike`, include the issue reference (e.g., `refs <Notion URL>`).

**Output:** All checks green and the implementation captured on top of the Phase 2.5 baseline.

### 5.3: Branch finish — `finishing-a-development-branch`

**MUST invoke `finishing-a-development-branch` via the Skill tool.** It presents a 4-option decision based on the current environment:

| Option | When it fits |
|---|---|
| Local merge | Solo project, no PR review process, work is complete |
| Open PR | Team workflow, code review required, remote branch tracked |
| Keep branch | Work is paused, not ready to merge |
| Discard | Work is throwaway (e.g., a prototype that informed a decision but isn't being shipped) |

If invoked from `strike`, the caller may instead choose to keep the branch and let strike's status transition handle the finish — surface this option to the user.

If the skill is unavailable, STOP and ask the user — do NOT auto-merge or auto-push.

**Output:** Work captured cleanly. Branch is merged, PR is open, or worktree is parked as the user chose.

---

## Caller integration

### From `mekaknight:strike`

When invoked from strike:
- Phase 0 receives the issue title + body as starting context
- All phases proceed normally
- On completion, control returns to strike for status transition + memo in Notion

The workflow itself never reads from or writes to Notion — `strike` handles the Notion side, then hands the workflow a plain problem statement.

### Standalone usage

When invoked directly via `/mekaknight:workflow-external`:
- User provides the problem/feature description as the argument (or a path to an existing PRD / plan file for resuming cross-session work)
- All phases proceed normally
- On completion, summarize what was done

---

## Abort handling

If the user interrupts at any phase:
- Work completed in prior phases (docs updates, tests, code) persists in the working tree
- The user can resume by running `/mekaknight:workflow-external` again with the same context (or with the PRD / plan file path for Routes PRD / PLAN)
- No automatic state tracking — the user decides where to pick up
