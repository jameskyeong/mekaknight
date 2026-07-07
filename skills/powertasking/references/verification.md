# Verification — Evidence Before Assertion

Reference for powertasking's **cross-cutting verification gate** and every phase that ends in a completion claim. The gate in `SKILL.md` defines the surface rule (run the check, read the output, then state what passed). This document is the deeper discipline — why the rule exists, the subtle ways agents and humans break it without noticing, and what to do at each gate.

The non-negotiable: **a completion claim is a statement about what you observed, not about what you expect.** Anything less is a confession of soft language — the model output equivalent of saying you went to the gym without actually going.

---

## The core principle

A completion claim has three components, in this order:

1. **What you ran** — the exact command, the exact context, the exact arguments.
2. **What you observed** — the actual output, not a summary, not a paraphrase, not "it passed."
3. **What you conclude** — drawn from (1) and (2), not from prior expectation.

If any of the three is missing, the claim is not verified — it is asserted. The difference matters because asserted "completions" pile up into work that has to be redone later, often at the worst possible time (a deploy, a user report, a regression).

---

## Forbidden language — and why each is forbidden

The cross-cutting gate in `SKILL.md` lists banned phrases. Here is why each is banned, what it usually masks, and the replacement.

| Banned phrase | What it usually masks | Replacement |
|---|---|---|
| "should work" | The agent reasoned about the change but did not run it | "I ran `<command>` and observed `<output line>`" |
| "seems to pass" | The agent ran the command but did not actually read the output | "I ran `<command>` and the output's last line was `<exact text>`" |
| "probably fixed" | The agent has a hypothesis but no evidence | "I reproduced the original failure with `<repro command>`, then ran `<fix verification command>` and observed `<output>`" |
| "I think it passes" | Hedging on a claim the agent did not verify | Either verify and remove the hedge, or state explicitly "I did not verify this — the next step is to run `<command>`" |
| "looks correct" | A read of the code, not a run of it | "I ran `<command>` and observed `<output>`" |
| "this should be fine" | Confidence projection without evidence | Either run the check, or admit "I have not checked X" |
| "likely works" | Probabilistic hedging — the agent does not know | Either run the check, or write "unverified" explicitly |

The pattern: every banned phrase substitutes confidence for evidence. The replacement is always "I ran X and saw Y" or "I have not checked Z."

### The "I have not checked" exception

It is fine, expected, and often necessary to say "I have not checked X." That is a clean, evidence-based statement — it just happens to be evidence about what was not done. Stating it explicitly is much better than hedging language because it gives the user a clear action item ("then check X next") rather than a vague gradient of confidence.

The discipline is not "claim everything works" — it is "do not claim anything works without evidence." Saying "I have not checked X" is fully compatible with the discipline.

---

## Observation patterns

The act of "reading the output" is where most verification quietly fails. Subtle versions of skipping this step:

### Reading a summary instead of the output

A subagent reports "all tests passed" — but the actual output, if you read it, shows 47 passed and 2 skipped. The skipped tests might be the ones that would have caught the bug you just introduced. **A subagent's summary is not evidence**; the output the subagent observed is. Ask for the raw output or run the command yourself.

### Reading only the first or last line

A pytest run prints `1 passed in 0.42s` at the end — but the run printed `Warning: deprecated mock usage` two lines earlier, which is the only sign that the test you thought you wrote is actually hitting a stub. Read enough of the output to know that the relevant signal is there, not just the summary line.

### Remembering a prior run

"I ran the tests a minute ago and they passed." Probably true, probably irrelevant — the question is whether they pass *now*, after the most recent change. Re-run.

### Reading the wrong output

The command was `npm test`, but the project actually has two test suites and `npm test` only runs the unit suite. The integration suite, which would have caught the bug, was not run. The discipline includes verifying that the command you ran exercises the thing you claim to have verified.

---

## Disguised verification — common ways the gate gets faked

These are the verification anti-patterns that look correct on a first read but are actually unsupported claims dressed up as evidence.

### Quoting the command without quoting the output

> "I verified by running `npm test`."

This is half a verification. The command is one of the three components; the observed output is missing. The reader cannot tell whether the command succeeded, hung, errored, or produced ambiguous results.

The fix: "I ran `npm test`. The last lines of output were: `Tests: 12 passed, 12 total`." Now the reader can audit the claim.

### Asserting completion from successful execution

> "The script ran without errors, so the migration completed."

A script can exit zero and still have done the wrong thing — silently skipping rows, writing to the wrong table, applying the migration to a stale schema. "No error" is necessary but not sufficient evidence of "the thing succeeded." Verify the post-state.

### Running tests in a different environment than the one being claimed

> "Tests pass locally, so this is ready for staging."

Local pass and staging pass are different claims. They might be correlated, but environmental differences (env vars, services, data fixtures) can make one green while the other is red. State the claim's scope precisely: "tests pass locally" is honest; "this is ready for staging" requires staging evidence.

### Partial-output reads

The full output had a stack trace at line 47; you read lines 1-10 and the last 5. The trace got missed. The fix is not "read every line of every run" — it is "scroll through enough of the output to know that no signal is hiding in the middle." For long outputs, search for `error`, `warn`, `fail`, `skip`.

### Trusting subagent claims of success

A dispatched agent reports "task completed, tests pass." The claim might be true, but it is a claim, not evidence. Treat subagent reports the same way you would treat any other unverified claim: either trust the work product (read the diff yourself, run the tests yourself) or do not.

The cleanest version: structure subagent prompts to require evidence in the response. "Report the exact final lines of the test output, and the exact diff stat (X files changed, Y insertions, Z deletions)." That converts the subagent's claim into something the orchestrator can audit.

---

## Per-phase verification commands

Every powertasking phase has an exit gate. Here is what "evidence" looks like at each gate.

### Preflight
- **What to verify:** git repo present, test runner detected, optional checkers noted.
- **Evidence pattern:** Output of `git rev-parse --git-dir` (returns `.git` or similar), output of the `cat package.json` / `cat Makefile` / equivalent showing the test script, output of optional-checker presence checks.
- **Forbidden:** "the environment looks fine."
- **Acceptable:** "I ran `git rev-parse --git-dir` and observed `.git`. I read `package.json` and saw `\"test\": \"vitest\"`."

### Clarify
- **What to verify:** the ambiguity checklist reached 0 items, **and** the user explicitly confirmed.
- **Evidence pattern:** Restate the resolved checklist; quote the user's confirmation.
- **Forbidden:** "requirements seem clear enough."
- **Acceptable:** "Ambiguity checklist after iteration 3: 0 items. User confirmed at <timestamp>: 'yes, proceed.'"

### Route (PLAN only)
- **What to verify:** the user confirmed the plan file's contents.
- **Evidence pattern:** path to the plan file; quote the user's confirmation.
- **Forbidden:** "the plan looks reasonable."
- **Acceptable:** "Plan written at `docs/plans/<github-id>/<slug>.md`. User confirmed: 'good, go ahead.'"

### Build (per task)
- **What to verify:** the failing test now passes; previously-passing tests still pass.
- **Evidence pattern:** the test runner's exact summary line and (for the specific test) the test name and pass status.
- **Forbidden:** "the test passed", "tests are green."
- **Acceptable:** "Ran `pnpm test src/auth.test.ts`. Observed `✓ auth > rejects empty username (3 ms)`. Ran full suite `pnpm test`. Observed `Tests: 47 passed, 47 total`."

### Peer-review
- **What to verify:** every Critical and Important finding has been addressed (fixed in code, or explicitly user-deferred).
- **Evidence pattern:** list each finding by file:line, state the action taken or the deferral, link to the new commit if applicable.
- **Forbidden:** "review findings handled."
- **Acceptable:** "Critical: src/auth.ts:42 — fixed in commit `<sha>`, re-ran tests, observed `Tests: 47 passed`. Important: src/auth.ts:88 — user deferred to follow-up issue."

### Verify
- **What to verify:** typecheck (if available), lint (if available), full test suite, architecture check — every check green.
- **Evidence pattern:** one line per check, naming the command and the observed summary line.
- **Forbidden:** "all checks pass."
- **Acceptable:**
  > Ran `tsc --noEmit`. Observed: no output (success).
  > Ran `eslint .`. Observed: `✨ 0 problems`.
  > Ran `pnpm test`. Observed: `Tests: 47 passed, 47 total`.
  > Architecture: read changed files; observed no single-responsibility violation, no orphaned imports.

### Finish
- **What to verify:** `git status` shows the intended state (clean tree if committed; expected uncommitted files if "Keep branch"); user has made the branch decision.
- **Evidence pattern:** output of `git status`; restate the user's branch choice.
- **Forbidden:** "branch is ready."
- **Acceptable:** "Ran `git status`. Observed: `nothing to commit, working tree clean`. User chose: 'open PR'."

---

## When the check cannot be run

There are situations where the standard verification command is unavailable: the test suite is too slow to run repeatedly, the change is visual, the change touches infrastructure that cannot be exercised locally. The discipline does not vanish — it shifts.

### UI / visual changes
- **Substitute evidence:** before/after screenshot, ideally side by side; a description of what visibly changed.
- **What still applies:** if the change has any behavior (event handlers, state transitions), that behavior gets a unit test under normal TDD.
- **Forbidden:** "the layout looks better now."
- **Acceptable:** "Before: <screenshot or description>. After: <screenshot or description>. The button is now centered within its parent container."

### Long-running suites
- **Substitute evidence:** run the targeted subset for the changed area; explicitly note the wider suite was not run.
- **What still applies:** the full suite must run before Finish or in CI.
- **Forbidden:** "ran the relevant tests."
- **Acceptable:** "Ran `pnpm test src/auth/`. Observed: 14 passed. The full suite was not run in this session — CI will run it on push."

### Infra / external services
- **Substitute evidence:** dry-run output, plan output (Terraform `plan`, migration `--dry-run`), sandbox/staging execution.
- **What still applies:** the actual change must be verified against the actual environment before being declared shipped.
- **Forbidden:** "the migration should be safe."
- **Acceptable:** "Ran the migration in the staging environment. Observed schema change applied without error. The production migration is queued separately for the deploy window."

---

## The verification sentence

The clearest signal of a verified claim is its grammar. The verified form is:

> **I ran `<command>` and observed `<output>`. Therefore `<conclusion>`.**

Read out loud, this sentence forces three statements: action, observation, inference. Anything that skips one of the three lands as soft language even if it does not contain a banned phrase.

A bad verification often has the inference without the action and observation:

> "The endpoint works now."

A good verification has all three:

> "I called `POST /auth/login` with the test credentials from `fixtures/users.json` and observed a 200 response with a non-empty `token` field. Therefore the login endpoint accepts those credentials and returns a token."

The good version is longer. That is the point — the length is the evidence.

---

## Relationship to powertasking's other phases

- **Build's exit gate** is a verification gate. The TDD loop is not a substitute for verification — it is the engine that produces the evidence the verification gate then reads.
- **Peer-review** reads the diff and may issue findings. Those findings themselves require verification before being marked resolved — "fixed" without re-running the tests is the same anti-pattern in miniature.
- **Verify phase** is the largest single verification gate. Everything in this document applies; the gate is "every check above is green, output directly observed for each."
- **Finish** has the lightest gate (`git status` clean), but the discipline is the same: run the command, read the output, state the conclusion.
