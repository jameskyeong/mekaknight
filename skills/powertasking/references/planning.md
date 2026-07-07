# PLAN Routing Discipline — Plan Files as Contracts

Reference for powertasking's **Route → PLAN** sub-step. The Route section of `SKILL.md` defines the surface mechanics (write a plan file, user confirms, docs checkpoint, sequential execution). This document is the deeper discipline — what makes a plan file actually executable, how to size tasks so each one is one TDD cycle, and what to do when the plan must change mid-flight.

The non-negotiable: **a plan file is a contract, not a wish list.** It is the artifact the user confirmed and the artifact Build executes against. Vague tasks in the plan produce vague tests in Build; missing exit criteria produce "done" claims that nobody can verify.

---

## Why PLAN exists

DIRECT route handles small contained changes in one Build pass. PLAN exists for the next size up — work that touches multiple files, has internal task dependencies, or spans more time than can fit in a single uninterrupted session. The plan file is what makes that size of work survivable:

- **It captures the agreed scope** in a form that does not depend on shared memory. The user confirmed this file; the Build phase executes this file; the Peer-review phase reads this file as the spec axis.
- **It gives cross-session pickup a home.** When the session ends mid-execution, re-running `/powertasking <plan-file>` resumes from the first incomplete task. No "where were we" reconstruction.
- **It makes scope creep visible.** A plan file with an explicit "Out of scope" section converts scope creep from "the model just added this" to "the model added this contrary to the plan" — surfaceable and reviewable.
- **It separates Decide from Do.** PLAN's first move is "write the plan and confirm." Build is downstream. The decision and the execution are different phases with different costs of error, and PLAN keeps them separated.

The cost of not writing a plan when one is warranted: mid-flight redirections that revert hours of work, scope creep that ships without anyone noticing, and re-Clarify rounds because the agent's mental model of the change drifted from the user's.

---

## Anatomy of a good plan file

The PLAN sub-step in `SKILL.md` names five sections: Goal, Tasks, Dependencies, Out of scope. Plus per-task structure (What / Test / Implement / Verify / Commit). Here is what makes each section actually load-bearing.

### Goal — one sentence

Not a paragraph. Not a list. One sentence that names the outcome of the change. If the goal needs more than one sentence, the work is either too large for a single PLAN (split into two plans) or too vague (re-Clarify).

Good: "Add password reset via email link with 1-hour expiry."
Bad: "Improve the auth system to be more user-friendly and add some new flows."

### Tasks — each task is one TDD cycle on a contained surface

Each task should produce one passing test (or a small cluster of related passing tests for the same behavior). If a task description sounds like multiple cycles, split. If two adjacent tasks sound like the same cycle, merge.

Each task carries five fields:

- **What** — one sentence describing the change.
- **Test** — the failing test (or test name) that drives this task.
- **Implement** — the surface that will change to make the test pass.
- **Verify** — the specific command and the observed output that proves the task is done.
- **Commit** — the commit message for this task (per `references/finishing.md` conventions).

Skipping any of these fields produces a task that cannot be executed without re-Clarify. A task with no "Test" is a wish; a task with no "Verify" cannot have its done-ness audited.

### Dependencies — explicit, not implicit

Name which tasks block which. "Task 3 depends on Task 1" is the form. Hidden dependencies (Task 3 silently requires Task 1's API surface that the plan did not describe) produce mid-execution surprises.

If a dependency is conditional ("Task 5 only if Task 4 surfaced an issue"), state that too. The plan is allowed branches; what it does not have is unstated ones.

### Out of scope — the cheapest scope guard

Out of scope is the single most-skipped section in plan files. It costs one minute to write. It saves hours when "while we're here" temptation hits during Build.

The discipline: name the **three closest neighboring features** that this plan is *not* doing. "Add password reset" — out of scope: account deletion, change-email flow, 2FA setup. These are the features that are mechanically nearby and the most likely scope creep candidates.

If a plan has no "Out of scope" section, the scope is wishful — defined only by what the plan does mention, with no fence around what it does not.

### Verification — overall, not just per-task

In addition to per-task Verify, the plan has an overall Verification section: what proves the *whole change* works together. For a multi-task feature, this often includes an integration test or an end-to-end smoke test that no single task produced. Stating it in the plan ensures it is built (or named) rather than assumed.

---

## Task sizing — rules of thumb

A task is right-sized when it can be completed in one RED → GREEN → REFACTOR cycle on a small surface. Signals you are off:

### Too large

- The "Test" field describes multiple test cases.
- The task description contains "and" connecting two distinct behaviors.
- The "Implement" surface spans more than 2-3 files.
- After completing the task, the diff is more than ~100 lines of production code.
- The task would take more than a single uninterrupted Build pass.

Split into: one task per failing test you would have to write.

### Too small

- The "Test" field is "no test needed, just rename."
- The task's commit would be `chore: bump version`.
- The task is one line of code.

Merge with the adjacent task that motivated it.

### Right-sized examples

- "Add `POST /auth/reset/request` endpoint that accepts an email and returns 202 if the email exists."
- "Add token generation and storage with 1-hour expiry."
- "Add `POST /auth/reset/confirm` endpoint that validates the token and updates the password."

Each is one cycle. Each has a clear test. Each commits independently.

---

## Dependencies — recognizing them

The most common dependency pattern: Task N produces an API surface that Task N+1 consumes. The plan should explicitly say "Task N+1 depends on Task N" so Build runs them in order.

Other patterns:

- **Schema before queries.** If Task 1 adds a column and Task 2 queries the column, Task 2 depends on Task 1.
- **Type before usage.** If Task 1 adds an exported type and Task 2 uses it, Task 2 depends on Task 1.
- **Service before consumer.** If Task 1 builds a helper and Task 2 calls the helper, Task 2 depends on Task 1.

Independent tasks (no shared state, no consumed API) can be executed in any order. The plan can note "Tasks 3 and 4 are independent" — useful for parallel work or for resuming from either side mid-session.

---

## Anti-patterns

### Vague task

"Implement auth." This is a feature, not a task. No failing test would drive "implement auth" — it is too large. The plan that contains this has not done the work of sizing.

The fix: every task is named at a level where you could open a code editor and write a single failing test for it right now. If the failing test does not come to mind in 30 seconds, the task is too vague.

### Too-large task

"Add user signup flow with email verification and welcome email and session creation and rate limiting." This is five tasks, not one. Build would either execute it as one giant scope-creeping cycle, or stall trying to figure out which test to write first.

The fix: read the task description out loud. Every "and" is a candidate split point.

### No exit criteria

A task with no "Verify" field. Build's exit gate cannot fire because there is no command to run and no output to observe. The agent ends up declaring done by feel, which violates `references/verification.md`'s discipline.

The fix: every task has a "Verify" line naming the exact command and the expected observation. If the task's verification is hard to name, that is the signal that the task is fuzzy.

### Hidden dependencies

The plan lists Task 3 before Task 5, but Task 5 is what actually defines the function Task 3 calls. Build executes Task 3 first, fails, gets confused, possibly stubs out the missing function — and now there is a placeholder in production code that nobody planned.

The fix: trace each task's "Implement" surface to its "What" — does it depend on a surface that does not exist yet? If so, declare the dependency.

### Plan-as-document instead of plan-as-contract

The plan was written, the user confirmed, Build started — and then halfway through, the implementation drifted from the plan because "we figured it out as we went." The plan is now a document of what we *thought* we would do, not what we did. Peer-review against the plan becomes meaningless.

The fix: when execution diverges from the plan, **stop and update the plan**, do not silently drift. The update is short ("Task 4 reworked: the cleaner shape turned out to be X instead of Y. User confirmed at <timestamp>."). The point is the plan stays the contract; the execution stays auditable against it.

### Scope creep allowed at write-time

The plan author thinks "we should also add X while we are in here" and adds X to the plan. The user confirms the plan as written, thinking X is required. Now the scope is bigger and nobody flagged it.

The fix: if X was not in Clarify, X does not go in the plan. If X seems important enough to add, take it back to Clarify ("X seems related; should we include it?") and let the user decide.

### Out of scope omitted

The plan has no scope guard. Mid-Build, the agent adds adjacent functionality "because it's almost free." There is no plan section to compare against; the scope creep is invisible.

The fix: every plan has the Out of scope section, even if it is short. "Out of scope: account deletion, OAuth, password strength rules" is enough — three sentences that block the three nearest temptations.

---

## Edge cases

### Mid-execution discovery requires plan change

Build is on Task 3 and discovers Task 5 depends on a surface that does not exist. The discipline:

- Stop Build at the end of the current task (do not start Task 5 yet).
- Surface the discovery to the user: "Task 5 needs surface X, which the plan did not include. Options: add Task 4.5 to create surface X, or restructure Task 5 to not need it."
- Update the plan file with the user's choice. Capture the change in the plan ("Updated: added Task 4.5 — create surface X. Confirmed at <timestamp>.").
- Resume Build with the updated plan.

The change is logged, not silently absorbed. The plan stays the truth.

### User adds a task mid-flight

The user says "while you are in there, also add Y." The discipline:

- Check whether Y was in Clarify. If yes, it was already in scope — add the task and proceed.
- If Y was not in Clarify, this is a scope addition. Surface it: "Y is new scope. Adding Task N+1: Y. Confirm?"
- After confirmation, update the plan file and resume.

Even small mid-flight additions go through plan-update. The discipline is the audit trail, not the size of the change.

### Task turns out to be wrong

Build executes Task 3 and the test the plan named cannot be written, or fails for reasons that mean the task itself was misconceived. The discipline:

- Stop Build. Do not "force it through" with a different test than the plan named.
- Surface the issue to the user with the specific reason: "Task 3 names test X; X cannot be written because Y. Options: rewrite Task 3 with a different test, or restructure the change so X becomes writeable."
- The fix is a plan update, not a silent improvisation.

### Cross-session resume

The session ends after Task 4. The user resumes hours or days later with `/powertasking docs/plans/<github-id>/<feature>.md`. The discipline:

- Re-read the plan file as the source of truth.
- Scan the working tree to detect which tasks have already been completed (test files exist, commits present).
- Identify the first incomplete task by scanning the plan top-down for "no commit yet" or "no test file yet."
- Resume from that task; do not re-do completed ones.
- If the working tree shows partial progress on an incomplete task, surface it to the user: "Task 5 has partial state in the working tree. Continue from here, or revert and restart Task 5?"

The plan file makes resume mechanical. Without the plan file, resume would require the user to reconstruct mental state.

### Plan file outlives the change

After Finish, the plan file is still on disk in `docs/plans/`. The discipline is not to delete it — it is a record of how this change was decided and executed. Future contributors reading `git blame` on the changed files will follow the commit messages, which can reference the plan file. The plan file is documentation of the decision, not just scaffolding.

---

## The exit gate sentence

The Route → PLAN exit gate per the SKILL.md table:

> **Route (PLAN only): User confirms plan file.**

In evidence form:

> Plan written at `docs/plans/<github-id>/<slug>.md`. User confirmed at `<timestamp>`: "`<exact user quote>`."

If a docs checkpoint commit was made, the gate also records:

> Docs checkpoint at SHA `<sha>` (commit message: `<message>`).

If the sentence cannot be stated with the plan path, the user quote, and the optional checkpoint SHA, the PLAN sub-step has not exited.

---

## Relationship to powertasking's other phases

- **Clarify** produces the Goal sentence and the constraint context that PLAN turns into tasks. Vague Clarify produces vague Goal, which produces tasks that cannot be sized — so the deepest source of plan-quality is Clarify-quality.
- **Build** executes the plan task by task. The plan's per-task "Test" and "Verify" fields become Build's exit gate inputs. A plan with no Verify cannot have a clean Build exit.
- **Peer-review** reads the plan file as the Spec axis. A plan with Out-of-scope omitted weakens Peer-review's ability to detect scope creep — the reviewer has no fence to compare the diff against.
- **Verify** runs the overall verification section, plus the standard typecheck / lint / test suite. A plan's overall Verification section names the integration check no single task produced.
- **Finish** reads the plan to know whether the work product matches what was agreed. If the executed diff diverges from the plan and the plan was not updated to match, Finish surfaces the divergence as a decision point — typically Keep branch or Discard, not Local merge.
