---
name: mekaknight:forge
description: >-
  Self-contained development orchestrator: clarify → route → build-with-tests → review → verify → retrospective → finish.
  4-way router (DIRECT/PLAN for features, DIAGNOSE for bugs, PROTOTYPE for throwaway exploration).
  Strict TDD, relentless clarification, no-soft-language verification at every phase boundary.
  Retrospective phase proposes compound-engineering deposits (ADR / references / CONTEXT.md) before Finish.
  Use when: 'forge', 'start working on', 'implement this', 'build this' (feature),
  'fix this', 'debug this', 'diagnose this' (DIAGNOSE),
  'prototype this', 'try a design', 'explore options' (PROTOTYPE).
  Also invoked by strike after issue selection.
---

# Forge — Development Orchestrator

Self-contained development orchestrator that takes raw requirements through a disciplined pipeline to produce hardened, production-grade code. No external skill dependencies.

Named after the act of forging at the anvil — each phase hammers the code into shape, one strike at a time.

**For the v1.x orchestrator that uses superpowers + Matt Pocock skills, see `/mekaknight:workflow-external`.**

> **Discipline depth lives in [`references/`](references/README.md).** Each phase below carries a pointer to the module that deepens it (principles, anti-patterns, edge cases). The orchestrator below stays slim; the references hold the full discipline.

---

## Cross-cutting gate: verification before completion

Every phase that ends with a "done", "passing", or "fixed" claim **MUST** pass its exit gate first. This applies everywhere — it is non-negotiable.

> **For the deeper discipline — disguised-verification anti-patterns, per-phase evidence patterns, and how to handle cases where the standard check cannot be run — see [`references/verification.md`](references/verification.md).**

### Forbidden language

The following phrases are **banned** in any completion claim. If you catch yourself writing any of them, STOP — you have not verified:

- "should work"
- "seems to pass"
- "probably fixed"
- "I think it passes"
- "looks correct"
- "this should be fine"
- "likely works"

### The rule

- Run the verification command.
- Read the output directly — not a summary, not a memory of a prior run.
- Only then may you state "verified: [what passed] — [observed output]".

### Per-phase exit gates

| Phase | Exit gate |
|---|---|
| Preflight | All environment checks pass — output observed |
| Clarify | Ambiguity checklist = 0 items AND user explicitly confirms |
| Route (PLAN only) | User confirms plan file |
| Build (per task) | Test runs observed to pass with exact output |
| Peer-review | Every Critical/Important finding addressed or explicitly user-deferred |
| Ship-check | (stub — skip until activated) |
| Verify | lint + typecheck + test + architecture review all green — output observed |
| Retrospective | Each qualifying channel (ADR / references / CONTEXT.md) reached an explicit user decision — accepted, edited, or rejected |
| Finish | git status confirms clean state after commit |

---

## Preflight: Environment check

**Goal:** Confirm the project can support forge's disciplined pipeline before starting.

Run these checks and report results:

1. **Git repository**: `git rev-parse --git-dir`
   - If not a git repo → **HALT**: "This directory is not a git repository. Forge requires git for docs checkpoints and finish."

2. **Test runner**: check for test scripts in `package.json`, `Makefile`, `pyproject.toml`, or equivalent
   - If no test runner found → **HALT**: "No test runner detected. Forge enforces strict TDD — a test runner is required. Set up your test framework first, then re-run `/forge`."
   - Report which test command was detected (e.g., `npm test`, `pytest`, `go test`)

3. **Type checker** (optional): check for `tsconfig.json`, `mypy.ini`, `pyrightconfig.json`, or equivalent
   - If not found → **NOTE** (do not halt): "No type checker detected. Verify phase will skip type checking."

4. **Linter** (optional): check for `.eslintrc*`, `biome.json`, `ruff.toml`, `.flake8`, or equivalent
   - If not found → **NOTE** (do not halt): "No linter detected. Verify phase will skip lint."

**Exit gate:** All checks ran, output observed, no HALT triggered.

---

## Clarify: Relentless questioning

**Goal:** Reach shared understanding with zero ambiguity remaining.

> **For the deeper discipline — one-question-at-a-time grilling, recommended-answer-with-reasoning patterns, deepened 5-category checklist, anti-patterns (shotgun questioning, vibes-based clarify, answering your own questions), and edge cases (premature skip, no CONTEXT.md, pushback fatigue) — see [`references/grilling.md`](references/grilling.md).**

If invoked from `mekaknight:strike`, use the issue title + body as starting context. If invoked standalone, use whatever the user provided. If invoked with a path to an existing plan file (`docs/plans/*.md`), skip Clarify and Route — proceed directly to Build with that plan (cross-session pickup).

### How to question

- Ask **one question at a time**. Wait for the answer before the next question.
- For each question, provide a **recommended answer** with reasoning.
- If the question can be answered by **reading the codebase**, do that instead of asking.
- If `CONTEXT.md` exists in the project root, read it and use its domain vocabulary. Challenge any user language that conflicts with the glossary.

### What to question — the ambiguity checklist

After the initial understanding forms, systematically check these 5 categories. Do not skip any:

1. **Scope boundaries**: What is included? What is explicitly excluded? "Add user auth" — does that include password reset? OAuth? Email verification?
2. **Edge cases**: What happens when input is empty, null, too large, duplicated, concurrent? What are the error states?
3. **Term definitions**: Are there words the user used that could mean more than one thing? "User" — the logged-in person or the database record? "Delete" — soft delete or hard delete?
4. **Conflicts with existing code**: Does this change break anything that already exists? Does it overlap with existing functionality?
5. **Success criteria**: How do we know this is done? What specific test would prove it works? What would a failing test look like?

### Exit gate

1. Run through the 5 categories above and **list every remaining ambiguity explicitly**.
2. If 1+ items remain — present them to the user, resolve each one, then re-run step 1.
3. When 0 items remain — ask the user: **"All ambiguities resolved. Proceed?"**
4. Only when the user explicitly confirms may you proceed to Route.

**Skip conditions:** Only if the user explicitly says "skip clarify", "requirements are clear", or "skip brainstorming". The agent must NOT skip on its own judgment.

---

## Route

Based on Clarify output, determine the work's scope. **Only one route per run.**

| Route | When | What happens next |
|---|---|---|
| **DIRECT** | Small, contained feature change. 1-4 commits, tightly-grouped files, no task dependencies. | Proceed directly to Build. |
| **PLAN** | Medium feature. 5-15 commits, 2-4 files with shared state, tasks have dependencies. | Write plan file → user confirms → Docs checkpoint → sequential Build. |
| **DIAGNOSE** | Bug-first work. Reproduction steps, error messages, "something is broken." | Reproduce → Minimize → Investigate → Fix → Regression-prevent. |
| **PROTOTYPE** | Throwaway exploration. "How should this look", "try a few approaches", "I'm not sure which design fits." | Build variations with relaxed TDD → user review → Discard or Promote-to-Plan. |

### Unsupported routes

If the work matches this pattern, inform the user and suggest alternatives:

- **PRD-scale, multi-session feature**: "This is large enough to need a PRD. Consider writing one in `docs/prd/` and breaking it into multiple `/forge` sessions, each of which can be DIRECT or PLAN."

### Route: DIRECT

Proceed to **Build** immediately. No plan file, no docs checkpoint.

### Route: PLAN

> **For the deeper discipline — what makes a plan file a contract vs a wish list, task sizing rules, dependency patterns, the value of Out-of-scope, anti-patterns (vague task, hidden dependencies, plan-as-document drift, mid-flight scope creep), and cross-session resume — see [`references/planning.md`](references/planning.md).**

#### PLAN.1: Write the plan file

Generate a plan file at `docs/plans/<slug>.md` with this structure:

```markdown
# Plan: <feature name>

## Goal
One sentence.

## Tasks

### Task N: <title>
- **What**: description of the change
- **Test**: what test to write first (RED step)
- **Implement**: what code to write (GREEN step)
- **Verify**: how to confirm it works
- **Commit**: commit message

## Dependencies
Which tasks depend on which.

## Out of scope
What this plan deliberately does NOT cover.
```

Present the plan to the user: **"This is the execution plan. Proceed, or adjust?"**

**Exit gate:** User explicitly confirms the plan.

#### PLAN.2: Docs checkpoint

If the working tree has uncommitted documentation changes (CONTEXT.md, ADR, plan file), commit them before building:

```bash
git add CONTEXT.md docs/adr/ docs/plans/ <other-doc-paths>
git commit -m "docs: capture context for <feature>"
```

Record the commit SHA — Verify phase uses it as the baseline.

#### PLAN.3: Sequential execution

Execute tasks in dependency order, one at a time. Each task follows the full Build phase (RED → GREEN → REFACTOR → verify). After each task completes and its test passes, proceed to the next.

If a task is blocked or unclear, surface it to the user — do NOT improvise.

#### Cross-session pickup

If the session ends mid-execution, the user resumes by running `/forge` with the plan file path as argument. Clarify and Route are skipped — Build picks up from the first incomplete task.

### Route: DIAGNOSE

> **For the deeper discipline — why each step exists, hypothesis-driven investigation, anti-patterns (changing code without a hypothesis, hypothesis-shopping, fixing the test instead of the bug, declaring victory when the symptom disappears), and edge cases (cannot reproduce locally, intermittent bugs, production-only data, dependency bugs) — see [`references/diagnosis.md`](references/diagnosis.md).**

Five steps, each with its own exit condition. The cross-cutting verification gate applies to every step.

1. **Reproduce** — write a test that fails *because of the bug*. Run it. Observe the failure. The exit condition is that the failure points at the bug, not at setup or fixture issues.
2. **Minimize** — trim the reproduction until the test exercises only the bug-causing surface. Removing more would make the test pass for the wrong reasons.
3. **Investigate** — form a hypothesis stating what causes the bug and where. Read code (do NOT change code yet) to confirm or refute. Repeat until a hypothesis is confirmed by reading.
4. **Fix** — minimum code change that makes the minimized test pass without breaking other tests. Standard GREEN discipline applies (see `references/tdd-discipline.md`).
5. **Regression-prevent** — the minimized test enters the suite permanently, committed alongside the fix.

After Regression-prevent, proceed to Peer-review → Verify → Finish exactly as DIRECT/PLAN routes do. The minimized test is the regression net; the diff is fix + test together.

### Route: PROTOTYPE

> **For the deeper discipline — why prototypes are throwaway by default, time-box and variation rules, the explicit user-review step, Discard vs Promote-to-Plan, anti-patterns (silent production drift, "while I'm here" production-grade work, no time-box, single approach as exploration, skipping review, Promote without restart), and edge cases (question turns out wrong, user wants to ship as-is, shared file conflicts) — see [`references/prototyping.md`](references/prototyping.md).**

PROTOTYPE intentionally relaxes the TDD discipline that DIRECT/PLAN/DIAGNOSE enforce. The relaxation is scoped to this route and ends the moment a variation is Promoted.

1. **Clarify the question** — state in one sentence what the prototype is answering. If it cannot be stated, return to Clarify.
2. **Set a time-box** — explicit budget (typically 30 min - 1 day). When it expires, the route exits.
3. **Build variations** — two or three meaningfully different approaches. No RED, no scope discipline at GREEN, no REFACTOR, no Peer-review subagent. Existing tests still must pass.
4. **Present to user** — surface the variations side by side with observed trade-offs. The agent does not declare done.
5. **User decides** — Discard (default), Promote variation N (kicks off a fresh PLAN run), or Re-Clarify (the original question was wrong).

**Promote is a restart, not a continuation.** The chosen variation's code does not graduate; a fresh PLAN run takes the prototype's answer as input to its own Clarify, then authors production code with full discipline.

After PROTOTYPE exits, the prototype branch is Discarded (per `references/finishing.md` Discard option) unless Promote replaced it with a new PLAN run.

---

## Build: Strict TDD

**Goal:** Implement the solution with test-driven development. No exceptions.

> **For the deeper discipline — RED/GREEN/REFACTOR exit conditions, anti-patterns (test-after, mock-overuse, scope creep at GREEN, refactor-on-red), and edge cases (legacy code, incidents, UI changes, integration boundaries) — see [`references/tdd-discipline.md`](references/tdd-discipline.md).**

For each unit of work (single task in PLAN, or the entire change in DIRECT):

### Step 1: RED — Write a failing test

1. Write a test that describes the expected behavior.
2. Run the test.
3. **Observe it fail.** Read the output. Confirm the failure message matches what you expect.
   - If the test passes unexpectedly → STOP. Either the feature already exists, or the test is wrong. Investigate before proceeding.
   - If the test fails with an unexpected error → fix the test, not the code.

### Step 2: GREEN — Minimal implementation

1. Write the **minimum code** to make the failing test pass. Nothing more.
2. Run the test.
3. **Observe it pass.** Read the exact output.
   - If it still fails → fix the code, re-run, re-read output. Loop until green.

### Step 3: REFACTOR — Clean up

1. With tests green, improve the code: rename, extract, simplify.
2. Run the test after each change.
3. **Observe it still passes.** If a refactor breaks a test, revert the refactor.

### Step 4: Repeat

If more behavior is needed, return to Step 1 with the next test.

### Build exit gate

- All tests for this unit of work pass — **output directly observed**.
- No skipped tests, no commented-out tests, no "TODO: add test later".

---

## Peer-review: Independent diff review

**Goal:** A fresh perspective on the code, free from the author's recency bias.

> **For the deeper discipline — why independence matters, sharpened Critical/Important/Minor definitions, when to push back on a finding, subagent prompt construction, and anti-patterns (performative agreement, fabricated findings, severity inflation, self-review) — see [`references/peer-review.md`](references/peer-review.md).**
>
> **For the cross-cutting subagent dispatch discipline used here and in any other forge phase that fans out work — see [`references/subagent-patterns.md`](references/subagent-patterns.md).**

Spawn a review agent using the Agent tool with this prompt template:

```
You are an independent code reviewer. You have NOT seen the implementation process — only the diff and the spec.

## Your review axes

### Axis 1: Standards compliance
Check the diff against these project standards:
- CLAUDE.md (if exists): [paste relevant sections]
- CONTEXT.md (if exists): [paste domain glossary]
- Existing code conventions observed in the surrounding files

### Axis 2: Spec compliance
The agreed requirements are:
[paste the clarify output or plan file content]

Does the implementation fulfill every requirement? Is anything missing? Is anything added that wasn't requested?

## Review the following diff:
[paste git diff from docs baseline to HEAD]

## Output format
For each finding, state:
- **Severity**: Critical / Important / Minor
- **File:line**: location
- **Issue**: what's wrong
- **Suggestion**: how to fix

If no issues found, state "No issues found" — do not invent findings.
```

### Triage findings

| Severity | Action |
|---|---|
| **Critical** | Fix immediately, re-run Build TDD loop for the fix, then re-run Peer-review |
| **Important** | Fix unless the user explicitly defers |
| **Minor** | Note for the user, do not block |

If you believe a finding is technically wrong, push back with reasoning — do NOT agree performatively.

### Exit gate

Every Critical and Important finding is resolved or explicitly user-deferred.

---

## Ship-check (slot)

> **This phase activates when `/ship-check`, `/auth-check`, or `/ship-ready?` skills are available.**
> Currently: skip with note.

When activated, this phase will run production-readiness checks (security + design + quality) before Verify. Findings that are Critical will block the Finish phase.

**Planned checks:**
- `/auth-check` — Supabase RLS, service key exposure, webhook signature, frontend-only auth
- `/ship-ready-security` — semgrep + GitGuardian + auth-check combined GO/NO-GO
- `/polish` — AI design cliché detection and scoring
- `/ship-check` — umbrella command combining all dimensions

For now, proceed directly to Verify.

---

## Verify: Comprehensive confirmation

**Goal:** Mechanical verification that everything works. Run every check the project exposes.

### Checks to run

1. **Type checking** (if detected in Preflight): run the type checker, read output
2. **Lint/format** (if detected in Preflight): run the linter, read output
3. **Tests**: run the full test suite (or relevant subset for large projects), read output
4. **Architecture review**: inspect the changed files for structural issues:
   - Single-responsibility: does any changed file now handle multiple concerns?
   - Naming: do new functions/variables follow existing conventions?
   - Dead code: did the changes create unused imports, variables, or functions?
   - If issues found → fix, re-run tests, re-read output

### Exit gate

- Every check above is green — **output directly observed for each**.
- No warnings treated as acceptable without explicit justification.
- The phrase "all checks pass" may only be used after listing what was run and what the output was.

---

## Retrospective: Deposit compounding artifacts

**Goal:** Capture this session's learnings into the repo's compound-engineering channels so future sessions start ahead.

> **For the deeper discipline — why three explicit channels, per-channel thresholds (when to propose vs stay silent), proposal formats, anti-patterns (performative deposit, paraphrasing SKILL.md, ADR for a bug fix, batch-style proposals), and edge cases (multi-session plans, strike-caller integration, PROTOTYPE Discard/Promote, no-deposit sessions) — see [`references/retrospective.md`](references/retrospective.md).**

Run after Verify exits green, before Finish. Check three channels in order. For each, propose a deposit *only if* its threshold is met. Do not invent deposits to make the phase feel productive — silent exit is the correct outcome when no channel qualifies.

### Channel 1: ADR (`docs/adr/`)

**Threshold**: An architectural choice was made whose *reasoning* will be valuable to a future session asking "why did we do it this way?"

If met, propose:

```
ADR proposal: <short title>

Context: <constraint or trigger>
Decision: <what was chosen>
Considered options: <brief list of alternatives>
Consequences: <follow-on implications>

Save to docs/adr/NNNN-<slug>.md? [y/edit/n]
```

Next ADR number = `ls docs/adr/ | wc -l + 1`, kebab-case slug.

Not an ADR: bug fixes, obvious implementation details, refactors that follow existing patterns, decisions already documented.

### Channel 2: Discipline references (`skills/forge/references/`)

**Threshold**: A phase revealed a new failure mode, anti-pattern, edge case, or recurring issue *that the existing reference does not already cover*.

If met, propose:

```
Reference update proposal: references/<phase>.md

Section: <existing or "new section: <name>">
Content: <draft paragraph — concrete, with enough context to be useful out of session>

Append? [y/edit/n]
```

Not a reference update: one-off mistakes, paraphrases of existing content, findings already documented.

### Channel 3: CONTEXT.md domain glossary

**Threshold**: A term was introduced, redefined, or contested during this session, and future contributors will need to use it consistently.

If met, propose:

```
CONTEXT.md glossary proposal:

Term: <name>
Section: <existing or "new section: <name>">

Entry:
**<Term>**:
<definition>
_Avoid_: <one or two confusable terms>

Append? [y/edit/n]
```

Not a glossary update: existing entries, throwaway phrases, standard programming terms with no project-specific meaning.

### Phase mechanics

1. **Check each channel silently first** — decide whether the threshold is met. If no, do not surface the channel.
2. **Propose one at a time** — never batch. Each gets independent accept/edit/reject.
3. **Write immediately on accept** — the agent creates or appends the file and `git add`s it so the deposit lands in the same commit as the implementation.
4. **Silent exit is success** — if no channel qualifies, exit with a one-line note: *"Retrospective: no compounding-worthy artifacts this session."*

### Exit gate

- Every qualifying channel reached an explicit user decision (`y`, `edit-then-y`, or `n`).
- Accepted deposits are written to disk and staged.
- If no channels qualified, the one-line note is recorded.
- No invented deposits — performative compounding is rejected.

---

## Finish: Commit and decide

**Goal:** Capture the work and let the user decide what to do with the branch.

> **For the deeper discipline — when each of the four branch options actually fits, commit-message rules (type prefix, no AI attribution, semver bump), git-safety anti-patterns (auto-push without consent, --no-verify, --amend after hook failure, force-push to shared branches), and edge cases (intentional uncommitted state, merge conflict, PR cannot open, strike caller integration) — see [`references/finishing.md`](references/finishing.md).**

### Step 1: Final commit

If there are uncommitted implementation changes:

```bash
git add <implementation files>
git commit -m "<type>: <description>"
```

If invoked from `strike`, include the issue reference in the commit message.

Skip if: not a git repo, no changes to commit, or PLAN route already produced per-task commits.

### Step 2: Branch decision

Present 4 options to the user:

1. **Local merge** — Solo project, no PR review process, work is complete. Merge the branch into main.
2. **Open PR** — Team workflow, code review required. Push the branch and create a PR.
3. **Keep branch** — Work is paused or not ready to merge. Leave the branch as-is.
4. **Discard** — Work is throwaway (e.g., informed a decision but won't be shipped). Delete the branch.

If invoked from `strike`, note that strike will handle status transition after this step.

Do NOT auto-merge or auto-push without the user's explicit choice.

### Exit gate

- `git status` confirms clean working tree (or intentionally kept changes for "Keep branch").
- User has made an explicit branch decision.

---

## Caller integration

### From `mekaknight:strike`

- Clarify receives the issue title + body as starting context
- All phases proceed normally
- On completion, control returns to strike for Notion status transition

### Standalone usage

- User provides the problem description as argument, or a plan file path for cross-session pickup
- All phases proceed normally
- On completion, summarize what was done

---

## Abort handling

If the user interrupts at any phase:
- Work completed in prior phases (docs, tests, code) persists in the working tree
- Resume by running `/forge` again with the same context or plan file path
- No automatic state tracking — the user decides where to pick up
