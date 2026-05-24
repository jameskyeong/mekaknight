---
name: jameskill:workflow
description: >-
  Matt Pocock skill orchestrator with Notion-integrated issue tracking.
  Chains grill-me, grill-with-docs, diagnose, prototype, tdd, improve-codebase-architecture,
  simplify, and /security-review for problem understanding, implementation, and
  quality/security review. Large features split into vertical-slice Notion issues via
  jameskill:report-issue. Use when: 'workflow', 'start working on', 'implement this',
  'fix this', 'build this'. Also invoked by resolve-issue after issue selection.
---

# Workflow — Matt Pocock Skill Orchestrator

Orchestrates Matt Pocock skills into a complete development flow: understand the problem, build it right, and leave the codebase better than you found it.

**Compound engineering guarantee:** Every workflow run improves domain docs, test coverage, and codebase structure — not just the immediate deliverable.

**Hard requirement:** This workflow requires Matt Pocock skills to be available in the current session (via plugin, user-level, or project-level installation). Phase -1 verifies this and **halts the workflow** if any required skill is missing. There is no fallback path — if a required skill cannot be invoked, the workflow stops.

---

## Phase -1: Preflight — Verify required skills

**Goal:** Confirm every required skill is available before doing anything else.

Check whether the following skills are available in the current session by verifying each appears in the system context's available skill list:

**Matt Pocock skills:**
- `grill-me`, `grill-with-docs`, `diagnose`, `prototype`, `tdd`, `improve-codebase-architecture`

**jameskill skills** (required only if Route C is taken — preflight verifies upfront for safety):
- `jameskill:report-issue`

Skills may be installed as plugins, in `~/.claude/skills/`, or in `.claude/skills/` — the installation method does not matter. What matters is that each skill can be invoked via the Skill tool.

**If any required skill is missing, STOP IMMEDIATELY.** Do not proceed to any other phase. Report to the user:

> Cannot run the workflow — required skills are not installed.
>
> **Missing skills:** [missing list]
>
> **How to install:**
> - Matt Pocock skills: see [mattpocock/skills](https://github.com/mattpocock/skills) for installation instructions.
> - jameskill skills: install the `jameskill` plugin via the jameskill marketplace.
>
> Re-run `/jameskill:workflow` after installation completes.

Proceed to Phase 0 only when all required skills are confirmed available.

---

## Phase 0: Clarify — `grill-me`

**Goal:** Reach shared understanding of what the user actually wants.

**MUST invoke `grill-me` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report to the user — do NOT proceed manually.

- Interview the user until every branch of the decision tree is resolved
- If invoked from `jameskill:resolve-issue`, use the issue title + body as the starting context
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

### Route A: Bug → `diagnose`

**Signal:** Error reports, stack traces, "it used to work", reproducible broken behavior.

**MUST invoke `diagnose` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. Follow its discipline:
1. Reproduce the bug
2. Minimize the reproduction
3. Form a hypothesis
4. Instrument to verify
5. Fix
6. Regression test

After diagnose completes, proceed to **Phase 3.5** (skip Phase 3 — diagnose already includes the fix + test).

### Route B: Exploration → `prototype`

**Signal:** UI shape is uncertain, data model needs experimentation, "I'm not sure how this should work".

**MUST invoke `prototype` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. It will either:
- Build a runnable terminal app (for state/logic questions)
- Generate multiple UI variations (for design questions)

After the user picks a direction from the prototype, proceed to **Phase 3**.

### Route C: Large feature → PRD + vertical-slice Notion issues

**Signal:** Phase 1 output contains 3+ distinct tasks, spans multiple modules, or would take multiple sessions.

This route formalises requirements into a PRD that lives in the codebase, then breaks it into vertical-slice issues that get registered in Notion via `jameskill:report-issue`. No matt-tracker calls — Notion is the single source of truth.

#### C.1: Write the PRD

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
- Exception: snippets from a Route B prototype that encode a decision more precisely than prose (state machine, reducer, schema, type shape) — inline trimmed and note the prototype origin.

## Testing Decisions
- What makes a good test (test external behavior, not implementation details)
- Which modules to test
- Prior art for the tests (similar tests already in the codebase)

## Out of Scope
Things deliberately excluded from this PRD.
```

Use the project's domain glossary from `CONTEXT.md` throughout. Respect any ADRs in `docs/adr/` for the area you're touching. Commit the PRD file before moving on (it counts as a Phase 0–2 docs artifact).

#### C.2: Draft vertical-slice issues

Break the PRD into **tracer-bullet** issues — each is a thin vertical slice through every layer (schema → API → UI → tests), not a horizontal slice of one layer. Slices may be:

- **AFK** — an agent can pick up and merge with no human in the loop
- **HITL** — requires human interaction (architectural decision, design review)

Prefer AFK over HITL. Prefer many thin slices over few thick ones. Each completed slice must be demoable or verifiable on its own.

For each proposed slice, draft:
- **Title** — short, descriptive, uses domain glossary
- **Type** — HITL or AFK
- **Blocked by** — which other slices must complete first (or "None")
- **Acceptance criteria** — 2–4 checkboxes covering the slice end-to-end
- **User stories covered** — which PRD user stories this addresses

#### C.3: Quiz the user

Present the proposed breakdown as a numbered list with the fields above. Ask:
- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are HITL/AFK markers correct?

Iterate until the user approves.

#### C.4: Publish to Notion via `jameskill:report-issue`

**MUST invoke `jameskill:report-issue` via the Skill tool**, passing the approved slices as the input prompt. Publish in **dependency order (blockers first)** so "Blocked by" fields can reference real Notion issue URLs.

For each slice, hand report-issue a structured item containing:
- The slice title (as the issue title)
- A body composed of: "What to build" (concise end-to-end description), Acceptance criteria checkboxes, Blocked by reference (issue URL if already published, otherwise the slice title to be linked later), Type (HITL/AFK)

If invocation fails or the skill is unavailable, STOP and report — do NOT fall back to manual Notion API calls.

#### C.5: Stop

**Do not attempt to implement all slices in one run.** Tell the user:

> "PRD written to `<path>` and N vertical-slice issues registered in Notion. Pick up each one via `/jameskill:resolve-issue` — it will route back into this workflow per slice."

### Route D: Clear feature → Phase 3 directly

**Signal:** None of the above. Requirements are clear, scope is contained, ready to build.

Proceed directly to **Phase 3**.

---

## Phase 2.5: Checkpoint — Commit docs baseline

**Goal:** Seal off Phase 0–2 documentation work (CONTEXT.md, ADRs, terminology updates) as a separate commit so Phase 4's review diff sees only code changes.

**Applies to:** Routes A, B, D. Route C exits before this phase.

**Skip conditions:**
- Not a git repository
- No changes to commit (Phase 0–2 produced no docs updates)

If the working tree has uncommitted documentation changes, create one commit scoped to docs only:

```bash
git add CONTEXT.md docs/adr/ <other-doc-paths>
git commit -m "docs: capture domain context for <problem statement>"
```

Record the resulting commit SHA — Phase 4.1 uses it as the baseline for the implementation diff.

**Output:** Clean working tree, baseline commit SHA captured.

---

## Phase 3: Build — `tdd`

**Goal:** Implement the solution with test-driven development.

**MUST invoke `tdd` via the Skill tool.** If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually. Follow the red-green-refactor loop strictly:
1. **RED** — Write a failing test first
2. **GREEN** — Write minimal code to make it pass
3. **REFACTOR** — Clean up while keeping tests green
4. Repeat until the feature is complete

**Skip conditions:**
- UI-only work with no testable logic — if the project's `CLAUDE.md`/`AGENTS.md` explicitly excludes UI tests, honour that
- Route A already completed fix + test via diagnose

**Output:** Working implementation with tests.

---

## Phase 3.5: Architecture — `improve-codebase-architecture`

**Goal:** Check whether the new code fits well structurally, and fix what can be fixed now.

**MUST invoke `improve-codebase-architecture` via the Skill tool**, scoped to the files changed in Phase 3 (or Route A). If invocation fails or the skill is unavailable, STOP and report — do NOT proceed manually.

Review results and act:

| Finding | Action |
|---|---|
| In scope of current work | Fix immediately (loop back to Phase 3 tdd for the fix) |
| Out of scope, small (1-2 lines) | Fix immediately |
| Out of scope, large | Note for the user — suggest `/jameskill:report-issue` to track separately |

**Compound effect:** Codebase architecture improves incrementally with every workflow run.

**Output:** Cleaner codebase + list of deferred improvements (if any).

---

## Phase 4: Review — Two-Axis Code Review

**Goal:** Two-axis code review before declaring done. Standards and Spec are reviewed independently so one axis cannot mask the other.

> **Note:** Matt Pocock's `review` skill is currently `in-progress` and under development. Once it is promoted to stable (`skills/engineering/`), switch this Phase to a Skill invocation. Until then, follow the inline process below.

### 4.1: Determine the diff

Compare the current state against the **Phase 2.5 baseline commit** (the docs commit captured before implementation began). If Phase 2.5 was skipped, fall back to the commit at which the workflow started. Use merge-base comparison. Also note the commit list for context.

### 4.2: Collect review sources

**Standards sources** — any project documents that define how code should be written:
- Project instruction files (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`)
- Domain documentation (`CONTEXT.md`, per-module context files)
- Architectural decisions (`docs/adr/`)
- Machine-enforced standards (linter/formatter configs) — note them but don't re-check what tooling already enforces

**Spec source** — what was agreed to build:
- The problem statement from Phase 0-1 (grill-me + grill-with-docs output)
- If invoked from resolve-issue: the original issue title + body
- Issue references in commit messages
- PRD from Route C if applicable

### 4.3: Run two reviews in parallel sub-agents

Spawn two `general-purpose` sub-agents simultaneously. They must not share context.

**Standards sub-agent:** Read the standards docs found in 4.2, then read the diff. Report every place the diff violates a documented standard. Cite the standard (file + the rule). Distinguish hard violations from judgement calls. Skip anything tooling enforces. Under 400 words.

**Spec sub-agent:** Read the spec from 4.2, then read the diff. Report: (a) requirements the spec asked for that are missing or partial; (b) behavior in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words.

### 4.4: Aggregate and act

Present the two reports under `## Standards` and `## Spec` headings. Do **not** merge or rerank — keep axes separate.

| Review result | Action |
|---|---|
| Hard violation found | Fix it, loop back to Phase 3 tdd |
| Judgement call flagged | Present to user for decision |
| Both axes pass | Proceed to Phase 5 |

**Output:** Standards + Spec review report, all violations resolved.

---

## Phase 4.5: Quality & Security Review

**Goal:** Defense-in-depth review beyond the Standards/Spec axes. Security is default-ON; quality is conditional.

### 4.5.1: Quality — `simplify` (conditional)

**Skip when ALL hold:**
- Diff < 30 lines net (`git diff --shortstat <Phase 2.5 baseline>..HEAD`)
- No new files or modules introduced
- Phase 3.5 reported no out-of-scope findings

Otherwise invoke the `simplify` skill on the Phase 4.1 diff. It reviews changed code for reuse, quality, and efficiency, then applies fixes. If it produces fixes, loop forward to Phase 5 for re-verification — do **not** re-trigger Phase 4 (the diff scope is unchanged).

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
| Low / Info | Note in the Phase 5.1 commit body, suggest `/jameskill:report-issue` for follow-up |

**Compound effect:** Security posture and code clarity improve incrementally with every workflow run.

---

## Phase 5: Verify

**Goal:** Mechanical verification that nothing is broken.

Run the project's verification suite. Detect which checks are available from the project configuration and run them all:

- **Type checking** — ensure the codebase compiles without type errors
- **Tests** — run the full test suite (or the relevant subset if the project is large)
- **Lint/format** — verify code style and formatting rules pass

If the project has a single command that runs all checks, prefer that over running individual tools.

If any check fails, fix the issue and re-run from Phase 5 (do not re-run earlier phases unless the fix is substantial).

### 5.1: Final commit

Once every check is green, commit the implementation as a single coherent change.

**Skip conditions:**
- Not a git repository
- No code changes to commit (e.g., docs-only workflow)

```bash
git add <implementation files>
git commit -m "<type>: <one-line description of what was built>"
```

Use the spec source from Phase 4.2 to inform the message. If invoked from `resolve-issue`, include the issue reference (e.g., `refs #123`).

**Output:** All checks green and the implementation captured as one commit on top of the Phase 2.5 baseline.

---

## Caller integration

### From `jameskill:resolve-issue`

When invoked from resolve-issue:
- Phase 0 receives the issue title + body as starting context
- All phases proceed normally
- On completion, control returns to resolve-issue for status transition + memo

### Standalone usage

When invoked directly via `/jameskill:workflow`:
- User provides the problem/feature description as the argument
- All phases proceed normally
- On completion, summarize what was done

---

## Abort handling

If the user interrupts at any phase:
- Work completed in prior phases (docs updates, tests, code) persists in the working tree
- The user can resume by running `/jameskill:workflow` again with the same context
- No automatic state tracking — the user decides where to pick up
