# DIAGNOSE Discipline — Bug-First Workflow

Reference for forge's **DIAGNOSE route**. The Route → DIAGNOSE section of `SKILL.md` enforces the phase order (Reproduce → Minimize → Investigate → Fix → Regression-prevent). This document is the deeper discipline — why each step exists, the anti-patterns that turn diagnosis into guess-and-check, and what to do at the edges (cannot reproduce locally, intermittent bugs, production-only data).

The non-negotiable: **a fast, deterministic pass/fail signal that captures the bug — ideally a failing test — is the goal of Reproduce.** Everything after Reproduce is downstream of that signal. Changing code without a failing signal that proves the change matters is guess-and-check dressed up as fixing.

---

## Why DIAGNOSE is a route, not just "use DIRECT"

Bug work has a phase order that feature work does not. In DIRECT/PLAN, the failing test comes from desired behavior; in DIAGNOSE, the failing test comes from a current misbehavior. The investigation step that sits between "I have a failing test" and "I have a fix" is the part that distinguishes bug work — and it is the part where most undisciplined diagnosis goes wrong (changing code without a hypothesis, trying multiple fixes simultaneously, declaring victory when the symptom disappears for unrelated reasons).

A dedicated route makes the phase order visible. The discipline is then: do not skip Reproduce in favor of jumping to Investigate; do not skip Investigate in favor of jumping to Fix; do not skip Regression-prevent in favor of "the symptom is gone."

---

## The five steps

### 1. Reproduce — build the feedback loop

This step is where diagnosis is won or lost. A fast, deterministic, agent-runnable pass/fail signal for the bug is what every later step consumes — bisection, hypothesis-testing, and fix-verification all just run the loop. Spend disproportionate effort here; be aggressive and creative before concluding a loop cannot be built.

The goal: a signal that fails *because of the bug* — not because of setup, not because of a typo, not because of an environment difference. When the signal passes, the bug is fixed; when it fails, the bug is present.

**Loop-construction menu — try in roughly this order:**

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e. The preferred form: it enters the suite at Regression-prevent with no translation.
2. **HTTP script** (`curl` or equivalent) against a running dev server, asserting on status and body.
3. **CLI invocation** with a fixture input, diffing output against a known-good snapshot.
4. **Headless browser script** that drives the UI and asserts on DOM, console, or network.
5. **Trace replay** — capture a real request / payload / event log to disk; replay it through the code path in isolation.
6. **Throwaway harness** — a minimal subset of the system (one service, stubbed deps) that exercises the bug's code path with a single call.
7. **Fuzz loop** — for "sometimes wrong output" bugs, run hundreds of randomized inputs and detect the failure mode.
8. **Bisection harness** — if the bug appeared between two known states (commit, dataset, version), automate "check state X" so `git bisect run` can consume it.
9. **Differential run** — same input through old vs new version (or two configs), diff the outputs.

**Iterate on the loop itself.** Once a loop exists, sharpen it: faster (cache setup, narrow the scope), sharper signal (assert on the specific symptom, not "didn't crash"), more deterministic (pin time, seed RNG, isolate the filesystem). A 2-second deterministic loop is a different tool than a 30-second flaky one.

**Non-deterministic bugs:** the goal is a *higher reproduction rate*, not instant cleanliness. Loop the trigger 100×, add stress, narrow timing windows. A 50%-reproduction bug is debuggable; a 1% bug is not — raise the rate first. (See the intermittent-bug edge case below.)

**If no loop can be built:** stop and say so explicitly — list what was tried, then ask the user for environment access, a captured artifact (HAR file, log dump, recording), or permission for temporary instrumentation. Do not proceed to Investigate without a loop; hypotheses without a signal to test against are vibes.

The loop does not need to be elegant. It needs to be deterministic and bug-specific. Elegance comes in Minimize.

**Exit condition**: the loop runs, fails, and the failure points at the bug. If the failure points at a setup error or a fixture issue, Reproduce has not exited — fix the setup first.

### 2. Minimize — trim the reproduction

The Reproduce test may be larger than the bug. It might walk through five steps when only step 3 triggers the bug. Minimize trims until the test exercises *only* the bug-causing surface.

The discipline:
- Remove one fixture / one step / one input field at a time.
- After each removal, re-run the test. If it still fails, the removal was safe. If it now passes, the removed piece was load-bearing — restore it.
- Stop when further removals make the test pass (because the test no longer exercises the bug).

The minimized test is the regression net. After the fix, this test stays in the suite; it is what prevents this specific bug from recurring.

**Exit condition**: the test still fails, and no further removal would keep it failing without changing the bug-relevant surface. The minimized test should be readable in under 60 seconds.

### 3. Investigate — hypothesis-driven code reading

With the minimized failing test in hand, the next step is *not* to change code. It is to form a hypothesis about why the bug occurs, then read the code to confirm or refute the hypothesis.

The discipline:
- State the hypothesis explicitly. "The bug happens because function X returns a stale value when input Y is reset between calls."
- Read the relevant code to check the hypothesis. Use the minimized test as the breadcrumb — follow the code path the test exercises.
- If the hypothesis is confirmed: proceed to Fix.
- If the hypothesis is refuted: form a new hypothesis (do not start changing code to "see what happens"). Repeat.

A diagnosis without a hypothesis is guess-and-check. The model tries fix A; if it does not work, tries fix B; eventually one of them makes the symptom go away. This often "works" — but the root cause has not been understood. The fix may mask the symptom rather than address the underlying issue, and the bug returns in a different form later.

**Exit condition**: a confirmed hypothesis stated as one sentence. "The bug is in X, caused by Y, fixable by Z."

### 4. Fix — minimum change that makes the test pass

Standard GREEN discipline from `references/tdd-discipline.md`. The change is the smallest code modification that makes the minimized Reproduce test pass without breaking other tests.

- Resist the urge to "improve the surrounding code while I'm here." That is scope creep at GREEN.
- Resist the urge to fix related-but-different bugs the investigation surfaced. Capture them as follow-up issues; address them in a separate cycle.
- The Fix is exactly the surface the confirmed hypothesis identified, nothing more.

**Exit condition**: minimized test passes, full suite still passes, output observed directly.

**Circuit breaker — count your failed fixes.** A fix that does not make the minimized loop pass means the hypothesis was wrong or incomplete: return to Investigate with what the failure taught you. But track the count. After the **third** failed fix attempt, STOP — do not attempt fix #4. The telltale pattern: each fix reveals new coupling, new shared state, or a new symptom in a different place; each fix needs "just one more" adjacent change. That pattern is not a failed hypothesis — it is a wrong architecture around the bug. Surface it to the user, with the three attempts as evidence, and discuss restructuring before any further fixing.

### 5. Regression-prevent — the test stays

The minimized Reproduce test enters the suite permanently. It is the only thing that prevents the exact same bug from recurring.

The discipline:
- If the Reproduce loop was not a test (HTTP script, harness, bisection run), convert the minimized reproduction into a test at the closest seam now. If no seam can host it, that absence is itself a finding — record it alongside the fix as an architecture gap.
- The test is committed alongside the fix.
- The test is not modified later "to clean it up" in a way that would make it stop exercising the original bug.
- If the test exercises an edge case the rest of the suite does not (test data, fixture state), that fixture stays too.
- If the bug had a tracking number (issue, incident report), the test's name or comment includes it. Future readers should be able to trace the test back to the bug it prevents.

**Exit condition**: the test is in the committed diff; the diff also contains the fix; the full suite is green.

---

## Anti-patterns

### Changing code without a hypothesis

The model sees the symptom, opens the file, and starts modifying. The modifications are not driven by a model of why the bug occurs; they are driven by pattern-matching to plausible-looking suspect lines. Sometimes one of them happens to fix the symptom — but the bug's root cause has not been understood, and the same root cause will produce different symptoms later.

The fix: every code change in DIAGNOSE traces back to a stated, confirmed hypothesis. If you cannot state the hypothesis as one sentence, you do not understand the bug yet; return to Investigate.

### Hypothesis-shopping

The model forms hypothesis A, makes a change to test it, the test still fails, so the model forms hypothesis B, makes another change, and so on. Each change is "test the hypothesis"; the working tree accumulates speculative changes; eventually one of them works for unrelated reasons.

The fix: hypothesis confirmation happens by *reading*, not by changing. Investigate is a code-reading step; code-changing is Fix. If you find yourself testing a hypothesis by editing code, you are in the wrong step.

### "Fixing" the test instead of the bug

The Reproduce test fails. The model modifies the test until it passes — adjusting assertions, loosening the comparison, skipping the bug-triggering input. The bug is now invisible to the test suite.

The fix: the test asserts the user-observed correct behavior, not the current (buggy) behavior. If the test passes against buggy code, the test is wrong. The exit condition for Reproduce includes that the test fails *because of the bug*; if the test starts passing without the bug being addressed, Reproduce has been broken.

### Declaring victory when the symptom disappears

The model makes a change, runs the user's reproduction steps, the original symptom is gone. The model declares the bug fixed. But the model did not have a minimized Reproduce test, so it does not know whether the symptom is gone because the bug is fixed or because something incidental changed (cache cleared, restart happened, parallel side effect).

The fix: the minimized test is mandatory before declaring fixed. Symptom-disappeared-after-changes is not evidence; minimized-test-now-passes is.

### Patching one symptom of a deeper bug

The bug has multiple surface symptoms (different error messages in different code paths, all caused by the same underlying issue). The model fixes one symptom without recognizing the others share a root cause. The other symptoms recur weeks later as "new" bugs.

The fix: during Investigate, the hypothesis should account for *why* the symptom appears in the user's reported scenario. If the hypothesis points at a deeper cause that could surface in other scenarios, surface that to the user — "this hypothesis explains the user's symptom but also predicts the same root cause could produce X and Y. Worth checking those before declaring fixed?"

### Changing more than the hypothesis identifies

The hypothesis was about function X. The diff also rewrites function Y, function Z, and adds a new helper. The fix is now entangled with unrelated changes; the reviewer cannot tell which line addresses the bug and which is unrelated.

The fix: the Fix step is scoped to the hypothesis. Unrelated changes go in separate cycles.

### Forgetting the regression test

The fix works; the symptom is gone; the model declares done — without committing the minimized test that exercises the bug. Next time someone refactors that code path, nothing in the suite catches the regression.

The fix: the test enters the suite at the same commit as the fix. The Regression-prevent exit condition includes the test's presence in the diff.

---

## Edge cases

### Cannot reproduce locally

The bug exists in production / on the user's machine / in CI, but not locally. Reproduce cannot exit on the standard path. Options:

- **Capture the environmental difference.** Diff your local env against the failing env (env vars, dependency versions, OS, data fixtures). The bug often lives in that difference.
- **Run the test against the failing environment.** If the bug is in CI only, push a branch with the test and observe it fail in CI.
- **Stub the environmental piece.** If the bug requires production data, build a local fixture that mimics the production data shape that triggers the bug.

Until you have *some* test that reliably fails because of the bug, DIAGNOSE has not started.

### Intermittent bug

The bug occurs sometimes and not others. Reproduce that fails 1-in-10 runs is not yet a deterministic failing test. Options:

- **Identify the source of nondeterminism.** Race conditions, time-of-day dependencies, randomized inputs, concurrent state. The intermittency is itself a signal about the root cause.
- **Force the bug-triggering condition.** If it is a race, add timing controls; if it is randomization, fix the seed; if it is timing, advance the clock deterministically.
- **Accept low-but-real fail rate temporarily.** If the bug really cannot be made deterministic, document that the regression test catches it 1-in-N runs, and accept that nondeterministic catch is better than no catch.

A flaky regression test is bad practice in general; for diagnosis purposes, a flaky test that surfaces a real bug 10% of the time is better than no regression net at all.

### Reproduction requires production data

The bug only manifests against a specific row, account, or state in production. Cannot move that data to local environments due to privacy / size / compliance.

- **Anonymize a fixture.** Capture the shape of the production state that triggers the bug; create a synthetic fixture with the same shape and no real data.
- **Build a generator.** If many production states could trigger the bug, generate fixtures programmatically until one triggers.
- **Reproduce in staging.** If staging has data that matches the shape, run the failing test there.

Direct production debugging (logging, reading production state) is *investigation*, not Reproduce — useful for forming the hypothesis but not a substitute for the minimized test.

### Bug is in a dependency

The root cause is in a third-party library, not in your code. Options:

- **Upstream fix + workaround.** File the bug upstream; in the meantime, add a workaround in your code that prevents the buggy library behavior from being triggered.
- **Pin a version.** If the bug was introduced in a recent version, pin to the last known-good version with a TODO to upgrade when fixed upstream.
- **Replace the dependency.** Sometimes the bug indicates a library is not maintained or has architectural issues; the long-term fix is replacement.

The minimized Reproduce test still goes in your suite — it exercises *your code's protection against the bug*, even if the underlying bug is elsewhere.

### Hypothesis points at intended behavior

You investigated, formed a hypothesis, confirmed it — and the hypothesis says "the code is doing exactly what it was designed to do; the user's expectation was wrong." This is not a bug; it is a specification disagreement.

The fix: surface the disagreement to the user. "The code does X by design (see <code>, <ADR>, <comment>). Your expected Y conflicts with this. Should we change the design (then we need to clarify the new design), or is your expectation incorrect (then there is no bug)?"

Do not silently change the design under the cover of a "bug fix." Design changes deserve their own Clarify pass.

---

## The exit gate sentence

Per `references/verification.md` evidence form:

> **Reproduce**: ran `<test command>`. Observed: `<exact failure output>`. Test asserts: `<one-sentence summary of what the test expects>`.
>
> **Minimize**: removed `<X removals>`; remaining test exercises only `<bug-relevant surface>`. Final test runs in `<time>`.
>
> **Investigate**: hypothesis (confirmed by reading `<files:lines>`): `<one sentence>`.
>
> **Fix**: changed `<files:lines>`. Ran the minimized test. Observed: `<pass output>`. Ran full suite. Observed: `<pass output>`.
>
> **Regression-prevent**: minimized test committed at `<sha>` alongside the fix.

If any of the five sentences cannot be stated, the corresponding step has not exited.

---

## Relationship to forge's other phases

- **Clarify** runs before DIAGNOSE selects the route — the user's reported bug becomes the input to Reproduce. A vague bug report ("something is broken") cannot start DIAGNOSE; Clarify narrows until "the failing test would look like X" is possible.
- **Build** is folded into DIAGNOSE's Fix step (which is GREEN discipline applied to the minimized Reproduce test). The TDD discipline from `references/tdd-discipline.md` fully applies.
- **Peer-review** still runs after the fix, with the diff being the fix + the regression test. The reviewer's spec axis is the bug report; the standards axis is unchanged.
- **Verify** runs the full suite plus the new regression test. The minimized test joins the full suite permanently from this point on.
- **Finish** has the same four branch options. Local merge / Open PR / Keep / Discard apply identically to bug fixes as to feature work.
